---
layout: home

hero:
  name: geo-atlas
  text: Boundary data that just works
  tagline: Normalized, validated GeoJSON for every country and its admin1 subdivisions — fetch, validate, and correctly-wound out of the box, plus React components to render it.
  actions:
    - theme: brand
      text: Get Started
      link: /installation
    - theme: alt
      text: Live Demo
      link: https://layrayson.github.io/geo-atlas/
    - theme: alt
      text: View on GitHub
      link: https://github.com/layrayson/geo-atlas

features:
  - title: Zero setup, 197 countries
    details: Countries covered by the geo-atlas-data CDN mirror fetch straight from a plain browser — no proxy, no backend route, no CORS workaround.
  - title: Correctly wound, always
    details: Every ring is validated and re-wound to RFC 7946 winding order before it reaches you, so d3-geo/react-simple-maps render it right the first time.
  - title: Two packages, one system
    details: "@geo-atlas/core fetches and normalizes the data. @geo-atlas/react wraps it in <BoundaryMap /> and useBoundaries() for a drop-in choropleth."
  - title: Framework-agnostic core
    details: "@geo-atlas/core has zero React dependency — use it directly in Node, SSR, or any other rendering layer."
---
