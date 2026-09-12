# Spike 03 — disputed/contested territory representation

**Question:** How does geoBoundaries represent territories with contested status, and does that require a design decision before shipping?

**Findings** (raw output in [findings.md](./findings.md)):

- Taiwan (`TWN`) exists as its own independent `ADM0` boundary in geoBoundaries.
- Taiwan **also** appears as one of the 34 `ADM1` units inside China's (`CHN`) boundary set, listed as "Taiwan Province."
- These two facts are inherently contradictory if both are loaded into the same map/dataset at once — the source itself doesn't pick a single position, different query levels give different answers.
- India's `ADM1` set has a single "Jammu and Kashmīr" unit, not split into "Jammu and Kashmir" + "Ladakh" as India's own current administrative division has had since 2019 — a data-recency gap rather than a disputed-boundary issue.

## Design implication

This isn't something the library should silently resolve one way — that's a political stance, not an engineering decision. Instead:

1. Document, per query, exactly which upstream source/level was used and its `sourceDataUpdateDate` (already present in geoBoundaries metadata) so staleness like the Kashmir/Ladakh split is visible, not hidden.
2. When rendering `CHN` at `ADM1`, callers get "Taiwan Province" as one of the units — that's the raw source data, unaltered by the library. If a consumer wants Taiwan excluded or shown independently, that's a query choice (`country: "CHN"` vs `country: "TWN"`), not something `@geo-atlas` should decide for them.
3. Do not attempt a `view` parameter that swaps geometry based on political perspective (originally considered in the design sketch) — the added complexity and inherent editorializing isn't worth it. Pass through the source faithfully and document it instead.

**Revised decision vs. original idea:** drop the "view" option from the design; ship what the upstream source provides, with clear per-country source/date metadata so consumers can make their own informed calls.
