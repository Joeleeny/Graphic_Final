import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/+esm';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js/+esm';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/PointerLockControls.js/+esm';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

import palmTreeUrl from './palm_tree.glb?url';
import retroTVURL from './TheRetroTV.glb?url';

const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 8);

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = '0';
document.body.appendChild(renderer.domElement);

// lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.set(5, 10, 5);
scene.add(sunLight);

// skybox
const skyLoader = new THREE.CubeTextureLoader();
scene.background = skyLoader.load([
  '/skybox/px.png',
  '/skybox/nx.png',
  '/skybox/py.png',
  '/skybox/ny.png',
  '/skybox/pz.png',
  '/skybox/nz.png'
]);

// helpers so you can see where the world is
const gridHelper = new THREE.GridHelper(40, 40);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);


// loaders
const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();

objLoader.load(
  '/desert.obj',
  (terrain) => {
    console.log('terrain loaded', terrain);

    terrain.scale.set(3.5, 3.5, 3.5);
    terrain.position.set(0, 0, 0);
    terrain.rotation.set(0, 0, 0);

    terrain.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xc2b280,
          side: THREE.DoubleSide
        });
        child.castShadow = false;
        child.receiveShadow = true;
      }
    });

    scene.add(terrain);

    const box = new THREE.BoxHelper(terrain, 0xffff00);
    scene.add(box);
  },
  undefined,
  (error) => {
    console.error('OBJ error:', error);
  }
);

// loads Shawn
objLoader.load(
  '/shawn.obj',
  (asian) => {
    console.log('asian loaded', asian);

    asian.scale.set(1.5, 1.5, 1.5);
    asian.position.set(0, 0.3, 0);
    asian.rotation.set(0, 0, 0);

    asian.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          side: THREE.DoubleSide
        });
        child.castShadow = false;
        child.receiveShadow = true;
      }
    });

    scene.add(asian);

    const box = new THREE.BoxHelper(asian, 0xffff00);
    scene.add(box);
  },
  undefined,
  (error) => {
    console.error('OBJ error:', error);
  }
);


// palm trees
gltfLoader.load(
  palmTreeUrl,
  (gltf) => {
    const tree1 = gltf.scene;
    tree1.position.set(-2, 2.1, -2);
    tree1.scale.set(1, 1, 1);
    scene.add(tree1);

    const tree2 = tree1.clone();
    tree2.position.set(2, 2, -1);
    scene.add(tree2);

    const tree3 = tree1.clone();
    tree3.position.set(0, 2.3, 2);
    scene.add(tree3);

    console.log('Palm trees loaded');
  },
  undefined,
  (error) => {
    console.error('Error loading palm_tree.glb:', error);
  }
);

// tv
gltfLoader.load(
  retroTVURL,
  (gltf) => {
    const tv = gltf.scene;
    tv.position.set(0, 0, -3);
    tv.scale.set(0.1, 0.1, 0.1);
    scene.add(tv);

    console.log('TV loaded');
  },
  undefined,
  (error) => {
    console.error('Error loading TheRetroTV.glb:', error);
  }
);



// resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// controls
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => {
  controls.lock();
});

// movement
let moveW = false;
let moveA = false;
let moveS = false;
let moveD = false;

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyW') moveW = true;
  if (event.code === 'KeyA') moveA = true;
  if (event.code === 'KeyS') moveS = true;
  if (event.code === 'KeyD') moveD = true;
});

document.addEventListener('keyup', (event) => {
  if (event.code === 'KeyW') moveW = false;
  if (event.code === 'KeyA') moveA = false;
  if (event.code === 'KeyS') moveS = false;
  if (event.code === 'KeyD') moveD = false;
});

function animate() {
  requestAnimationFrame(animate);

  if (controls.isLocked) {
    const speed = 0.08;
    if (moveW) controls.moveForward(speed);
    if (moveS) controls.moveForward(-speed);
    if (moveA) controls.moveRight(-speed);
    if (moveD) controls.moveRight(speed);
  }

  renderer.render(scene, camera);
}

animate();