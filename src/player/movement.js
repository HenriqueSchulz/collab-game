import * as THREE from '../../libs/three.module.js';
import { collides } from '../world/colliders.js';
import { PLAYER_RADIUS, SPEED } from '../world/constants.js';

export function move(camera, keys, dt) {
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  dir.y = 0;
  dir.normalize();

  const right = new THREE.Vector3()
    .crossVectors(dir, camera.up)
    .normalize();

  const vel = new THREE.Vector3();

  if (keys.KeyW) vel.add(dir);
  if (keys.KeyS) vel.sub(dir);
  if (keys.KeyA) vel.sub(right);
  if (keys.KeyD) vel.add(right);

  if (!vel.lengthSq()) return;

  vel.normalize().multiplyScalar(SPEED * dt);

  const nx = camera.position.clone();
  nx.x += vel.x;
  if (!collides(nx, PLAYER_RADIUS)) camera.position.x = nx.x;

  const nz = camera.position.clone();
  nz.z += vel.z;
  if (!collides(nz, PLAYER_RADIUS)) camera.position.z = nz.z;
}
