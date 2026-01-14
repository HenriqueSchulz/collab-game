import * as THREE from '../libs/three.module.js';

/* ================= CONFIG ================= */

const ROOM_SIZE = 10;
const ROOM_HEIGHT = 4;
const WALL_THICKNESS = 0.4;

const DOOR_WIDTH = 3;
const CORRIDOR_LENGTH = 8;
const CORRIDOR_WIDTH = DOOR_WIDTH;

const PLAYER_RADIUS = 0.4;
const SPEED = 5;

/* ================= SCENE ================= */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(-8, 1.7, -8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

/* ================= TEXTURES ================= */

const loader = new THREE.TextureLoader();

const wallTex = loader.load('../textures/stone_wall.jpg');
wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;

const floorTex = loader.load('../textures/floor.jpg');
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;

const wallMat = new THREE.MeshStandardMaterial({ map: wallTex });
const floorMat = new THREE.MeshStandardMaterial({ map: floorTex });

/* ================= COLLISION ================= */

const colliders = [];

function addCollider(mesh) {
  colliders.push(new THREE.Box3().setFromObject(mesh));
}

/* ================= HELPERS ================= */

function floor(w, d, x, z) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0, z);
  scene.add(m);
}

function wall(w, h, d, x, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  m.position.set(x, h / 2, z);
  scene.add(m);
  addCollider(m);
}

/* ================= ROOM ================= */

function room(x, z, door) {
  floor(ROOM_SIZE, ROOM_SIZE, x, z);

  const half = ROOM_SIZE / 2;
  const side = (ROOM_SIZE - DOOR_WIDTH) / 2;

  // NORTH
  if (door === 'n') {
    wall(side, ROOM_HEIGHT, WALL_THICKNESS, x - (DOOR_WIDTH + side) / 2, z - half);
    wall(side, ROOM_HEIGHT, WALL_THICKNESS, x + (DOOR_WIDTH + side) / 2, z - half);
  } else {
    wall(ROOM_SIZE, ROOM_HEIGHT, WALL_THICKNESS, x, z - half);
  }

  // SOUTH
  if (door === 's') {
    wall(side, ROOM_HEIGHT, WALL_THICKNESS, x - (DOOR_WIDTH + side) / 2, z + half);
    wall(side, ROOM_HEIGHT, WALL_THICKNESS, x + (DOOR_WIDTH + side) / 2, z + half);
  } else {
    wall(ROOM_SIZE, ROOM_HEIGHT, WALL_THICKNESS, x, z + half);
  }

  // WEST
  if (door === 'w') {
    wall(WALL_THICKNESS, ROOM_HEIGHT, side, x - half, z - (DOOR_WIDTH + side) / 2);
    wall(WALL_THICKNESS, ROOM_HEIGHT, side, x - half, z + (DOOR_WIDTH + side) / 2);
  } else {
    wall(WALL_THICKNESS, ROOM_HEIGHT, ROOM_SIZE, x - half, z);
  }

  // EAST
  if (door === 'e') {
    wall(WALL_THICKNESS, ROOM_HEIGHT, side, x + half, z - (DOOR_WIDTH + side) / 2);
    wall(WALL_THICKNESS, ROOM_HEIGHT, side, x + half, z + (DOOR_WIDTH + side) / 2);
  } else {
    wall(WALL_THICKNESS, ROOM_HEIGHT, ROOM_SIZE, x + half, z);
  }
}

/* ================= CORRIDORS ================= */

function corridorH(x, z) {
  floor(CORRIDOR_LENGTH, CORRIDOR_WIDTH, x, z);
  wall(CORRIDOR_LENGTH, ROOM_HEIGHT, WALL_THICKNESS, x, z - CORRIDOR_WIDTH / 2);
  wall(CORRIDOR_LENGTH, ROOM_HEIGHT, WALL_THICKNESS, x, z + CORRIDOR_WIDTH / 2);
}

function corridorV(x, z) {
  floor(CORRIDOR_WIDTH, CORRIDOR_LENGTH, x, z);
  wall(WALL_THICKNESS, ROOM_HEIGHT, CORRIDOR_LENGTH, x - CORRIDOR_WIDTH / 2, z);
  wall(WALL_THICKNESS, ROOM_HEIGHT, CORRIDOR_LENGTH, x + CORRIDOR_WIDTH / 2, z);
}

/* ================= MAP (QUADRADO CORRETO) ================= */

const OFFSET = ROOM_SIZE / 2 + CORRIDOR_LENGTH / 2;

room(-OFFSET, -OFFSET, 'e'); // sala superior esquerda
room( OFFSET, -OFFSET, 'w'); // superior direita
room(-OFFSET,  OFFSET, 'e'); // inferior esquerda
room( OFFSET,  OFFSET, 'w'); // inferior direita

corridorH(0, -OFFSET);
corridorH(0,  OFFSET);
corridorV(-OFFSET, 0);
corridorV( OFFSET, 0);

/* ================= INPUT ================= */

const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

document.body.addEventListener('click', () => {
  document.body.requestPointerLock();
});

let yaw = 0;
let pitch = 0;

document.addEventListener('mousemove', e => {
  if (document.pointerLockElement !== document.body) return;
  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
});

/* ================= MOVEMENT + COLLISION ================= */

const clock = new THREE.Clock();

function collides(pos) {
  const box = new THREE.Box3(
    new THREE.Vector3(pos.x - PLAYER_RADIUS, 0, pos.z - PLAYER_RADIUS),
    new THREE.Vector3(pos.x + PLAYER_RADIUS, 2, pos.z + PLAYER_RADIUS)
  );
  return colliders.some(c => c.intersectsBox(box));
}

function update(dt) {
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  dir.y = 0;
  dir.normalize();

  const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize();
  const vel = new THREE.Vector3();

  if (keys.KeyW) vel.add(dir);
  if (keys.KeyS) vel.sub(dir);
  if (keys.KeyA) vel.sub(right);
  if (keys.KeyD) vel.add(right);

  if (vel.lengthSq()) {
    vel.normalize().multiplyScalar(SPEED * dt);

    const nx = camera.position.clone();
    nx.x += vel.x;
    if (!collides(nx)) camera.position.x = nx.x;

    const nz = camera.position.clone();
    nz.z += vel.z;
    if (!collides(nz)) camera.position.z = nz.z;
  }

  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}

/* ================= LOOP ================= */

function animate() {
  requestAnimationFrame(animate);
  update(clock.getDelta());
  renderer.render(scene, camera);
}

animate();