# ADR 0001: DNS pinning and mediated HTTP

Status: **implemented** with a local pinning proxy per inspection context. Superseded finding: a Chromium resolver rule alone does not pin mediated traffic.

## Context

The request guards resolve each hostname and refuse names whose answers fall in forbidden ranges. Before this decision the checked address was not bound to the connection: Chromium, or Playwright's `route.fetch()` that mediates every HTTP request, resolved the name again, so a short-TTL rebinding answer could differ at connection time.

## Earlier observation

On Linux with Playwright 1.64.1 and system Chromium 154, a synthetic dual-stack loopback experiment (`scripts/probe-host-pinning.mjs`) showed that `--host-resolver-rules=MAP localhost ~NOTFOUND` blocked direct navigation but not the same navigation served through `route.fetch()` and `route.fulfill()`. A browser resolver rule therefore cannot pin the mediated HTTP path.

## Decision

Every context created by `createInspectionContext()` uses a context-level HTTP proxy started on loopback (`scripts/_pinning.mjs`). `installRequestGuards()` configures that proxy with the same policy (`allowPrivate`, `allowUnresolvedDns`) and the same resolver as the guards.

- A second local experiment on the same stack showed that `route.fetch()` sends `CONNECT host:port` to the context proxy for both `http:` and `https:` URLs, and that Chromium's own background requests also use it. When a proxy is configured, neither resolves the destination name itself.
- For each `CONNECT` (and for absolute-form plain HTTP), the proxy resolves the name once, applies the IP policy to every answer, and opens the socket to the validated address. TLS stays end to end between the client and the origin, with the original hostname for SNI and certificate validation; the proxy relays bytes only.
- Playwright 1.64 treats the former Windows-only `per-context` launch placeholder as unnecessary, so no global proxy is configured at launch.
- Blocked connections are reported in `blockedTargets` only for hosts the page requested; Chromium's background traffic is held to the same policy without polluting reports.

## Evidence

- `tests/pinning.test.mjs`: a resolver that answers loopback and then metadata yields one successful tunnel to the validated loopback address and one `403`, with the refusal reported; mixed, mapped and failed answers are refused; `--allow-unresolved-dns` returns the hostname without validation.
- `tests/network-guards.test.mjs`: with a name that exists only in the injected resolver, Chromium loads the page only through the pinned proxy; when the connection-time answer changes to metadata after the guard check passed, the navigation fails and the local server receives no request.

## Remaining limits

- Chromium bypasses proxies for loopback destinations; loopback is allowed by policy, so this does not widen access.
- WebRTC and other UDP traffic do not use an HTTP proxy and are not covered.
- `--allow-unresolved-dns` connects names that fail to resolve locally by hostname, without validation or pinning; use it only in trusted proxy environments.
- Network translation beyond the documented ranges (for example deployment-specific NAT64 prefixes) is not inferred.
- The tools execute page JavaScript and are not a sandbox for untrusted URLs.
