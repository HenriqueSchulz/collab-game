import * as THREE from '../../libs/three.module.js';
import { wallMat, floorMat } from './materials.js';
import { addCollider } from './colliders.js';
import {
  ROOM_HEIGHT,
  WALL_THICKNESS,
  CORRIDOR_LENGTH,
  CORRIDOR_WIDTH
} from './constants.js';

function floor(scene, w, d, x, z) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0, z);
  scene.add(m);
}

function wall(scene, w, h, d, x, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  m.position.set(x, h / 2, z);
  scene.add(m);
  addCollider(m);
}

/* ================= CORRIDORS ================= */

export function corridorH(scene, x, z) {
  floor(scene, CORRIDOR_LENGTH, CORRIDOR_WIDTH, x, z);

  wall(
    scene,
    CORRIDOR_LENGTH,
    ROOM_HEIGHT,
    WALL_THICKNESS,
    x,
    z - CORRIDOR_WIDTH / 2
  );

  wall(
    scene,
    CORRIDOR_LENGTH,
    ROOM_HEIGHT,
    WALL_THICKNESS,
    x,
    z + CORRIDOR_WIDTH / 2
  );
}

export function corridorV(scene, x, z) {
  floor(scene, CORRIDOR_WIDTH, CORRIDOR_LENGTH, x, z);

  wall(
    scene,
    WALL_THICKNESS,
    ROOM_HEIGHT,
    CORRIDOR_LENGTH,
    x - CORRIDOR_WIDTH / 2,
    z
  );

  wall(
    scene,
    WALL_THICKNESS,
    ROOM_HEIGHT,
    CORRIDOR_LENGTH,
    x + CORRIDOR_WIDTH / 2,
    z
  );
}
