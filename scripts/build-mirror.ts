import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getBoundaries } from "../packages/core/src/index.ts";

const COUNTRIES = ["NGA", "KEN", "GBR", "USA", "IND", "BRA", "CHN", "ZAF", "AUS", "FRA"];
const OUT_DIR = path.resolve(import.meta.dirname, "../../geo-atlas-data/data");

async function main() {
  const manifest: { generatedAt: string; entries: unknown[] } = {
    generatedAt: new Date().toISOString(),
    entries: [],
  };

  for (const iso3 of COUNTRIES) {
    process.stdout.write(`Fetching ${iso3}... `);
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
  }

  await writeFile(
    path.resolve(import.meta.dirname, "../../geo-atlas-data/manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  console.log("\nManifest written.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
