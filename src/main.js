import * as THREE from '../libs/three.module.js';

// =================== Cena ===================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// =================== Câmera ===================
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(-12, 1.7, -12);

// =================== Renderer ===================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// =================== Luz ===================
scene.add(new THREE.AmbientLight(0xffffff, 0.45));

// =================== Texturas ===================
const loader = new THREE.TextureLoader();

const wallTex = loader.load('../textures/stone_wall.jpg');
wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;

const floorTex = loader.load('../textures/floor.jpg');
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;

// =================== Materiais ===================
const wallMat = new THREE.MeshStandardMaterial({ map: wallTex });
const floorMat = new THREE.MeshStandardMaterial({ map: floorTex });

// =================== Colisão ===================
const colliders = [];
const PLAYER_RADIUS = 0.4;

// =================== Helpers ===================
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
  colliders.push(new THREE.Box3().setFromObject(m));
}

// =================== Blocos ===================
const ROOM = 10;
const CORR = 4;
const WALL = 0.5;
const H = 4;
const OFFSET = ROOM + CORR;

// =================== Sala ===================
function createRoom(cx, cz, open = {}) {
  floor(ROOM, ROOM, cx, cz);

  if (!open.n) wall(ROOM, H, WALL, cx, cz - ROOM / 2);
  if (!open.s) wall(ROOM, H, WALL, cx, cz + ROOM / 2);
  if (!open.w) wall(WALL, H, ROOM, cx - ROOM / 2, cz);
  if (!open.e) wall(WALL, H, ROOM, cx + ROOM / 2, cz);
}

// =================== Corredor horizontal ===================
function corridorH(cx, cz) {
  floor(CORR, ROOM / 2, cx, cz);
  wall(CORR, H, WALL, cx, cz - ROOM / 4);
  wall(CORR, H, WALL, cx, cz + ROOM / 4);
}

// =================== Corredor vertical ===================
function corridorV(cx, cz) {
  floor(ROOM / 2, CORR, cx, cz);
  wall(WALL, H, CORR, cx - ROOM / 4, cz);
  wall(WALL, H, CORR, cx + ROOM / 4, cz);
}

// =================== Construção do mapa ===================

// SALAS
createRoom(-OFFSET, -OFFSET, { e: true, s: true }); // Sala 1
createRoom( OFFSET, -OFFSET, { w: true, s: true }); // Sala 2
createRoom(-OFFSET,  OFFSET, { e: true, n: true }); // Sala 3
createRoom( OFFSET,  OFFSET, { w: true, n: true }); // Sala 4

// CORREDORES
corridorH(0, -OFFSET); // entre 1 e 2
corridorH(0,  OFFSET); // entre 3 e 4
corridorV(-OFFSET, 0); // entre 1 e 3
corridorV( OFFSET, 0); // entre 2 e 4

// =================== Input ===================
const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);
document.body.addEventListener('click', () => document.body.requestPointerLock());

let yaw = 0, pitch = 0;
document.addEventListener('mousemove', e => {
  if (document.pointerLockElement !== document.body) return;
  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
});

// =================== Colisão ===================
function collides(pos) {
  const box = new THREE.Box3(
    new THREE.Vector3(pos.x - PLAYER_RADIUS, 0, pos.z - PLAYER_RADIUS),
    new THREE.Vector3(pos.x + PLAYER_RADIUS, 2, pos.z + PLAYER_RADIUS)
  );
  return colliders.some(c => c.intersectsBox(box));
}

// =================== Movimento ===================
const clock = new THREE.Clock();
const SPEED = 5;

function move(dt) {
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

  if (!vel.lengthSq()) return;
  vel.normalize().multiplyScalar(SPEED * dt);

  const nx = camera.position.clone(); nx.x += vel.x;
  if (!collides(nx)) camera.position.x = nx.x;

  const nz = camera.position.clone(); nz.z += vel.z;
  if (!collides(nz)) camera.position.z = nz.z;

  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}

// =================== Loop ===================
function animate() {
  requestAnimationFrame(animate);
  move(clock.getDelta());
  renderer.render(scene, camera);
}
animate();