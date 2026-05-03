# RealAlpha

**RealAlpha turns fake transparent AI images into real transparent PNGs with alpha channel.**  
把 AI 生成的假透明图片，变成真正带 Alpha 通道的透明 PNG。

> Part of [AhaKnow Tool Lab](https://github.com/IHKYoung) — turning real problems into small, shippable tools.  
> 凡所思，皆可造。

---

## What it does

AI image tools (Midjourney, DALL·E, Stable Diffusion…) often export images with a white or checkerboard background instead of true transparency. RealAlpha removes that — entirely in your browser, nothing uploaded.

**Your image never leaves your device.**

---

## Features

- 🖼 **Drop / Click / Paste** to upload
- 🎯 **Auto-detects** solid-color and checkerboard backgrounds
- 🕳 **Interior hole fix** — enclosed background regions (e.g. inside a ring) are removed too
- 🎚 **4-level strength** — Precise / Medium / Loose / Max
- 🌏 **4 languages** — EN / 中文 / 日本語 / 한국어, auto-detected from browser

---

## Run locally

```bash
npm install
npm run dev       # → http://localhost:5173
```

## Build & deploy

```bash
npm run build     # → dist/
```

Push to GitHub, import in [Vercel](https://vercel.com) — it auto-detects Vite and uses `vercel.json`. No environment variables needed.

---

## How the algorithm works

Most background removers flood-fill from the image edges. That misses enclosed regions — the white inside a donut hole, for example.

RealAlpha runs **two BFS passes**:

1. **Edge BFS** — flood-fill from all four borders, mark connected background-colored pixels
2. **Interior BFS** — find remaining background-colored components that have no contact with the transparent outer region → those are holes, remove them too
3. **Feathering** — alpha gradient at all transparency boundaries to smooth edges

Background detection samples corner and border pixels to identify solid color vs. checkerboard (alternating light/dark grid typical of AI tool exports).

---

## Source layout

```
src/
├── main.js        app entry — events, upload, process flow
├── bgRemoval.js   BFS algorithm + interior hole fix + feathering
├── i18n.js        localization — LOCALES, t(), applyLang()
└── style.css      dark theme UI
```

To add a language: add a key in `LOCALES` in `src/i18n.js` and an `<option>` in `index.html`.

---

## Built by

**Clarke Young** · [AhaKnow](https://github.com/ahaknow)

---

## License

MIT
