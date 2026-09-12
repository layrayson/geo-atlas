import { writeFile } from "node:fs/promises";

async function meta(iso3: string, level: string) {
  const res = await fetch(`https://www.geoboundaries.org/api/current/gbOpen/${iso3}/${level}/`);
  return res.ok ? res.json() : null;
}

async function main() {
  const notes: string[] = [];

  const twn = await meta("TWN", "ADM0");
  notes.push(twn ? `TWN has its own independent ADM0 entry in geoBoundaries (source: ${twn.boundarySource}). Confirms Taiwan is treated as a separate boundary, not merged into China's shape.` : "TWN: no ADM0 entry found.");

  const chn = await meta("CHN", "ADM1");
  const chnGeo = await fetch(chn.gjDownloadURL).then(r => r.json());
  const chnNames = chnGeo.features.map((f: any) => f.properties.shapeName);
  notes.push(`CHN ADM1 shapeNames (${chnNames.length}): ${chnNames.join(", ")}`);

  const ind = await meta("IND", "ADM1");
  const indGeo = await fetch(ind.gjDownloadURL).then(r => r.json());
  const kashmirUnits = indGeo.features
    .map((f: any) => f.properties.shapeName)
    .filter((n: string) => /kashmir|jammu|ladakh/i.test(n));
  notes.push(`IND ADM1 units matching Kashmir/Jammu/Ladakh: ${kashmirUnits.length ? kashmirUnits.join(", ") : "none found"}`);

  await writeFile("spikes/03-disputed-territories/findings.md", "# Spike 03 findings\n\n" + notes.map(n => "- " + n).join("\n") + "\n");
  console.log(notes.join("\n\n"));
}
main();
