import { defineConfig } from "vitepress";

export default defineConfig({
  title: "geo-atlas",
  description: "Normalized, validated GeoJSON boundary data for countries and their admin1 subdivisions.",
  // Served from github.com/layrayson/geo-atlas via GitHub Pages, alongside the
  // demo at the site root - docs live under /geo-atlas/docs/, not /geo-atlas/,
  // so every internal link and asset needs this prefix or it 404s in prod.
  base: "/geo-atlas/docs/",

  head: [
    ["link", { rel: "icon", href: "/geo-atlas/docs/favicon.svg" }],
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,470;0,9..144,600;1,9..144,440&family=JetBrains+Mono:wght@400;500;600;700&display=swap",
      },
    ],
  ],

  themeConfig: {
    logo: "/favicon.svg",

    nav: [
      { text: "Guide", link: "/installation" },
      { text: "Demo", link: "https://layrayson.github.io/geo-atlas/" },
      { text: "npm", link: "https://www.npmjs.com/package/@geo-atlas/core" },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [{ text: "What is geo-atlas?", link: "/" }],
      },
      {
        text: "Getting Started",
        items: [
          { text: "Installation", link: "/installation" },
          { text: "Quick Start", link: "/quick-start" },
          { text: "Browser & CORS", link: "/browser-cors" },
        ],
      },
    ],

    search: {
      provider: "local",
    },

    socialLinks: [{ icon: "github", link: "https://github.com/layrayson/geo-atlas" }],

    footer: {
      message: "Released under the MIT License.",
      copyright: "geo-atlas · @geo-atlas/core + @geo-atlas/react",
    },

    editLink: {
      pattern: "https://github.com/layrayson/geo-atlas/edit/main/apps/docs/:path",
      text: "Edit this page on GitHub",
    },
  },
});
