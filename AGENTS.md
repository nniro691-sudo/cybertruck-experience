# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## User visual target

Recreate the supplied 30-second motorcycle presentation using a Koenigsegg One:1: dark studio, continuous orbit, close-up details, translucent gold structure and minimal editorial navigation. Preserve the camera-driven presentation; do not turn it into a conventional card-based landing page.

## Cybertruck direction (2026-10-22)
The user requested a second Tesla Cybertruck experience using the existing camera-driven presentation and supplied motorcycle video. Keep the original One:1 available at /one1. Cybertruck at / uses a dark studio, silver stainless steel, sharp geometry, cool white light accents, restrained gold structure visualisation, 30-second guided camera motion and minimal editorial navigation. Avoid card-based landing pages.

## Realism requirement (2026-10-22)
The user rejected the initial low-poly Cybertruck. Prioritize photorealistic materials and cinematic presentation comparable to the supplied video: detailed production body, real wheel geometry, panel gaps, brushed stainless response, dark glass reflections, restrained light glow, grounded shadows and studio HDR lighting. Do not accept a low-poly/blockout aesthetic as completion. Current detailed Tesla assets have unspecified redistribution rights: retain provenance in public/assets/cybertruck-hd/SOURCE.md and do not publish them without resolving licensing.

## Automotive glazing (2026-10-22)
The user specifically rejected the opaque/metal-like glass response. Keep windshield and side glazing physically non-metallic, smooth, transmissive with subtle green-gray absorption, view-dependent Fresnel reflection and some visible cabin depth. Remove overlapping rough/interior material variants when they interfere with the main glass surface; preserve darker rear privacy glass.

## Finish and presentation benchmark (2026-10-22)
The user wants Cybertruck to match the refinement and material quality of the existing Koenigsegg experience. Prioritize controlled soft highlights, physically raw brushed steel instead of clear-coated plastic, differentiated rubber/glass/metal, subtle studio ground integration, uncluttered editorial type and camera views that reveal details without extreme clipping. Preserve the continuous camera-driven presentation and recent transmissive glazing improvement.

## Real-vehicle fidelity requirement (2026-10-22)
The user requires details to match the actual Cybertruck, not an embellished interpretation. Reference Tesla official imagery, owner manual and service documentation. Do not claim a 1:1 match from this visualization mesh; distinguish measured dimensional corrections from unverified trim, wheel/cover choice, lighting hardware, mirrors, panel geometry, suspension height and material appearance. Common published length 5.6829 m, wheelbase 3.635 m and track 1.772 m are calibrated against actual tire centers in src/vehicleCalibration.js. Specific target trim/reference photos remain to be confirmed with the user. The gold mesh is a presentation effect, not an authenticated view of the production vehicle structure.

## Interactive experience (2026-10-26)
The user requested opening doors, entering the interior and driving interactions. Preserve the cinematic showcase as the default and offer a separate reversible interaction mode. Use the model's existing door pivots and cabin geometry, smooth driver-seat entry, four door controls, cockpit/chase cameras and keyboard/touch driving controls. Driving is a local simulation rather than an authenticated Tesla control or performance model.

## Sharing decision (2026-10-26)
After being informed of the unresolved asset provenance, the user requested sharing this exact demonstration with others. Publish the current demonstration at a shareable URL; keep the GitHub source repository private and retain provenance and independent-study notices. This instruction records the requested audience, not a claim that model licensing has been resolved.

## Typography and boarding placement (2026-10-26)
User requested cooler typography and alignment with the boarding location. Use cold metallic display text, restrained instrument labels and concise reveal motion. Driver-seat entry has a screen-projected marker anchored to the actual driver's door area, following orbit movement and hiding on the far side. Keep a conventional accessible entry control as fallback.
