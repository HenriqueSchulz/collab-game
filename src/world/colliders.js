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

  return colliders.some(mesh => {
    const box = new THREE.Box3().setFromObject(mesh);
    return box.intersectsBox(playerBox);
  });
}
