import * as THREE from '../libs/three.module.js';

// ======================================================
// Cena
// ======================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x151515);

// ======================================================
// Câmera (player)
// ======================================================
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.7, 0);

// ======================================================
// Renderer
// ======================================================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ======================================================
// Luz
// ======================================================
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

const light = new THREE.PointLight(0xffffff, 1, 60);
light.position.set(0, 6, 0);
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
floorTex.repeat.set(8, 8);

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

function createWall(w, h, d, x, y, z) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    wallMat
  );
  m.position.set(x, y, z);
  scene.add(m);

  const box = new THREE.Box3().setFromObject(m);
  colliders.push(box);
}

// ======================================================
// Castelo – 4 salas
// ======================================================
const roomSize = 10;
const wallH = 4;

// Sala 1 (origem)
createFloor(roomSize, roomSize, 0, 0);
createWall(roomSize, wallH, 0.5, 0, 2, -roomSize / 2);
createWall(roomSize, wallH, 0.5, 0, 2, roomSize / 2);
createWall(0.5, wallH, roomSize, -roomSize / 2, 2, 0);

// Sala 2 (direita)
createFloor(roomSize, roomSize, 15, 0);
createWall(roomSize, wallH, 0.5, 15, 2, -roomSize / 2);
createWall(roomSize, wallH, 0.5, 15, 2, roomSize / 2);
createWall(0.5, wallH, roomSize, 15 + roomSize / 2, 2, 0);

// Sala 3 (frente)
createFloor(roomSize, roomSize, 0, -15);
createWall(roomSize, wallH, 0.5, 0, 2, -15 - roomSize / 2);
createWall(0.5, wallH, roomSize, -roomSize / 2, 2, -15);
createWall(0.5, wallH, roomSize, roomSize / 2, 2, -15);

// Sala 4 (diagonal)
createFloor(roomSize, roomSize, 15, -15);
createWall(roomSize, wallH, 0.5, 15, 2, -15 - roomSize / 2);
createWall(0.5, wallH, roomSize, 15 + roomSize / 2, 2, -15);
createWall(0.5, wallH, roomSize, 15 - roomSize / 2, 2, -15);

// ======================================================
// Corredores
// ======================================================
createFloor(5, 4, 7.5, 0);
createFloor(4, 5, 0, -7.5);
createFloor(5, 4, 7.5, -7.5);

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
// Colisão – verificação
// ======================================================
function collides(pos) {
  const playerBox = new THREE.Box3(
    new THREE.Vector3(
      pos.x - playerRadius,
      pos.y - 1.7,
      pos.z - playerRadius
    ),
    new THREE.Vector3(
      pos.x + playerRadius,
      pos.y + 0.2,
      pos.z + playerRadius
    )
  );

  return colliders.some(box => box.intersectsBox(playerBox));
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

  const right = new THREE.Vector3()
    .crossVectors(dir, camera.up)
    .normalize();

  const velocity = new THREE.Vector3();

  if (keys.KeyW) velocity.add(dir);
  if (keys.KeyS) velocity.sub(dir);
  if (keys.KeyA) velocity.sub(right);
  if (keys.KeyD) velocity.add(right);

  if (velocity.lengthSq() === 0) return;

  velocity.normalize().multiplyScalar(speed * dt);

  // Movimento separado (X / Z) para deslizar
  const nextX = camera.position.clone();
  nextX.x += velocity.x;
  if (!collides(nextX)) camera.position.x = nextX.x;

  const nextZ = camera.position.clone();
  nextZ.z += velocity.z;
  if (!collides(nextZ)) camera.position.z = nextZ.z;

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
