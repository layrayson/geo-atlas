# Spike 01 — geoBoundaries.org as primary data source

**Question:** Is geoBoundaries.org good enough (schema, licensing, size, validity) to build `@geo-atlas/core` on top of?

**Method:** Fetched ADM1 (state/province) metadata + full and simplified GeoJSON for 10 countries chosen for diversity (large/small, every populated continent, two with disputed-territory sensitivity): NGA, USA, IND, BRA, GBR, CHN, ZAF, AUS, FRA, KEN. Raw results in [findings.json](./findings.json).

## Results

- **10/10 succeeded**, zero fetch failures, zero null/invalid geometries.
- **Schema is fully consistent** across all 10 countries: every feature has exactly `shapeName`, `shapeISO`, `shapeID`, `shapeGroup`, `shapeType`. This is a real advantage over the old blushield-fe setup, where each country's `.geojson` was whatever an ad-hoc source produced.
- **File size varies wildly and doesn't correlate with admin-unit count** — it tracks coastline/border complexity instead:

  | Country | Admin units | Full size | Simplified size |
  |---|---|---|---|
  | GBR | 4 | 173 KB | 167 KB |
  | CHN | 34 | 232 KB | 226 KB |
  | NGA | 37 | 2.0 MB | 730 KB |
  | BRA | 27 | 3.7 MB | 1.3 MB |
  | KEN | 47 | 6.9 MB | 750 KB |
  | USA | 56 | 11.4 MB | 4.7 MB |
  | ZAF | 9 | 17.3 MB | 632 KB |
  | FRA | 13 | 63.3 MB | 1.5 MB |
  | AUS | 9 | 71.7 MB | 4.1 MB |
  | IND | 36 | 39.6 MB | 4.4 MB |

  → **Confirms the design decision to always serve simplified-by-default, with full resolution opt-in.** AUS and FRA are ~50x smaller simplified; nobody should get a 70MB payload for a choropleth map.

- **Six different licenses across 10 countries**, all permissive but not identical (CC BY 4.0, CC BY 2.5 India, CC BY 2.5 Generic, CC BY 3.0 IGO, Etalab Open License 2.0, Public Domain). None are GADM-style non-commercial-only, which is the one we needed to avoid. **Action item:** the package must carry per-country attribution metadata, not a single blanket license string — "CC BY 4.0" everywhere would be inaccurate.

- **14 distinct upstream sources** feed into just 10 countries (national statistics offices, census bureaus, NGOs, geoBoundaries' own compilation). This is exactly the fragmentation problem the library is meant to hide from consumers — geoBoundaries already did the work of aggregating it.

## Verdict

**Green light.** geoBoundaries is viable as the primary source for `@geo-atlas/core`: consistent schema, acceptable licenses, real (but manageable) size variance, no data integrity issues in this sample. Two concrete design requirements this spike surfaced:

1. Ship simplified geometry by default; full resolution must be an explicit opt-in.
2. Track and expose per-country license + source attribution, not one library-wide license string.

## Not yet tested (next spikes)

- ADM2 (county/district) level — likely much larger and possibly less consistent.
- Disputed-territory handling — IND and CHN were fetched at face value here; no check yet of how geoBoundaries represents Kashmir, Taiwan, etc., or whether a `view` parameter is even feasible.
- Update cadence / how often geoBoundaries revises a given country (affects the versioning strategy).
