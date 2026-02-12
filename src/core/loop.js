import * as THREE from '../../libs/three.module.js';
import { renderer } from './renderer.js';
import { scene } from './scene.js';
import { camera } from './camera.js';

const callbacks = [];
const clock = new THREE.Clock();

export function onUpdate(fn) {
  callbacks.push(fn);
}

export function startLoop() {
  function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.033); // trava picos de delta

    callbacks.forEach(fn => fn(dt));
    renderer.render(scene, camera);
  }

  animate();
}
