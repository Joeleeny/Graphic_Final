import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/+esm';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js/+esm';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/PointerLockControls.js/+esm';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

import palmTreeUrl from './palm_tree.glb?url';
import retroTVURL from './TheRetroTV.glb?url';
import hutURL from './hut.glb?url';
import poolURL from './pool.glb?url';

import { roughness } from 'three/tsl';

const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 8);

//this creates the button, could not do it in the index.html file because it would not show
const lightButton = document.createElement('button');
lightButton.textContent = 'DIM LIGHT';
lightButton.style.position = 'fixed';
lightButton.style.top = '20px';
lightButton.style.left = '20px';
lightButton.style.zIndex = '99999';
lightButton.style.padding = '14px 18px';
lightButton.style.background = 'red';
lightButton.style.color = 'white';
lightButton.style.border = '3px solid white';
lightButton.style.fontSize = '18px';
lightButton.style.fontWeight = 'bold';
lightButton.style.cursor = 'pointer';

document.body.appendChild(lightButton);

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = '0';
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.set(5, 10, 5);
scene.add(sunLight);

//button light
let lightsDimmed = false;

lightButton.addEventListener('click', () => {
  lightsDimmed = !lightsDimmed;

  if (lightsDimmed) {
    ambientLight.intensity = 0.2;
    sunLight.intensity = 0.5;
  } else {
    ambientLight.intensity = 1.2;
    sunLight.intensity = 2;
  }
});

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
// const gridHelper = new THREE.GridHelper(40, 40);
// scene.add(gridHelper);

// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// simple shader
const shader = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    varying vec3 vNormal;
    void main() {
      vec3 lightDirection = normalize(vec3(0.5, 1.0, 0.5));

      float illumination = dot(vNormal, lightDirection);
      illumination = max (illumination, 0.2);
      
      float intensity = illumination > 0.6 ? 1.0 : 0.3;
      gl_FragColor = vec4(uColor * illumination, 1.0);
    }
  `
});

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
    asian.position.set(0, 1, 0);
    asian.rotation.set(0, 1, -1.5);

    asian.traverse((child) => {
      if (child.isMesh) {
        child.material = shader;
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

//setup for fish animation
let fishModel = null;
let fishTargetIndex = 0;
//point of intrest for fish
const fishPoints = [
  new THREE.Vector3(1, 1, 0),
  new THREE.Vector3(-1, 1, 1),
  new THREE.Vector3(-2, 1, -1),
  new THREE.Vector3(-1, 1, -3)
];
//Loads "fish"
objLoader.load(
  '/orca.obj',
  (fish) => {
    console.log('fish loaded', fish);

    fish.scale.set(0.1, 0.1, 0.1);
    fish.position.copy(fishPoints[0]);
    fish.rotation.set(0, 0, 0);

    fish.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          side: THREE.DoubleSide
        });
        child.castShadow = false;
        child.receiveShadow = true;
      }
    });

    fishModel = fish;
    scene.add(fish);
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
    tree1.position.set(-3, 2.1, -3);
    tree1.scale.set(1, 1, 1);
    scene.add(tree1);

    const tree2 = tree1.clone();
    tree2.position.set(3, 2, -1);
    scene.add(tree2);

    const tree3 = tree1.clone();
    tree3.position.set(0, 2.3, 3);
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
  poolURL,
  (gltf) => {
    const pool = gltf.scene;
    pool.position.set(0, 0, -3);
    pool.scale.set(0.1, 0.1, 0.1);
    scene.add(pool);

    console.log('pool loaded');
  },
  undefined,
  (error) => {
    console.error('Error loading pool.glb:', error);
  }
);

// pool oasis
gltfLoader.load(
  poolURL,
  (gltf) => {
    const pool = gltf.scene;
    pool.position.set(0, 0, -1);
    pool.scale.set(2, 2, 2);
    pool.rotation.y = Math.PI / 1;

    scene.add(pool);

    console.log('pool loaded');
  },
  undefined,
  (error) => {
    console.error('Error loading pool.glb:', error);
  }
);

// mud hut
gltfLoader.load(
  hutURL,
  (gltf) => {
    const mudHut = gltf.scene;
    mudHut.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xd2b48c,
          roughness: 5.0,
          metalness: -1.0,
          side: THREE.DoubleSide
        })
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    mudHut.position.set(-1, 0.2, -8);
    mudHut.scale.set(0.1, 0.08, 0.1);
    scene.add(mudHut);

    console.log('mudHut loaded');
  },
  undefined,
  (error) => {
    console.error('Error loading hut.glb:', error);
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

  //A very........ Fishy..... animation
  if (fishModel) {
    const target = fishPoints[fishTargetIndex];
    const speed = 0.02;

    fishModel.position.lerp(target, speed);

    const distance = fishModel.position.distanceTo(target);

    if (distance < 0.1) {
      fishTargetIndex = (fishTargetIndex + 1) % fishPoints.length;
    }

    const nextTarget = fishPoints[fishTargetIndex];
    fishModel.lookAt(nextTarget);
  }

  //camera "animation"
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