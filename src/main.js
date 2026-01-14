import * as THREE from '../libs/three.module.js';

// ======================================================
// Cena
// ======================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101010);

// ======================================================
// Câmera
// ======================================================
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 1.7, 0);

// ======================================================
// Renderer (sem sombras)
// ======================================================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ======================================================
// Luz (leve)
// ======================================================
scene.add(new THREE.AmbientLight(0xffffff, 0.35));
const light = new THREE.PointLight(0xffffff, 0.8);
light.position.set(0, 10, 0);
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
floorTex.repeat.set(6, 6);

// ======================================================
// Materiais
// ======================================================
const wallMat = new THREE.MeshStandardMaterial({ map: wallTex });
const floorMat = new THREE.MeshStandardMaterial({ map: floorTex });

// ======================================================
// Colisão
// ======================================================
const colliders = [];
const playerRadius = 0.4;

// ======================================================
// Helpers
// ======================================================
function createFloor(w, d, x, z) {
  const f = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    floorMat
  );
  f.rotation.x = -Math.PI / 2;
  f.position.set(x, 0, z);
  scene.add(f);
}

function createWall(w, h, d, x, z) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    wallMat
  );
  m.position.set(x, h / 2, z);
  scene.add(m);

  colliders.push(new THREE.Box3().setFromObject(m));
}

// ======================================================
// Dimensões base
// ======================================================
const ROOM = 10;
const CORRIDOR_W = 4;
const WALL = 0.5;
const H = 4;

// Distância entre centros das salas
const GAP = ROOM + CORRIDOR_W;

// Coordenadas das salas (quadrado perfeito)
const S1 = [-GAP / 2, -GAP / 2];
const S2 = [ GAP / 2, -GAP / 2];
const S3 = [-GAP / 2,  GAP / 2];
const S4 = [ GAP / 2,  GAP / 2];

// ======================================================
// Função sala fechada
// ======================================================
function createRoom(cx, cz) {
  createFloor(ROOM, ROOM, cx, cz);

  createWall(ROOM, H, WALL, cx, cz - ROOM / 2);
  createWall(ROOM, H, WALL, cx, cz + ROOM / 2);
  createWall(WALL, H, ROOM, cx - ROOM / 2, cz);
  createWall(WALL, H, ROOM, cx + ROOM / 2, cz);
}

// ======================================================
// Salas
// ======================================================
createRoom(...S1);
createRoom(...S2);
createRoom(...S3);
createRoom(...S4);

// ======================================================
// Corredores horizontais
// ======================================================
createFloor(CORRIDOR_W, ROOM / 2, 0, S1[1]);
createFloor(CORRIDOR_W, ROOM / 2, 0, S3[1]);

// Paredes dos corredores horizontais
createWall(CORRIDOR_W, H, WALL, 0, S1[1] - ROOM / 4);
createWall(CORRIDOR_W, H, WALL, 0, S1[1] + ROOM / 4);
createWall(CORRIDOR_W, H, WALL, 0, S3[1] - ROOM / 4);
createWall(CORRIDOR_W, H, WALL, 0, S3[1] + ROOM / 4);

// ======================================================
// Corredores verticais
// ======================================================
createFloor(ROOM / 2, CORRIDOR_W, S1[0], 0);
createFloor(ROOM / 2, CORRIDOR_W, S2[0], 0);

// Paredes dos corredores verticais
createWall(WALL, H, CORRIDOR_W, S1[0] - ROOM / 4, 0);
createWall(WALL, H, CORRIDOR_W, S1[0] + ROOM / 4, 0);
createWall(WALL, H, CORRIDOR_W, S2[0] - ROOM / 4, 0);
createWall(WALL, H, CORRIDOR_W, S2[0] + ROOM / 4, 0);

// ======================================================
// Input
// ======================================================
const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

document.body.addEventListener('click', () => {
  document.body.requestPointerLock();
});

// Mouse look
let yaw = 0;
let pitch = 0;

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
    new THREE.Vector3(pos.x - playerRadius, 0, pos.z - playerRadius),
    new THREE.Vector3(pos.x + playerRadius, 2, pos.z + playerRadius)
  );

  return colliders.some(c => c.intersectsBox(box));
}

// ======================================================
// Movimento
// ======================================================
const speed = 5;
const clock = new THREE.Clock();

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

  vel.normalize().multiplyScalar(speed * dt);

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
