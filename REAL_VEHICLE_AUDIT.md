# Cybertruck real-vehicle fidelity audit

Status: common dimensions calibrated; exact exterior match NOT certified.
Target trim/model year, wheel/cover option, tire option, mirror position and suspension setting: awaiting user reference selection.

## Primary references
- [Tesla owner manual, exterior dimensions](https://www.tesla.com/ownersmanual/cybertruck/en_us/GUID-12A976DD-EB60-431B-AFF1-5A37E95006DB.html)
- [Tesla service manual, wheel paint codes](https://service.tesla.com/docs/Cybertruck/ServiceManual/en-us/GUID-769C9625-76EE-467B-B756-C9032AC2B99A.html)
- [Tesla vehicle page](https://www.tesla.com/cybertruck)

The public vehicle page was access-denied in the browser during this audit. Manual text was available through web retrieval. Full photographic exterior comparison has not been completed.

## Measured corrections
The asset was previously normalized to an arbitrary 5.6 scene units. It now uses meters and the published 5.6829 m length. Wheel placement uses the tire geometry center, not the assembly origin (which includes an outboard offset). The loaded hierarchy is rotated, so corrections are applied through each anchor parent's inverse world transform.

| Constraint | Published target | Actual loaded scene |
|---|---:|---:|
| Overall length | 5.6829 m | 5.6829 m |
| Wheelbase | 3.6350 m | 3.6350 m |
| Front tire-center track | 1.7720 m | 1.7720 m |
| Rear tire-center track | 1.7720 m | 1.7720 m |

Implementation: src/vehicleCalibration.js. Validated with a rotated hierarchy and offset tire-center check, followed by measurement attributes from the actual browser-loaded GLB scene. Source wheel anchors had approximately 3.615 m axle separation before scaling/correction.

The owner's manual calls its dimensions approximate and notes that equipment affects measurements. Calibration to published nominal numbers is not factory manufacturing-tolerance certification.

## Still unverified
- Specific production year/trim and whether current Premium wheel geometry/cover matches the user's target.
- Tire brand, sidewall lettering, precise tread and approved wheel/cover color/finish.
- Suspension ride height, total height and ground clearance at the selected air setting.
- Mirror housings, mounting bases, opening angle and resulting overall width.
- Exact body-panel contours, gaps, bevel radii, headlight lenses, bumper/grille details, cameras and charging port.
- Glass optical coatings, privacy levels and exact stainless surface roughness. Current shader values are visual approximations under studio lighting.
- Cabin and bed details, closure components and their original source-model accuracy.

Do not stretch the entire body to match an ambiguous bounding box. Resolve mirror/mount definitions and the target equipment first. Do not label the current model '1:1', 'factory CAD' or 'all details identical'. Gold edge mode is an editorial presentation, not an authenticated production structure.
