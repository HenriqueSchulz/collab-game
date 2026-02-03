import * as THREE from '../libs/three.module.js';

import { scene } from './core/scene.js';
import { camera } from './core/camera.js';
import { startLoop, onUpdate } from './core/loop.js';
import { initInput, keys, yaw, pitch } from './core/input.js';

import { buildMap } from './world/map.js';
import { updatePlayer } from './player/player.js';

initInput();
buildMap(scene);

const clock = new THREE.Clock();

onUpdate(dt => {
  updatePlayer(camera, keys, yaw, pitch, dt);
});

startLoop(clock);