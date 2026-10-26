import * as THREE from 'three';

// Tesla's published exterior dimensions. These establish common dimensional
// constraints; they do not certify the source mesh as a factory CAD model.
export const CYBERTRUCK_REFERENCE = Object.freeze({
  length: 5.6829,
  wheelbase: 3.635,
  track: 1.772,
  source: 'https://www.tesla.com/ownersmanual/cybertruck/en_us/GUID-12A976DD-EB60-431B-AFF1-5A37E95006DB.html',
});

function tireCenter(wheel) {
  const bounds = new THREE.Box3();
  wheel.traverse(object => {
    if (!object.isMesh) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    if (!materials.some(material => /tire/i.test(material.name))) return;
    object.geometry.computeBoundingBox();
    bounds.union(object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld));
  });
  if (bounds.isEmpty()) throw new Error('Wheel calibration requires the actual tire geometry.');
  return bounds.getCenter(new THREE.Vector3());
}

export function calibrateCybertruck(car, assemblies) {
  if (assemblies.length !== 4) throw new Error('Cybertruck calibration requires four wheel assemblies.');
  car.updateMatrixWorld(true);
  const original = new THREE.Box3().setFromObject(car);
  car.scale.multiplyScalar(CYBERTRUCK_REFERENCE.length / original.getSize(new THREE.Vector3()).z);
  car.updateMatrixWorld(true);

  const entries = assemblies.map(assembly => ({ ...assembly, center: tireCenter(assembly.wheel) }));
  const centerX = entries.reduce((sum, entry) => sum + entry.center.x, 0) / 4;
  const centerZ = entries.reduce((sum, entry) => sum + entry.center.z, 0) / 4;
  for (const entry of entries) {
    const desired = entry.center.clone();
    desired.x = centerX + Math.sign(entry.center.x - centerX) * CYBERTRUCK_REFERENCE.track / 2;
    desired.z = centerZ + Math.sign(entry.center.z - centerZ) * CYBERTRUCK_REFERENCE.wheelbase / 2;
    const anchorWorld = entry.anchor.getWorldPosition(new THREE.Vector3());
    anchorWorld.add(desired.sub(entry.center));
    entry.anchor.position.copy(entry.anchor.parent.worldToLocal(anchorWorld));
  }
  car.updateMatrixWorld(true);
  const centers = entries.map(entry => tireCenter(entry.wheel));
  const front = centers.filter(center => center.z > centerZ);
  const rear = centers.filter(center => center.z < centerZ);
  const averageZ = points => points.reduce((sum, point) => sum + point.z, 0) / points.length;
  const width = points => Math.max(...points.map(point => point.x)) - Math.min(...points.map(point => point.x));
  return {
    length: new THREE.Box3().setFromObject(car).getSize(new THREE.Vector3()).z,
    wheelbase: averageZ(front) - averageZ(rear),
    frontTrack: width(front),
    rearTrack: width(rear),
  };
}
