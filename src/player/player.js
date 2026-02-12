import * as THREE from '../../libs/three.module.js';
import { collides } from '../world/colliders.js';
import { PLAYER_RADIUS } from '../world/constants.js';

const MOVE_SPEED = 4.5; // velocidade lenta e constante

export function updatePlayer(camera, keys, yaw, pitch, dt) {

  /* ================= ROTATION ================= */

  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  /* ================= MOVEMENT BASIS ================= */

  // Vetor forward baseado apenas no YAW (ignora pitch)
  const forward = new THREE.Vector3(
    Math.sin(yaw),
    0,
    Math.cos(yaw)
  ).normalize();

  const right = new THREE.Vector3(
    forward.z,
    0,
    -forward.x
  );

  /* ================= INPUT ================= */

  const move = new THREE.Vector3();

  if (keys.KeyW) move.sub(forward);
  if (keys.KeyS) move.add(forward);
  if (keys.KeyA) move.sub(right);
  if (keys.KeyD) move.add(right);

  if (move.lengthSq() === 0) return;

  move.normalize().multiplyScalar(MOVE_SPEED * dt);

  /* ================= COLLISION RESOLUTION ================= */

  // Movimento separado por eixo (permite slide na parede)

  // eixo X
  const testX = camera.position.clone();
  testX.x += move.x;

  if (!collides(testX, PLAYER_RADIUS)) {
    camera.position.x = testX.x;
  }

  // eixo Z
  const testZ = camera.position.clone();
  testZ.z += move.z;

  if (!collides(testZ, PLAYER_RADIUS)) {
    camera.position.z = testZ.z;
  }
}