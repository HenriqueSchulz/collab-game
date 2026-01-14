import * as THREE from '../libs/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/controls/PointerLockControls.js';

/* =========================
   CENA / CAMERA / RENDER
========================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* =========================
   CONTROLES
========================= */
const controls = new PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => controls.lock());
scene.add(controls.getObject());

camera.position.set(0, 1.6, 5);

/* =========================
   LUZ
========================= */
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const light = new THREE.DirectionalLight(0xffffff, 0.6);
light.position.set(10, 20, 10);
scene.add(light);

/* =========================
   CHÃO
========================= */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x333333 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

/* =========================
   COLISÕES
========================= */
const colliders = [];

/* =========================
   HELPERS
========================= */
function createWall(x, z, w, h = 3, d = 0.5) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: 0x777777 })
  );
  wall.position.set(x, h / 2, z);
  scene.add(wall);
  colliders.push(wall);
}

function createWallVertical(x, z, d, h = 3, w = 0.5) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: 0x777777 })
  );
  wall.position.set(x, h / 2, z);
  scene.add(wall);
  colliders.push(wall);
}

function createCorridor(x, z, w, d) {
  const corridor = new THREE.Mesh(
    new THREE.BoxGeometry(w, 2.5, d),
    new THREE.MeshStandardMaterial({ color: 0x555555 })
  );
  corridor.position.set(x, 1.25, z);
  scene.add(corridor);
  colliders.push(corridor);
}

/* =========================
   SALA
========================= */
class Room {
  constructor(x, z, w, h) {
    this.x = x;
    this.z = z;
    this.w = w;
    this.h = h;
    this.door = null;
  }
}

/* =========================
   PORTA (CENTRO DA PAREDE)
========================= */
function createDoor(room) {
  const side = Math.floor(Math.random() * 4); // 0 N | 1 S | 2 E | 3 W

  switch (side) {
    case 0:
      room.door = { x: room.x, z: room.z - room.h / 2, dir: 'N' };
      break;
    case 1:
      room.door = { x: room.x, z: room.z + room.h / 2, dir: 'S' };
      break;
    case 2:
      room.door = { x: room.x + room.w / 2, z: room.z, dir: 'E' };
      break;
    case 3:
      room.door = { x: room.x - room.w / 2, z: room.z, dir: 'W' };
      break;
  }
}

/* =========================
   CONSTRUIR SALA (4 PAREDES)
========================= */
function buildRoom(room) {
  const t = 0.5;

  // Norte
  if (room.door.dir !== 'N')
    createWall(room.x, room.z - room.h / 2, room.w);

  // Sul
  if (room.door.dir !== 'S')
    createWall(room.x, room.z + room.h / 2, room.w);

  // Leste
  if (room.door.dir !== 'E')
    createWallVertical(room.x + room.w / 2, room.z, room.h);

  // Oeste
  if (room.door.dir !== 'W')
    createWallVertical(room.x - room.w / 2, room.z, room.h);
}

/* =========================
   CORREDOR CONECTADO À PORTA
========================= */
function buildCorridor(room) {
  const len = 10;
  const w = 2;
  const d = room.door;

  switch (d.dir) {
    case 'N':
      createCorridor(d.x, d.z - len / 2, w, len);
      break;
    case 'S':
      createCorridor(d.x, d.z + len / 2, w, len);
      break;
    case 'E':
      createCorridor(d.x + len / 2, d.z, len, w);
      break;
    case 'W':
      createCorridor(d.x - len / 2, d.z, len, w);
      break;
  }
}

/* =========================
   GERAR MAPA
========================= */
const room = new Room(0, 0, 12, 10);
createDoor(room);
buildRoom(room);
buildCorridor(room);

/* =========================
   MOVIMENTO
========================= */
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const keys = {};

document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

/* =========================
   LOOP
========================= */
function animate() {
  requestAnimationFrame(animate);

  direction.set(0, 0, 0);
  if (keys['KeyW']) direction.z -= 1;
  if (keys['KeyS']) direction.z += 1;
  if (keys['KeyA']) direction.x -= 1;
  if (keys['KeyD']) direction.x += 1;
  direction.normalize();

  controls.moveRight(direction.x * 0.08);
  controls.moveForward(direction.z * 0.08);

  renderer.render(scene, camera);
}

animate();