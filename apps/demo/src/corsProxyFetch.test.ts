import { afterEach, describe, expect, it, vi } from "vitest";
import { corsProxyFetch } from "./corsProxyFetch.js";

describe("corsProxyFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes jsDelivr mirror requests straight through, unproxied", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}"));
    const url = "https://cdn.jsdelivr.net/gh/layrayson/geo-atlas-data@main/data/NGA/admin1-simplified.geojson";

    await corsProxyFetch(url);

    expect(fetchSpy).toHaveBeenCalledWith(url, undefined);
  });

  it("routes any other http(s) URL through the local dev-server proxy", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}"));
    const url = "https://www.geoboundaries.org/api/current/gbOpen/DEU/ADM1/";

    await corsProxyFetch(url);

    expect(fetchSpy).toHaveBeenCalledWith(`/api/proxy?url=${encodeURIComponent(url)}`, undefined);
  });

  it("leaves a non-http input (e.g. a relative path) untouched", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}"));

    await corsProxyFetch("/local-asset.json");

    expect(fetchSpy).toHaveBeenCalledWith("/local-asset.json", undefined);
  });

  it("forwards the init argument (e.g. headers) through either path", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}"));
    const init = { headers: { Accept: "application/json" } };

    await corsProxyFetch("https://www.geoboundaries.org/x", init);

    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining("/api/proxy?url="), init);
  });
});
