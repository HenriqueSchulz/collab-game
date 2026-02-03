import { renderer } from './renderer.js';
import { scene } from './scene.js';
import { camera } from './camera.js';

const callbacks = [];

export function onUpdate(fn) {
  callbacks.push(fn);
}

export function startLoop(clock) {
  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    callbacks.forEach(fn => fn(dt));
    renderer.render(scene, camera);
  }
  animate();
}
