import { writeFile } from "node:fs/promises";
import path from "node:path";

async function fetchMeta(iso3: string, level: string) {
  const res = await fetch(`https://www.geoboundaries.org/api/current/gbOpen/${iso3}/${level}/`);
  if (!res.ok) return null;
  return res.json();
}

async function main() {
  const targets: [string, string][] = [["NGA", "ADM2"], ["KEN", "ADM2"], ["GBR", "ADM2"]];
  const results: any[] = [];
  for (const [iso, level] of targets) {
    process.stdout.write(`Fetching ${iso} ${level}... `);
    const meta = await fetchMeta(iso, level);
    if (!meta) { console.log("FAILED"); continue; }
    const simplified = await fetch(meta.simplifiedGeometryGeoJSON).then(r => r.json());
    const size = Buffer.byteLength(JSON.stringify(simplified));
    console.log(`OK (${meta.admUnitCount} units, ${(size/1024).toFixed(1)}KB simplified)`);
    results.push({ iso, level, admUnitCount: meta.admUnitCount, simplifiedSizeKB: +(size/1024).toFixed(1) });
  }
  await writeFile(path.join(process.cwd(), "spikes/02-adm2-scale/findings.json"), JSON.stringify(results, null, 2));
}
main();
