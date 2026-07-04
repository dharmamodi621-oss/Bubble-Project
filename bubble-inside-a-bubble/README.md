# Bubble Inside a Bubble — Interactive Science Exhibit

An interactive, museum-kiosk-style digital experience built for the Alchemy
Club's live surface-tension demonstration. Visitors scan a QR code after the
experiment and explore the physics behind it.

## Folder structure

```
bubble-inside-a-bubble/
├── index.html              All markup / section structure
├── css/
│   └── style.css           Design tokens, layout, section styling
├── js/
│   ├── particles.js         Background floating-bubble + dust canvas
│   ├── bubble-scene.js       Three.js shader bubbles (hero + science exhibit)
│   ├── micro-and-thanks.js   Canvas animations: molecule world + closing bubble
│   ├── quiz.js               5-question quiz logic + confetti finale
│   └── main.js               Loader, GSAP scroll reveals, cursor, HUD, grids
└── assets/
    ├── images/     ← drop real experiment photos here for the gallery
    ├── video/      ← add experiment.mp4 here (referenced in Section 2)
    └── audio/      ← add ambient-water.mp3 here for the optional mute toggle
```

## Running locally

This is a static site — no build step. Because it uses ES-module-free
`<script>` tags and `fetch`-free assets, any local static server works:

```bash
# Option 1: Python
cd bubble-inside-a-bubble
python3 -m http.server 8080
# visit http://localhost:8080

# Option 2: Node
npx serve bubble-inside-a-bubble
```

Opening `index.html` directly via `file://` mostly works too, but a local
server is recommended so the video/audio placeholders and any future fetches
behave the same as in production.

## Replacing placeholders

- **Experiment video** — add `assets/video/experiment.mp4`. Section 2's play
  button swaps the placeholder for a real `<video>` element pointing there.
- **Ambient audio** — add `assets/audio/ambient-water.mp3`. The mute/unmute
  button in the bottom-right corner already targets this file; the site works
  perfectly with the toggle present but silent if no file is provided.
- **Gallery photos** — Section 9's masonry grid currently renders gradient
  placeholders. Swap the `.ph` divs in `initGallery()` (`js/main.js`) for real
  `<img>` tags once you have experiment photography.

## Notes on the build

- The soap-bubble look (hero + Exhibit 03) is a custom GLSL shader in
  `bubble-scene.js` — a fresnel-driven hue shift standing in for thin-film
  interference, tuned for legibility rather than physical accuracy.
- All scroll-based reveals use GSAP + ScrollTrigger; the whole page respects
  `prefers-reduced-motion`.
- Three.js, GSAP, and ScrollTrigger are loaded from CDNs (unpkg / cdnjs) in
  `index.html`. If deploying somewhere without internet access to CDNs, vendor
  those three files into a local `/vendor` folder and update the `<script>`
  src attributes.
