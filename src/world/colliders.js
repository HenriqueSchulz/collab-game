import * as THREE from '../../libs/three.module.js';

const colliders = [];

export function addCollider(mesh) {
  colliders.push(new THREE.Box3().setFromObject(mesh));
}

export function collides(pos, radius) {
  const box = new THREE.Box3(
    new THREE.Vector3(pos.x - radius, 0, pos.z - radius),
    new THREE.Vector3(pos.x + radius, 2, pos.z + radius)
  );

  return colliders.some(c => c.intersectsBox(box));
}
