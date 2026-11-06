// Local forward proxy that binds each connection to the address it validated.
// Chromium and Playwright's route.fetch() send CONNECT host:port to the context proxy
// instead of resolving the name themselves, so the address checked here is the
// address connected to: a later DNS answer (rebinding) cannot redirect the socket.
// TLS stays end to end between the client and the origin (SNI and certificate checks
// use the original hostname); the proxy only relays bytes.
import http from 'node:http';
import net from 'node:net';
import { lookup as dnsLookup } from 'node:dns/promises';
import { networkHost, ipBlockReason } from './_network.mjs';

export class PinningBlocked extends Error {}

/**
 * Resolves `hostname` once and returns every validated candidate, or throws PinningBlocked.
 * Every returned address must pass the IP policy; one forbidden answer blocks the name.
 * With `allowUnresolvedDns`, a failed lookup returns [hostname] (no validation, no pinning).
 */
export async function resolvePinnedAddresses(hostname, { allowPrivate = false, allowUnresolvedDns = false, lookup = dnsLookup, timeout = 2000, targetCheck = () => null } = {}) {
  const host = networkHost(hostname);
  const literal = net.isIP(host) ? host : '';
  const reason = targetCheck(`https://${literal.includes(':') ? `[${literal}]` : host}/`);
  if (reason) throw new PinningBlocked(reason);
  if (literal) return [literal];
  let addresses, timer;
  try {
    addresses = await Promise.race([
      lookup(host, { all: true, verbatim: true }),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('DNS timeout')), timeout); }),
    ]);
  } catch { addresses = null; }
  finally { clearTimeout(timer); }
  if (!Array.isArray(addresses) || !addresses.length) {
    if (allowUnresolvedDns) return [host];
    throw new PinningBlocked('DNS resolution failed; blocked by policy');
  }
  const accepted = [];
  for (const entry of addresses) {
    const raw = String(entry?.address ?? '').split('%')[0];
    const family = net.isIP(raw);
    if (!family) throw new PinningBlocked('unexpected resolver output is blocked');
    const normalized = family === 6 ? networkHost(new URL(`http://[${raw}]/`).hostname) : raw;
    const blocked = ipBlockReason(normalized, allowPrivate);
    if (blocked) throw new PinningBlocked(`${blocked} (resolved address)`);
    accepted.push(raw);
  }
  return [...new Set(accepted)];
}

/** Compatibility API for callers that only need the first validated address. */
export async function resolvePinnedAddress(hostname, options) {
  return (await resolvePinnedAddresses(hostname, options))[0];
}

// Retry TCP setup only, using the original validated answer set. Never replay HTTP data.
async function connectFirstReachable(addresses, port, track, active) {
  const deadline = Date.now() + 5000;
  for (const host of addresses) {
    if (!active() || Date.now() >= deadline) break;
    try {
      return await new Promise((resolve, reject) => {
        const socket = net.connect({ host, port });
        track(socket);
        const timer = setTimeout(() => socket.destroy(new Error('Pinned connection timed out')), Math.max(1, Math.min(1500, deadline - Date.now())));
        const onClose = () => fail(new Error('Connection closed'));
        const fail = (error) => { clearTimeout(timer); socket.removeListener('close', onClose); socket.destroy(); reject(error); };
        socket.once('error', fail);
        socket.once('close', onClose);
        socket.once('connect', () => {
          clearTimeout(timer); socket.removeListener('error', fail); socket.removeListener('close', onClose);
          if (!active()) { socket.destroy(); reject(new Error('Connection cancelled')); }
          else resolve(socket);
        });
      });
    } catch { /* try another validated address within the shared time budget */ }
  }
  throw new Error('No validated address could be reached');
}

/**
 * Starts the proxy on loopback. `configure()` sets the same policy and lookup used by
 * the request guards, so both layers agree. The server and its sockets never keep the
 * process alive and are closed with `close()`.
 */
