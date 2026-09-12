import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getBoundaries } from "../packages/core/src/index.ts";
import { ISO2_TO_ISO3 } from "../packages/core/src/iso-codes.ts";

// Attempt every ISO 3166-1 territory the library recognizes. geoBoundaries
// doesn't publish ADM1 data for every one of these (uninhabited territories,
// some city-states, a few disputed entities) — failures are expected and are
// reported at the end rather than aborting the run.
const COUNTRIES = [...new Set(Object.values(ISO2_TO_ISO3))].sort();
const OUT_DIR = path.resolve(import.meta.dirname, "../../geo-atlas-data/data");
const DELAY_MS = 250; // be polite to geoBoundaries' API across ~250 sequential requests

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const manifest: { generatedAt: string; entries: unknown[] } = {
    generatedAt: new Date().toISOString(),
    entries: [],
  };
  const failures: { iso3: string; reason: string }[] = [];

  for (const iso3 of COUNTRIES) {
    process.stdout.write(`Fetching ${iso3}... `);
    try {
      const boundaries = await getBoundaries({ country: iso3, level: "admin1", resolution: "simplified" });
      const dir = path.join(OUT_DIR, iso3);
      await mkdir(dir, { recursive: true });
      const filePath = path.join(dir, "admin1-simplified.geojson");
      await writeFile(filePath, JSON.stringify(boundaries));
      manifest.entries.push({
        country: iso3,
        level: "admin1",
        resolution: "simplified",
        path: `data/${iso3}/admin1-simplified.geojson`,
        source: boundaries.meta,
        featureCount: boundaries.features.length,
      });
      console.log(`OK (${boundaries.features.length} features)`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      failures.push({ iso3, reason });
      console.log(`SKIP (${reason})`);
    }
    await sleep(DELAY_MS);
  }

  await writeFile(
    path.resolve(import.meta.dirname, "../../geo-atlas-data/manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\nManifest written: ${manifest.entries.length} succeeded, ${failures.length} skipped.`);
  if (failures.length > 0) {
    console.log("\nSkipped:");
    for (const f of failures) console.log(`  ${f.iso3}: ${f.reason}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
