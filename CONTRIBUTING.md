# Contributing

## Setup

Requires Node 18+ and pnpm.

```bash
pnpm install
pnpm --filter @geo-atlas/core build   # packages/core and packages/react ship compiled
pnpm --filter @geo-atlas/react build  # output (dist/), so build both before touching
                                       # anything that imports them by package name -
                                       # the demo, docs, and packages/react's own test
                                       # suite all resolve @geo-atlas/core through it
```

Then, depending on what you're working on:

```bash
pnpm --filter demo dev   # demo at localhost:5173
pnpm --filter docs dev   # docs at localhost:5174 (via .claude/launch.json's port)
pnpm test                # full test suite (Vitest), from the repo root
```

## Project layout

- `packages/core` — the data layer (`getBoundaries`, `isMirrored`, `toIso3`). Zero React dependency.
- `packages/react` — `<BoundaryMap />` and `useBoundaries()`, built on `packages/core`.
- `apps/demo` — the live choropleth demo.
- `apps/docs` — the VitePress documentation site.
- `spikes/` — throwaway investigations that shaped a design decision (data source survey, CORS/winding-order bugs, etc.) — see each spike's own README for what it found.

## Before opening a PR

- Run `pnpm test` — all 38 tests should pass. Add tests for new behavior in the same package/file style as the existing suite (colocated `*.test.ts` next to the source file, no network calls — everything's mocked).
- Comments in this codebase explain **why**, not what — a comment restating what the next line obviously does gets removed in review. If you're documenting a non-obvious constraint, a workaround, or a bug you found the hard way, that's exactly what a comment is for.
- If your change affects `@geo-atlas/core`'s public API, update `apps/docs` to match — the docs are meant to stay accurate, not aspirational.
- Keep PRs scoped to one change. A bug fix doesn't need an unrelated refactor riding along with it.

## Reporting a bug

Open an issue with the country code and query (`level`/`resolution`) that triggered it, and whether you're running client-side, server-side, or via the demo. Most reported issues so far have traced back to either a specific country's source data (see the "What's not covered" section in [packages/core's README](./packages/core/README.md)) or the browser/CORS distinction covered in the [docs](https://layrayson.github.io/geo-atlas/docs/browser-cors) — check both before assuming it's a bug in the library itself.
