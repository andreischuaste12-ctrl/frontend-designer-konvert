# ADR 0001: DNS pinning and mediated HTTP

Status: **investigated; not implemented**. The guard blocks DNS errors and timeouts by default, but it does not pin the checked address to the eventual connection. DNS rebinding, proxies and network translation remain outside its guarantees; it is not a sandbox for untrusted sites.

## Local observation

On this Linux environment, Playwright 1.64.1 and system Chromium 154, a synthetic dual-stack loopback experiment produced: ordinary `localhost` navigation succeeded, Chromium `--host-resolver-rules=MAP localhost ~NOTFOUND` blocked direct navigation, but the same navigation succeeded when its response was obtained through Playwright `route.fetch()` and fulfilled. Run `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium node scripts/probe-host-pinning.mjs` after installing the skill's pinned dependencies. The experiment contacts only local loopback; a different environment may be inconclusive.

## Decision

Do not claim that a Chromium resolver rule pins the HTTP path while the inspector mediates requests with `route.fetch()`. The observation does not establish behavior of every platform, proxy, WebSocket, redirect or resolver, and it is not a rebinding exploit test. A complete approach must bind a validated address to the **actual connection**, preserve TLS hostname verification and SNI, cover every navigation, redirect and subresource, handle WebSockets and proxy policy, and fail safely on unsupported modes. It requires a controlled proxy or equivalent transport design and dedicated end-to-end tests; no implementation is asserted here.
