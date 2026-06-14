# Nexora — Smart. Simple. Essential.

A warm, minimalist direct-to-consumer storefront for five everyday "niche utility"
products (Halo bedside clock, Flow carry bottle, Marque line bookmark, Terra cork
belt, Nimbus quick-dry umbrella).

Implemented from a [Claude Design](https://claude.ai/design) handoff bundle as a
**dependency-free static site** — no build step, no framework, no bundler. Open the
HTML and it runs.

## Features

- **Hero** with value proposition and dual CTAs
- **Niche Utility Showcase** — five product blocks, each with interactive image
  hotspots, a thumbnail gallery, micro-problem / smart-solution copy, and quick-buy
  with quantity stepper
- **Ecosystem** — "The Daily Five" bundle with savings and one-click add
- **Reviews + trust** badges
- **Floating conversion bar** — appears on scroll, tracks which of the five you own
- **Slide-out cart** with a full working **checkout flow** (field validation →
  order placed)
- **Light / dark theme** and **5 accent colors**, persisted to `localStorage`

## Run it

It's a static site. Any of these work:

```bash
# Option 1: open the file directly
open Nexora.html            # macOS

# Option 2: serve the folder
python3 -m http.server 4517
# then visit http://localhost:4517/
```

`index.html` and `Nexora.html` are identical, fully self-contained builds (CSS,
product data, and app logic all inlined) — the only external requests are the
product images in `assets/images/` and the Remix Icon font (CDN).

## Project structure

```
.
├── index.html                  # self-contained build (server entry point)
├── Nexora.html                 # self-contained build (identical to index.html)
├── assets/
│   ├── nexora.css              # design system: type, color, buttons, layout
│   ├── nexora-components.css   # component styles (header, hero, cart, etc.)
│   ├── data.js                 # product catalogue + copy (window.NEXORA_DATA)
│   ├── app.js                  # the app: renders the page + wires interactions
│   └── images/                 # product photography
└── .claude/launch.json         # local dev-server config
```

The `assets/*.css`, `assets/data.js`, and `assets/app.js` files are the readable
**source**; the two HTML files are the built artifacts that inline them. To edit,
change the source files and re-inline (the HTML simply embeds them verbatim).

## License

All rights reserved.
