import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/+esm';
//importing methods for the glb files
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js/+esm';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/FBXLoader.js/+esm';


import desertTerrainUrl from './desert_terrain.fbx?url';
import palmTreeUrl from './palm_tree.glb?url';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

//camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(20, 8, 8);
camera.lookAt(0, 0, 0);

//renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//light
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.set(5, 10, 5);
scene.add(sunLight);

// load terrain FBX
const fbxLoader = new FBXLoader();

fbxLoader.load(
  desertTerrainUrl,
  (terrain) => {
    terrain.position.set(0, -10, 0);
    terrain.scale.set(0.0005, 0.0005, 0.0005) // adjust as needed
    terrain.rotation.y = 0;
    terrain.rotation.z = 204.3;

    terrain.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = true;

        // give it a desert-like material if the FBX has no material
        if (!child.material) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xb7a674
          });
        }
      }
    });

    scene.add(terrain);
  },
  undefined,
  (error) => {
    console.error('Error loading desert terrain FBX:', error);
  }
);

const loader = new GLTFLoader();

//palm trees
loader.load(
  palmTreeUrl,
  (gltf) => {
    const tree1 = gltf.scene;
    tree1.position.set(0, -9, 0);
    tree1.scale.set(1, 1, 1);
    scene.add(tree1);

    const tree2 = tree1.clone();
    tree2.position.set(2, -9, -1);
    scene.add(tree2);

    const tree3 = tree1.clone();
    tree3.position.set(0, -9, 2);
    scene.add(tree3);
  },
);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();