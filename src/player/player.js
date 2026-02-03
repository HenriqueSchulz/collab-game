import { move } from './movement.js';
import { yaw, pitch } from './input.js';

export function updatePlayer(camera, keys, dt) {
  move(camera, keys, dt);

  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}
