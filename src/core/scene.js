import * as THREE from '../libs/three.module.js';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
