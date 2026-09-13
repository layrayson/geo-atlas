import { defineConfig } from "vitepress";

const SITE_URL = "https://layrayson.github.io/geo-atlas/docs/";

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

  // Canonical + Open Graph/Twitter tags, computed per page rather than set
  // once globally - a static og:title/description on every page would make
  // the Installation and Quick Start pages preview identically to the
  // homepage when linked on Slack/X/Discord, which defeats the point of
  // having a link preview at all. Confirmed against the real deployed site
  // that GitHub Pages resolves these extensionless paths (e.g. /installation
  // with no .html) directly, so the canonical/OG urls built here don't need
  // a .html suffix.
  transformHead: ({ pageData, siteConfig }) => {
    const title = pageData.frontmatter.title || pageData.title || siteConfig.site.title;
    const description = pageData.frontmatter.description || pageData.description || siteConfig.site.description;
    const slug = pageData.relativePath.replace(/\.md$/, "").replace(/^index$/, "");
    const url = `${SITE_URL}${slug}`;

    return [
      ["link", { rel: "canonical", href: url }],
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:url", content: url }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: description }],
      ["meta", { property: "og:image", content: `${SITE_URL}og-image.png` }],
      ["meta", { property: "og:image:width", content: "1200" }],
      ["meta", { property: "og:image:height", content: "630" }],
      ["meta", { name: "twitter:card", content: "summary_large_image" }],
      ["meta", { name: "twitter:title", content: title }],
      ["meta", { name: "twitter:description", content: description }],
      ["meta", { name: "twitter:image", content: `${SITE_URL}og-image.png` }],
    ];
  },

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
