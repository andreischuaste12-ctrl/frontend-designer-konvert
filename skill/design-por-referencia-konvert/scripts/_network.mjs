import { BlockList, isIP } from 'node:net';

function subnets(cidrs) {
  const list = new BlockList();
  for (const cidr of cidrs) {
    const [address, prefix] = cidr.split('/');
    list.addSubnet(address, Number(prefix), isIP(address) === 4 ? 'ipv4' : 'ipv6');
  }
  return list;
}
const denied4 = subnets(['0.0.0.0/8', '169.254.0.0/16', '192.0.2.0/24', '192.88.99.0/24', '198.51.100.0/24', '203.0.113.0/24', '224.0.0.0/4', '240.0.0.0/4']);
const private4 = subnets(['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '100.64.0.0/10', '192.0.0.0/24', '198.18.0.0/15']);
const denied6 = subnets(['::/128', 'fe80::/10', 'ff00::/8', '2001::/32', '2001:db8::/32', '2001:10::/28', '2001:20::/28', '3fff::/20', '100::/64', '64:ff9b:1::/48']);
const private6 = subnets(['fc00::/7', 'fec0::/10', '2001:2::/48']);
const global6 = subnets(['2000::/3']);
const metadata4 = new Set(['169.254.169.254', '100.100.100.200']);

export function networkHost(hostname) {
  return hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
}

// Called only after isIP confirms IPv6; URL already normalizes dotted tails.
function ipv6Bytes(host) {
  const [left, right] = host.split('::');
  const head = left ? left.split(':') : [];
  const tail = right ? right.split(':') : [];
  const words = right === undefined ? head : [...head, ...Array(8 - head.length - tail.length).fill('0'), ...tail];
  return words.flatMap((word) => { const n = Number.parseInt(word, 16); return [n >> 8, n & 255]; });
}

function ipv4Reason(host, allowPrivate) {
  if (metadata4.has(host)) return 'cloud metadata endpoints are blocked';
  if (denied4.check(host, 'ipv4')) return 'reserved or non-routable network targets are blocked';
  if (private4.check(host, 'ipv4') && !allowPrivate) return 'private network targets require --allow-private';
  return null;
}

export function ipBlockReason(host, allowPrivate = false) {
  const family = isIP(host);
  if (family === 4) return ipv4Reason(host, allowPrivate);
  if (family !== 6) return null; // DNS resolution is deliberately outside this guard.
  if (host === '::1') return null;
  if (host === 'fd00:ec2::254') return 'cloud metadata endpoints are blocked';
  if (denied6.check(host, 'ipv6')) return 'reserved or non-routable network targets are blocked';
  const bytes = ipv6Bytes(host);
  const zero = (start, end) => bytes.slice(start, end).every((b) => b === 0);
  let embedded;
  if (zero(0, 12) || (zero(0, 10) && bytes[10] === 255 && bytes[11] === 255) ||
      (zero(0, 8) && bytes[8] === 255 && bytes[9] === 255 && zero(10, 12))) embedded = bytes.slice(12);
  else if (bytes[0] === 0 && bytes[1] === 100 && bytes[2] === 255 && bytes[3] === 155 && zero(4, 12)) embedded = bytes.slice(12);
  else if (bytes[0] === 32 && bytes[1] === 2) embedded = bytes.slice(2, 6);
  if (embedded) return ipv4Reason(embedded.join('.'), allowPrivate);
  if (private6.check(host, 'ipv6')) return allowPrivate ? null : 'private network targets require --allow-private';
  if (!global6.check(host, 'ipv6')) return 'unsupported or non-global IPv6 targets are blocked';
  return null;
}
