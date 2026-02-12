import * as THREE from '../../libs/three.module.js';

const colliders = [];

export function addCollider(mesh) {
  colliders.push(mesh);
}

export function collides(pos, radius) {

  const playerBox = new THREE.Box3(
    new THREE.Vector3(pos.x - radius, 0, pos.z - radius),
    new THREE.Vector3(pos.x + radius, 2, pos.z + radius)
  );

  for (const mesh of colliders) {
    const box = new THREE.Box3().setFromObject(mesh);
    if (box.intersectsBox(playerBox)) {
      return true;
    }
  }

  return false;
}
