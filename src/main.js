import * as THREE from '../libs/three.module.js';

// ======================
// Cena básica
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

// ======================
// Câmera (player)
// ======================
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.7, 5);

// ======================
// Renderer
// ======================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ======================
// Luz
// ======================
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// ======================
// Chão
// ======================
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// ======================
// Castelo (paredes simples)
// ======================
function wall(x, z, w, d) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, 4, d),
    new THREE.MeshStandardMaterial({ color: 0x666666 })
  );
  mesh.position.set(x, 2, z);
  scene.add(mesh);
}

wall(0, -10, 20, 1);
wall(0, 10, 20, 1);
wall(-10, 0, 1, 20);
wall(10, 0, 1, 20);

// ======================
// Input
// ======================
const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

// Pointer Lock
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

// ======================
// Movimento
// ======================
const speed = 5;
const clock = new THREE.Clock();

function updateMovement(dt) {
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  direction.y = 0;
  direction.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(direction, camera.up).normalize();

  if (keys['KeyW']) camera.position.addScaledVector(direction, speed * dt);
  if (keys['KeyS']) camera.position.addScaledVector(direction, -speed * dt);
  if (keys['KeyA']) camera.position.addScaledVector(right, -speed * dt);
  if (keys['KeyD']) camera.position.addScaledVector(right, speed * dt);

  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}

// ======================
// Loop
// ======================
function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  updateMovement(dt);

  renderer.render(scene, camera);
}

animate();

// ======================
// Resize
// ======================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
