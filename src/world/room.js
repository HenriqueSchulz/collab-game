import * as THREE from '../../libs/three.module.js';
import { wallMat, floorMat } from './materials.js';
import { addCollider } from './colliders.js';
import { ROOM_SIZE, ROOM_HEIGHT, WALL_THICKNESS, DOOR_WIDTH } from './constants.js';

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

export function room(scene, x, z, doors = []) {
  const has = d => doors.includes(d);
  const half = ROOM_SIZE / 2;
  const side = (ROOM_SIZE - DOOR_WIDTH) / 2;

  floor(scene, ROOM_SIZE, ROOM_SIZE, x, z);

  // NORTH
  has('n')
    ? (
        wall(scene, side, ROOM_HEIGHT, WALL_THICKNESS, x - (DOOR_WIDTH + side) / 2, z - half),
        wall(scene, side, ROOM_HEIGHT, WALL_THICKNESS, x + (DOOR_WIDTH + side) / 2, z - half)
      )
    : wall(scene, ROOM_SIZE, ROOM_HEIGHT, WALL_THICKNESS, x, z - half);

  // SOUTH
  has('s')
    ? (
        wall(scene, side, ROOM_HEIGHT, WALL_THICKNESS, x - (DOOR_WIDTH + side) / 2, z + half),
        wall(scene, side, ROOM_HEIGHT, WALL_THICKNESS, x + (DOOR_WIDTH + side) / 2, z + half)
      )
    : wall(scene, ROOM_SIZE, ROOM_HEIGHT, WALL_THICKNESS, x, z + half);

  // WEST
  has('w')
    ? (
        wall(scene, WALL_THICKNESS, ROOM_HEIGHT, side, x - half, z - (DOOR_WIDTH + side) / 2),
        wall(scene, WALL_THICKNESS, ROOM_HEIGHT, side, x - half, z + (DOOR_WIDTH + side) / 2)
      )
    : wall(scene, WALL_THICKNESS, ROOM_HEIGHT, ROOM_SIZE, x - half, z);

  // EAST
  has('e')
    ? (
        wall(scene, WALL_THICKNESS, ROOM_HEIGHT, side, x + half, z - (DOOR_WIDTH + side) / 2),
        wall(scene, WALL_THICKNESS, ROOM_HEIGHT, side, x + half, z + (DOOR_WIDTH + side) / 2)
      )
    : wall(scene, WALL_THICKNESS, ROOM_HEIGHT, ROOM_SIZE, x + half, z);
}
