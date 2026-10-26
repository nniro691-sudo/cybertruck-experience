# Credits & asset licensing

## Code
- [three.js](https://threejs.org/) — MIT License. Bundled into `dist/tesla-3d-card.js`.
- [Draco](https://github.com/google/draco) decoder (Google) — Apache License 2.0.
  Shipped locally in `public/draco/` (from three.js `examples/jsm/libs/draco/gltf/`)
  so compressed `.glb` models decode offline with no CDN.
- Card code — MIT (see `LICENSE`).

## 3D models (`public/models/`)
The Tesla car models (`body.glb` / `wheels.glb` for each variant) were obtained from a
third-party web app and their license is **unspecified**. They are provided here for
**personal / local Home Assistant use**.

⚠️ **If you fork or redistribute this repository publicly**, be aware you would be
redistributing those model files. Verify their licensing first, or remove `public/models/`
and set `model_url` in your card config to a model you have the rights to use (e.g. a CC0
Model Y from meshy.ai, Sketchfab, or Poly Pizza).

Tesla, Model 3, Model Y, and Cybertruck are trademarks of Tesla, Inc. This project is not
affiliated with or endorsed by Tesla, Inc.

## Local prototype modifications
Body and wheel assemblies loaded separately and mounted at original wheel anchors. Model normalized to 5.6 presentation units, with exterior material variants selected, physically based stainless/glass/rubber materials adapted, studio reflection panels and contact shadows added. Original source geometry is retained. No public redistribution license has been established for these detailed vehicle assets.
