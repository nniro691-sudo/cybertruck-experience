# CYBERTRUCK — Cinematic Interactive Experience

Cybertruck at `/` and the original Koenigsegg One:1 at `/one1`. A camera-driven studio presentation with four hinged doors, driver-seat entry, cockpit and chase views, and a local driving simulation with steering, acceleration, braking, gears and cruise control.

## Public demonstration

GitHub Pages: https://nniro691-sudo.github.io/cybertruck-experience/

Deployments run automatically on pushes to `main`. The original One:1 is available at `one1/`.

## Run

Node.js 20+ required.

```sh
npm install
npm run dev -- --host 0.0.0.0
```

## Build

```sh
npm run build
npm run test:sites
```

The deployable site is in `dist/client`. Serve over HTTP; GLB loading does not work by double-clicking an HTML file. All production fonts and model assets are local.

## Viewing

- Scroll to direct the camera; chapter links and arrow keys jump between shots.
- Autoplay plays the camera sequence in about 42 seconds; mouse wheel and touch interrupt playback.
- Transparency toggles the golden wireframe visualisation.
- Free viewing enables mouse or touch rotation. Live WebGL supports zoom; the compatibility renderer supports horizontal orbiting.
- If WebGL is unavailable, a local, pre-rendered image sequence provides the camera presentation. It uses frame blending and a bounded image cache.

## Publication status

The user requested a public GitHub repository and GitHub Pages demonstration after the asset provenance limitation was disclosed. The detailed Cybertruck assets in `public/assets/cybertruck-hd/` have no established public redistribution license. Public redistribution rights remain unverified; this demonstration does not establish a license for reuse. See `public/assets/cybertruck-hd/SOURCE.md`. Driving dynamics and instrument UI are independent prototype simulations, not authenticated Tesla controls or performance specifications.

## Asset attribution and permitted use

This is an independent, non-commercial design study, not an official Koenigsegg website. Brand names and marks belong to their respective owners.

3D model: **2014 Koenigsegg One-1**, by **Ddiaz Design**.
Source: https://sketchfab.com/3d-models/2014-koenigsegg-one-1-d21c0d3ee5094938889a26d7215b91e5
License: **CC BY-NC-SA 4.0**, https://creativecommons.org/licenses/by-nc-sa/4.0/
Model was obtained from the public Nissmo89/Supercar-Vault-3D repository. Presentation modifications include graphite/gold materials, studio lighting and camera rendering. The modified model/render assets retain the original attribution and non-commercial share-alike terms. Obtain a suitable license or replacement asset before commercial use.

Typeface: Manrope by Mikhail Sharanda / Mirko Velimirovic, SIL Open Font License.
Vehicle specifications: https://www.koenigsegg.com/model/one1
The gold mode is an artistic mesh visualisation, not a representation of the vehicle's actual internal engineering.

## Verification scope

The Cybertruck WebGL experience was browser-tested locally, including door opening, driver-seat entry, gear selection, cruise, camera switching and return to the studio. Build, Sites packaging tests and the vehicle interaction test pass.