export async function startPinningProxy(initial = {}) {
  let policy = { allowPrivate: false, allowUnresolvedDns: false, lookup: dnsLookup, timeout: 2000, targetCheck: () => null, onBlocked: () => {}, ...initial };
  let closed = false;
  const sockets = new Set();
  const track = (socket) => {
    if (sockets.has(socket)) return;
    sockets.add(socket); socket.unref?.();
    // Installed on acceptance, before DNS/TCP awaits or tunnel handlers take over.
    // Error objects can contain target details: close without logging them.
    socket.on('error', () => socket.destroy());
    socket.on('close', () => sockets.delete(socket));
  };
  const pin = (host) => resolvePinnedAddresses(host, policy);
  const refuse = (host, reason) => { try { policy.onBlocked(networkHost(host) || 'invalid-host', reason); } catch { /* reporting must not break the proxy */ } };

  const server = http.createServer(async (req, res) => {
    req.on('error', () => res.destroy());
    // Absolute-form plain HTTP, for clients that do not tunnel http:// through CONNECT.
    let target;
    try { target = new URL(req.url); } catch { res.writeHead(400).end(); return; }
    if (target.protocol !== 'http:') { res.writeHead(400).end(); return; }
    let address;
    try { address = await pin(target.hostname); }
    // Drop the connection instead of answering: a proxy-generated HTTP status could be
    // mistaken for the origin's response by the client.
    catch (error) { refuse(target.hostname, error.message); req.socket.destroy(); return; }
    if (closed || req.socket.destroyed || res.destroyed) return;
    const headers = { ...req.headers };
    delete headers['proxy-connection']; delete headers['proxy-authorization'];
    const upstream = http.request({ host: address[0], port: Number(target.port || 80), createConnection: (_options, callback) => {
      connectFirstReachable(address, Number(target.port || 80), track, () => !closed && !req.socket.destroyed).then((socket) => {
        if (upstream.destroyed) { socket.destroy(); return; }
        callback(null, socket);
      }, (error) => callback(error));
    }, method: req.method, path: `${target.pathname}${target.search}`, headers, setHost: false }, (response) => {
      res.writeHead(response.statusCode ?? 502, response.headers);
      response.pipe(res);
    });
    upstream.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
    res.on('close', () => { if (!res.writableEnded) upstream.destroy(); });
    req.pipe(upstream);
  });
  server.on('connection', track);
  server.on('connect', async (req, client, head) => {
    req.on('error', () => client.destroy());
    const match = /^\[?([^\]]+?)\]?:(\d{1,5})$/.exec(String(req.url));
    const port = Number(match?.[2]);
    if (!match || port < 1 || port > 65535) { client.end('HTTP/1.1 400 Bad Request\r\n\r\n'); return; }
    let address;
    try { address = await pin(match[1]); }
    catch (error) { refuse(match[1], error.message); client.end('HTTP/1.1 403 Forbidden\r\n\r\n'); return; }
    let upstream;
    try { upstream = await connectFirstReachable(address, port, track, () => !closed && !client.destroyed); }
    catch { client.destroy(); return; }
    if (closed || client.destroyed) { upstream.destroy(); return; }
    upstream.on('error', () => client.destroy());
    client.on('error', () => upstream.destroy());
    client.on('close', () => upstream.destroy());
    client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    if (head?.length) upstream.write(head);
    upstream.pipe(client); client.pipe(upstream);
  });
  // Absolute-form upgrades are not used by Chromium through an HTTP proxy; refuse them.
  server.on('upgrade', (_req, socket) => socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'));
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  server.unref();
  return {
    server: `http://127.0.0.1:${server.address().port}`,
    configure(next) { policy = { ...policy, ...next }; },
    async close() {
      closed = true;
      for (const socket of sockets) socket.destroy();
      await new Promise((resolve) => server.close(() => resolve()));
    },
  };
}
