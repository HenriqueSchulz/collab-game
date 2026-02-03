import * as THREE from '../../libs/three.module.js';

export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);

camera.position.set(-8, 1.7, -8);
