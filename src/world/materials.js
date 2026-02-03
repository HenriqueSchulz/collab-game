import * as THREE from '../libs/three.module.js';

const loader = new THREE.TextureLoader();

const wallTex = loader.load('../textures/stone_wall.jpg');
wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;

const floorTex = loader.load('../textures/floor.jpg');
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;

export const wallMat = new THREE.MeshStandardMaterial({ map: wallTex });
export const floorMat = new THREE.MeshStandardMaterial({ map: floorTex });
