# Spike 02 — ADM2 (district/county) scale check

**Question:** Is ADM2-level data (one level below states/provinces) practical to support, size-wise?

**Findings** (raw output in [findings.json](./findings.json)):

| Country | ADM1 units | ADM2 units | ADM2 simplified size |
|---|---|---|---|
| NGA | 37 | 774 | 3.3 MB |
| KEN | 47 | 290 | 1.8 MB |
| GBR | 4 | 216 | 0.76 MB |

## Verdict

ADM2 is roughly 10-20x more units than ADM1 and the simplified files are already multi-megabyte for mid-size countries. It's supportable, but:

- Must never be the default `level` — `country` or `admin1` should be default, `admin2` explicit opt-in.
- At this size, per-country ADM2 should probably be split further (e.g. one file per admin1 region, loaded on demand) rather than one national file, if it's added later. Not needed for v1.
- v1 scope: ship `country` and `admin1` levels only; treat `admin2` as a future addition once there's real demand, not a launch requirement.
