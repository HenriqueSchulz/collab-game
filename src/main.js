import * as THREE from '../libs/three.module.js';

// ======================================================
// Cena
// ======================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// ======================================================
// Câmera
// ======================================================
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(-6, 1.7, -6);

// ======================================================
// Renderer (leve, sem sombras)
// ======================================================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ======================================================
// Luz simples
// ======================================================
scene.add(new THREE.AmbientLight(0xffffff, 0.45));
const light = new THREE.PointLight(0xffffff, 0.6);
light.position.set(0, 8, 0);
scene.add(light);

// ======================================================
// Texturas
// ======================================================
const loader = new THREE.TextureLoader();

const wallTex = loader.load('../textures/stone_wall.jpg');
wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
wallTex.repeat.set(2, 1);

const floorTex = loader.load('../textures/floor.jpg');
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
floorTex.repeat.set(10, 10);

// ======================================================
// Materiais
// ======================================================
const wallMat = new THREE.MeshStandardMaterial({ map: wallTex });
const floorMat = new THREE.MeshStandardMaterial({ map: floorTex });

// ======================================================
// Colisão
// ======================================================
const colliders = [];
const PLAYER_RADIUS = 0.4;

// ======================================================
// Helpers
// ======================================================
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

// ======================================================
// Dimensões globais (grade)
// ======================================================
const ROOM = 10;
const CORR = 4;
const WALL = 0.5;
const H = 4;

const TOTAL = ROOM * 2 + CORR;

// ======================================================
// Chão completo (quadrado único)
// ======================================================
floor(TOTAL, TOTAL, 0, 0);

// ======================================================
// Paredes externas (quadrado perfeito)
// ======================================================
wall(TOTAL, H, WALL, 0, -TOTAL / 2);
wall(TOTAL, H, WALL, 0,  TOTAL / 2);
wall(WALL,  H, TOTAL, -TOTAL / 2, 0);
wall(WALL,  H, TOTAL,  TOTAL / 2, 0);

// ======================================================
// Paredes internas (salas)
// ======================================================

// Horizontais
wall(TOTAL - ROOM, H, WALL, 0, -CORR / 2);
wall(TOTAL - ROOM, H, WALL, 0,  CORR / 2);

// Verticais
wall(WALL, H, TOTAL - ROOM, -CORR / 2, 0);
wall(WALL, H, TOTAL - ROOM,  CORR / 2, 0);

// ======================================================
// Input
// ======================================================
const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

document.body.addEventListener('click', () => document.body.requestPointerLock());

// Mouse look
let yaw = 0, pitch = 0;
document.addEventListener('mousemove', e => {
  if (document.pointerLockElement !== document.body) return;
  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
});

// ======================================================
// Colisão
// ======================================================
function collides(pos) {
  const box = new THREE.Box3(
    new THREE.Vector3(pos.x - PLAYER_RADIUS, 0, pos.z - PLAYER_RADIUS),
    new THREE.Vector3(pos.x + PLAYER_RADIUS, 2, pos.z + PLAYER_RADIUS)
  );
  return colliders.some(c => c.intersectsBox(box));
}

// ======================================================
// Movimento
// ======================================================
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

  const nx = camera.position.clone();
  nx.x += vel.x;
  if (!collides(nx)) camera.position.x = nx.x;

  const nz = camera.position.clone();
  nz.z += vel.z;
  if (!collides(nz)) camera.position.z = nz.z;

  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}

// ======================================================
// Loop
// ======================================================
function animate() {
  requestAnimationFrame(animate);
  move(clock.getDelta());
  renderer.render(scene, camera);
}
animate();

// ======================================================
// Resize
// ======================================================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});