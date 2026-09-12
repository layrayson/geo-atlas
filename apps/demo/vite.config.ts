import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

const ALLOWED_PROXY_HOSTS = new Set([
  "www.geoboundaries.org",
  "github.com",
  "media.githubusercontent.com",
]);

/**
 * Dev-only same-origin proxy for geoBoundaries requests, to work around the
 * CORS-breaking Git-LFS redirect hop described in
 * apps/demo/src/corsProxyFetch.ts. Restricted to a small host allowlist so
 * this stays a narrow workaround, not a general open proxy.
 */
function geoBoundariesProxyPlugin(): Plugin {
  return {
    name: "geoboundaries-cors-proxy",
    configureServer(server) {
      server.middlewares.use("/api/proxy", async (req, res) => {
        const target = new URL(req.url ?? "", "http://localhost").searchParams.get("url");
        if (!target) {
          res.statusCode = 400;
          res.end("Missing url query param");
          return;
        }

        let targetUrl: URL;
        try {
          targetUrl = new URL(target);
        } catch {
          res.statusCode = 400;
          res.end("Invalid url");
          return;
        }

        if (!ALLOWED_PROXY_HOSTS.has(targetUrl.hostname)) {
          res.statusCode = 403;
          res.end(`Host not allowed: ${targetUrl.hostname}`);
          return;
        }

        try {
          const upstream = await fetch(targetUrl);
          const body = await upstream.arrayBuffer();
          res.statusCode = upstream.status;
          res.setHeader("content-type", upstream.headers.get("content-type") ?? "application/json");
          res.end(Buffer.from(body));
        } catch (err) {
          res.statusCode = 502;
          res.end(`Proxy fetch failed: ${(err as Error).message}`);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), geoBoundariesProxyPlugin()],
});
