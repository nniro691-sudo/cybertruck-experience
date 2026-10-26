# Cybertruck realism revision QA

Source: /tmp/cyber-reference.jpg (00:05 frame from user-supplied motorcycle video), existing One:1 cinematic experience, and user direction rejecting low-poly modelling. The target is an adaptation of the dark studio/camera presentation to Cybertruck, not identical vehicle or title placement.
Implementation: qa/cybertruck-realism.png (1379 × 815 desktop screenshot). Detail evidence: qa/cybertruck-detail.png and browser inspections after shadow fix. Combined visual evidence: qa/cybertruck-realism-comparison.jpg.
Comparison: reference 1280 × 720 normalized to 960 × 540 and padded to 960 × 600; desktop implementation normalized to 960 × 600 for composition comparison. Aspect-ratio differences are intentional; this is not a pixel-level layout match.

## Iterations
1. P1 asset fidelity: rejected simplified concept model. Replaced with a 134,288-triangle production body and 8,297-triangle wheel mesh instanced at all four original wheel anchors. Panel seams, mirrors, windshield wiper, tread, cabin and actual wheel geometry now present.
2. P2 floating presentation: added an underside depth capture and three horizontal/vertical blur passes for grounded contact shadows. Latest arrival screenshot shows contact under tyres and chassis.
3. P2 glass artifacts: enabled double-sided dark glass, disabled conflicting transmission and rebuilt material shader configuration. Latest screenshot shows complete glazing.
4. P2 shadow acne at headlight band: adjusted light normal bias and exterior polygon offset. Inspected close-up again in browser; triangular dark shadow artifacts resolved.
5. P2 washed-out stage: removed bright reflective floor environment response; dark matte studio stage now supports the silver vehicle.
6. Replaced photographic HDR experiment with controlled radiance softboxes and neutral environment fill; final implementation uses generated studio radiance, not the downloaded HDR (unused experiment removed).

## Required visual surfaces
- Typography: existing Manrope and editorial hierarchy retained; vehicle clears the main title in final arrival composition.
- Spacing/layout: fullscreen stage, seven cinematic chapters and minimal navigation retained. No card landing page. Detail views deliberately crop the vehicle.
- Colors/tokens: black stage, neutral stainless steel, tinted glass, cool light strip and gold ghost structure. Silver is physical material response under studio panels.
- Asset fidelity: materially more detailed source geometry and distinct steel/rubber/glass treatments. Real-time rendering remains visibly different from offline path-traced automotive footage; no claim of photographic equivalence.
- Content: Tesla/Cybertruck identity retained, original low-poly artist attribution replaced with current provenance. Technical mesh mode remains explicitly illustrative.

## Browser verification
Arrival, light/detail chapter, gold structural chapter, and auto-play through completion were tested. Auto-play reached 100% and stopped. Final screenshot at 0%. Console errors query returned none. Production build and four Sites-worker/packaging tests passed. Mobile remains a visual test gap; responsive camera/layout rules retained.

## Asset provenance
public/assets/cybertruck-hd/SOURCE.md records the detailed Tesla asset origin and local-only rights limitation. This revision is a local prototype, not authorized for public asset redistribution. Publishing requires resolving that separate limitation.

## Remaining polish
P3: offline path-traced footage could further improve optical realism. Fine material response and small geometry details remain limited by the source mesh and real-time rendering.

final result: passed

## Glass correction
Replaced opaque glazing with dielectric MeshPhysicalMaterial: metalness 0, IOR 1.52, full transmission, volume attenuation, low roughness, and separate side-window tint variants. Removed overlapping rough glass and redundant inner pane variants. Windshield now reveals cabin depth with studio reflections; side/rear glazing uses stronger absorption and reduced specular intensity. Browser error query was empty and production build passed. Evidence: qa/cybertruck-glass.png. Scope limited to glazing and its variants; vehicle, cameras and layout retained.
