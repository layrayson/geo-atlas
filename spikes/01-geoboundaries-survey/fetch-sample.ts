/**
 * Spike: survey geoBoundaries.org's ADM1 (state/province) data across a diverse
 * sample of countries to check consistency, licensing, size, and schema —
 * before committing to it as the primary data source for @geo-atlas/core.
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const SAMPLE_COUNTRIES = [
  "NGA", // Nigeria — origin case (blushield-fe pain point)
  "USA", // large, high admin-unit count
  "IND", // large, disputed-territory sensitivity (Kashmir)
  "BRA", // large, South America
  "GBR", // devolved nations, irregular naming
  "CHN", // disputed-territory sensitivity (Taiwan claim)
  "ZAF", // Africa, mid-size
  "AUS", // small admin-unit count, huge area
  "FRA", // Europe, overseas territories
  "KEN", // Africa, smaller economy
];

interface GBMeta {
  boundaryISO: string;
  boundaryName: string;
  boundaryYearRepresented: string;
  boundaryType: string;
  boundaryCanonical: string;
  boundarySource: string;
  boundaryLicense: string;
  admUnitCount: string;
  meanVertices: string;
  gjDownloadURL: string;
  simplifiedGeometryGeoJSON: string;
}

interface FeatureSchemaCheck {
  iso: string;
  propertyKeys: string[];
  featureCount: number;
  fullSizeKB: number;
  simplifiedSizeKB: number;
  hasNullOrInvalidGeometry: boolean;
}

async function fetchMeta(iso3: string): Promise<GBMeta | null> {
  const url = `https://www.geoboundaries.org/api/current/gbOpen/${iso3}/ADM1/`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function fetchGeoJSON(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

function kb(bytes: number): number {
  return Math.round((bytes / 1024) * 10) / 10;
}

async function main() {
  const outDir = path.join(import.meta.dirname, "data");
  await mkdir(outDir, { recursive: true });

  const metaResults: GBMeta[] = [];
  const schemaChecks: FeatureSchemaCheck[] = [];
  const failures: string[] = [];

  for (const iso3 of SAMPLE_COUNTRIES) {
    process.stdout.write(`Fetching ${iso3}... `);
    try {
      const meta = await fetchMeta(iso3);
      if (!meta) {
        failures.push(`${iso3}: metadata request failed`);
        console.log("FAILED (metadata)");
        continue;
      }
      metaResults.push(meta);

      const [full, simplified] = await Promise.all([
        fetchGeoJSON(meta.gjDownloadURL),
        fetchGeoJSON(meta.simplifiedGeometryGeoJSON),
      ]);

      const fullSize = Buffer.byteLength(JSON.stringify(full));
      const simplifiedSize = Buffer.byteLength(JSON.stringify(simplified));

      const propertyKeys = full.features.length
        ? Object.keys(full.features[0].properties)
        : [];
      const hasNullOrInvalidGeometry = full.features.some(
        (f: any) => !f.geometry || !f.geometry.coordinates?.length
      );

      schemaChecks.push({
        iso: iso3,
        propertyKeys,
        featureCount: full.features.length,
        fullSizeKB: kb(fullSize),
        simplifiedSizeKB: kb(simplifiedSize),
        hasNullOrInvalidGeometry,
      });

      // save simplified version only — full files can be tens of MB for large countries
      await writeFile(
        path.join(outDir, `${iso3}-ADM1-simplified.geojson`),
        JSON.stringify(simplified)
      );

      console.log(`OK (${meta.admUnitCount} units, ${kb(fullSize)}KB full / ${kb(simplifiedSize)}KB simplified)`);
    } catch (err) {
      failures.push(`${iso3}: ${(err as Error).message}`);
      console.log("FAILED");
    }
  }

  // --- schema consistency check ---
  const keysByCountry = new Map(schemaChecks.map((s) => [s.iso, new Set(s.propertyKeys)]));
  const allKeySets = [...keysByCountry.values()];
  const baseline = allKeySets[0] ?? new Set<string>();
  const schemaConsistent = allKeySets.every(
    (keys) => keys.size === baseline.size && [...keys].every((k) => baseline.has(k))
  );

  const report = {
    generatedAt: new Date().toISOString(),
    sampleSize: SAMPLE_COUNTRIES.length,
    succeeded: schemaChecks.length,
    failures,
    schemaConsistentAcrossSample: schemaConsistent,
    commonPropertyKeys: [...baseline],
    licenses: [...new Set(metaResults.map((m) => m.boundaryLicense))],
    sources: [...new Set(metaResults.map((m) => m.boundarySource))],
    perCountry: metaResults.map((m) => {
      const check = schemaChecks.find((s) => s.iso === m.boundaryISO);
      return {
        iso: m.boundaryISO,
        name: m.boundaryName,
        admUnitCount: m.admUnitCount,
        yearRepresented: m.boundaryYearRepresented,
        source: m.boundarySource,
        license: m.boundaryLicense,
        fullSizeKB: check?.fullSizeKB,
        simplifiedSizeKB: check?.simplifiedSizeKB,
        propertyKeys: check?.propertyKeys,
        hasNullOrInvalidGeometry: check?.hasNullOrInvalidGeometry,
      };
    }),
  };

  await writeFile(
    path.join(import.meta.dirname, "findings.json"),
    JSON.stringify(report, null, 2)
  );

  console.log("\n--- Summary ---");
  console.log(`Succeeded: ${report.succeeded}/${report.sampleSize}`);
  console.log(`Schema consistent across sample: ${report.schemaConsistentAcrossSample}`);
  console.log(`Common property keys: ${report.commonPropertyKeys.join(", ")}`);
  console.log(`Licenses seen: ${report.licenses.join(", ")}`);
  console.log(`Sources seen: ${report.sources.join(", ")}`);
  if (failures.length) console.log(`Failures: ${failures.join("; ")}`);
  console.log(`\nFull report written to spikes/01-geoboundaries-survey/findings.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
