# Installation

geo-atlas ships as two independent packages — install only the one you need.

## `@geo-atlas/core`

The data layer: fetches, validates, and normalizes boundary data. Zero React dependency, works anywhere JavaScript runs (browser, Node, SSR).

::: code-group

```bash [npm]
npm install @geo-atlas/core
```

```bash [pnpm]
pnpm add @geo-atlas/core
```

```bash [yarn]
yarn add @geo-atlas/core
```

:::

## `@geo-atlas/react`

React components on top of `@geo-atlas/core` — `<BoundaryMap />` and `useBoundaries()`. Installing it pulls in `@geo-atlas/core`, `d3-geo`, and `react-simple-maps` automatically as regular dependencies; only `react` (18 or later) is a peer dependency you need to already have.

::: code-group

```bash [npm]
npm install @geo-atlas/react
```

```bash [pnpm]
pnpm add @geo-atlas/react
```

```bash [yarn]
yarn add @geo-atlas/react
```

:::

## Requirements

- Node.js 18 or later (build tooling and SSR)
- React 18 or later (for `@geo-atlas/react` only)

## Next step

Most apps only need the CDN-mirrored countries and can go straight to the [Quick Start](/quick-start). If you plan to support **every** country — including microstates and dependent territories geoBoundaries doesn't mirror — read [Browser & CORS](/browser-cors) first, since those need a small server-side proxy in client-only apps.
