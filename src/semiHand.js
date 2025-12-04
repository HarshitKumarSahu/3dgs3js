
// // main.js — Vite + Three.js r168+
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

// const canvas = document.getElementById('semi-hand');
// if (!canvas) throw new Error("Canvas #semi-hand not found!");

// const scene = new THREE.Scene();
// // scene.background = null; // already transparent because alpha: true

// const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
// camera.position.set(4, 3, 1);

// const renderer = new THREE.WebGLRenderer({
//   canvas,
//   antialias: true,
//   alpha: true                     // ← transparent background
// });
// renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setClearColor(0x000000, 0); // fully transparent

// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.enableZoom = false;
// controls.autoRotate = true;           // ← beautiful slow rotation
// controls.autoRotateSpeed = 0.5;

// // ——————— Helpers ———————
// scene.add(new THREE.GridHelper(10, 20, 0x444444, 0x333333));
// // scene.add(new THREE.AxesHelper(3));

// // ——————— Glowing Particles Shader ———————
// const particlesMaterial = new THREE.ShaderMaterial({
//   transparent: true,
//   depthWrite: false,
//   blending: THREE.AdditiveBlending,
//   uniforms: {
//     uTime: { value: 0 },
//     uSize: { value: 7.0 }
//   },
//   vertexShader: `
//     uniform float uTime;
//     uniform float uSize;
//     attribute float aScale;        // per-particle scale (more in center!)
//     attribute vec3 aRandom;

//     varying float vDistFromCenter;

//     void main() {
//       vec3 pos = position;

//       // Gentle floating
//       float t = uTime * 0.6;
//       pos += aRandom * sin(t + aRandom.y * 10.0) * 0.07;

//       vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
//       gl_Position = projectionMatrix * mvPosition;

//       // Bigger particles in center
//       gl_PointSize = uSize * aScale * (1.0 + sin(t * 2.0) * 0.2) / (-mvPosition.z);

//       vDistFromCenter = length(pos.xy);   // for color falloff
//     }
//   `,
//   fragmentShader: `
//     varying float vDistFromCenter;

//     void main() {
//       // Soft round particle
//       float strength = 1.0 - length(gl_PointCoord - vec2(0.5));
//       strength = smoothstep(0.0, 1.0, strength * 1.4);

//       // Warm center → white edge
//       float falloff = pow(vDistFromCenter, 2.6);
//       vec3 color = mix(vec3(1.0), vec3(1.0, 0.75, 0.3), 1.0 - falloff);

//       gl_FragColor = vec4(color, strength);
//     }
//   `
// });

// // ——————— Load Model & Create Dense-Center Particles ————————
// const loader = new GLTFLoader();
// const draco = new DRACOLoader();
// draco.setDecoderPath('/draco/');
// loader.setDRACOLoader(draco);

// let particles;

// loader.load('/hand.glb', (gltf) => {
//   const mesh = gltf.scene.children.find(c => c.isMesh);
//   if (!mesh) return console.error("No mesh found");

//   // DON'T center or scale — keep exactly as in Blender
//   // Only make sure it's visible for sampling
//   mesh.updateMatrixWorld();

//   const sampler = new MeshSurfaceSampler(mesh).build();

//   const numParticles = 30000; // lots!
//   const positions = new Float32Array(numParticles * 3);
//   const scales = new Float32Array(numParticles);
//   const randoms = new Float32Array(numParticles * 3);

//   const tempPos = new THREE.Vector3();
//   const tempNormal = new THREE.Vector3();

//   for (let i = 0; i < numParticles; i++) {
//     sampler.sample(tempPos, tempNormal);

//     // Bias toward center: reject points too far from center
//     const distFromCenter = tempPos.length();
//     if (Math.random() > (distFromCenter * 1.8)) { // magic number → more center bias
//       i--; // retry this particle
//       continue;
//     }

//     positions[i * 3]     = tempPos.x;
//     positions[i * 3 + 1] = tempPos.y;
//     positions[i * 3 + 2] = tempPos.z;

//     // Particles near center = bigger + brighter
//     const centerBias = 1.0 - Math.min(distFromCenter * 1.4, 1.0);
//     scales[i] = 1.0 + centerBias * 4.0; // up to 5× bigger in middle

//     randoms[i * 3]     = Math.random();
//     randoms[i * 3 + 1] = Math.random();
//     randoms[i * 3 + 2] = Math.random();
//   }

//   const geo = new THREE.BufferGeometry();
//   geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//   geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
//   geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));

//   particles = new THREE.Points(geo, particlesMaterial);

//   scene.add(particles);

//   // Optional: hide original mesh
//   mesh.visible = false;
// });

// // ——————— Animation ———————
// const clock = new THREE.Clock();

// function animate() {
//   requestAnimationFrame(animate);

//   const elapsed = clock.getElapsedTime();

//   if (particles) {
//     particles.rotation.y = elapsed * 0.05; // extra slow spin
//     particlesMaterial.uniforms.uTime.value = elapsed;
//   }

//   controls.update();
//   renderer.render(scene, camera);
// }
// animate();

// // ——————— Resize ———————
// window.addEventListener('resize', () => {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize(window.innerWidth, window.innerHeight);
// });



// // main.js — final version using your exact HTML
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

// const canvas = document.getElementById('semi-hand');
// if (!canvas) throw new Error("Canvas #semi-hand not found!");

// const scene = new THREE.Scene();

// const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
// camera.position.set(4, 3, 1);

// const renderer = new THREE.WebGLRenderer({
//   canvas,
//   antialias: true,
//   alpha: true
// });
// renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setClearColor(0x000000, 0);

// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.enableZoom = false;
// controls.autoRotate = true;
// controls.autoRotateSpeed = 0.5;

// scene.add(new THREE.GridHelper(10, 20, 0x444444, 0x333333));

// const particlesMaterial = new THREE.ShaderMaterial({
//   transparent: true,
//   depthWrite: false,
//   blending: THREE.AdditiveBlending,
//   uniforms: {
//     uTime: { value: 0 },
//     uSize: { value: 7.0 }
//   },
//   vertexShader: `
//     uniform float uTime;
//     uniform float uSize;
//     attribute float aScale;
//     attribute vec3 aRandom;
//     varying float vDistFromCenter;

//     void main() {
//       vec3 pos = position;
//       float t = uTime * 0.6;
//       pos += aRandom * sin(t + aRandom.y * 10.0) * 0.07;

//       vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
//       gl_Position = projectionMatrix * mvPosition;
//       gl_PointSize = uSize * aScale * (1.0 + sin(t * 2.0) * 0.2) / (-mvPosition.z);

//       vDistFromCenter = length(pos.xy);
//     }
//   `,
//   fragmentShader: `
//     varying float vDistFromCenter;
//     void main() {
//       float strength = 1.0 - length(gl_PointCoord - vec2(0.5));
//       strength = smoothstep(0.0, 1.0, strength * 1.4);
//       float falloff = pow(vDistFromCenter, 2.6);
//       vec3 color = mix(vec3(1.0), vec3(1.0, 0.75, 0.3), 1.0 - falloff);
//       gl_FragColor = vec4(color, strength);
//     }
//   `
// });

// // ——————— GLOBALS ———————
// let meshForSampling = null;
// let currentParticles = null;

// // ——————— CREATE / REPLACE PARTICLES ———————
// function createParticles(count) {
//   if (!meshForSampling) return;

//   // Destroy old
//   if (currentParticles) {
//     currentParticles.geometry.dispose();
//     scene.remove(currentParticles);
//   }

//   const sampler = new MeshSurfaceSampler(meshForSampling).build();
//   const positions = new Float32Array(count * 3);
//   const scales    = new Float32Array(count);
//   const randoms   = new Float32Array(count * 3);
//   const tempPos   = new THREE.Vector3();

//   for (let i = 0; i < count; i++) {
//     sampler.sample(tempPos);
//     const dist = tempPos.length();

//     // Strong center bias
//     if (Math.random() > (dist * 1.9)) { i--; continue; }

//     positions[i*3]   = tempPos.x;
//     positions[i*3+1] = tempPos.y;
//     positions[i*3+2] = tempPos.z;

//     const bias = 1.0 - Math.min(dist * 1.5, 1.0);
//     scales[i] = 1.0 + bias * 4.5;

//     randoms[i*3]   = Math.random();
//     randoms[i*3+1] = Math.random();
//     randoms[i*3+2] = Math.random();
//   }

//   const geo = new THREE.BufferGeometry();
//   geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//   geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
//   geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));

//   currentParticles = new THREE.Points(geo, particlesMaterial);
//   scene.add(currentParticles);

//   // Update your label
//   document.getElementById('count').textContent = count.toLocaleString();
// }

// // ——————— LOAD MODEL ———————
// const loader = new GLTFLoader();
// const draco = new DRACOLoader();
// draco.setDecoderPath('/draco/');
// loader.setDRACOLoader(draco);

// loader.load('/hand.glb', (gltf) => {
//   meshForSampling = gltf.scene.children.find(c => c.isMesh);
//   if (!meshForSampling) return console.error("No mesh in GLB");

//   meshForSampling.visible = false;
//   scene.add(meshForSampling);

//   createParticles(10000); // initial count matching your slider default
// });

// // ——————— YOUR SLIDER ———————
// const slider = document.getElementById('particleCount');

// slider.addEventListener('input', (e) => {
//   document.getElementById('count').textContent = Number(e.target.value).toLocaleString();
// });

// slider.addEventListener('change', (e) => {
//   createParticles(Number(e.target.value));
// });

// // ——————— ANIMATION ———————
// const clock = new THREE.Clock();
// function animate() {
//   requestAnimationFrame(animate);
//   const t = clock.getElapsedTime();

//   if (currentParticles) {
//     currentParticles.rotation.y = t * 0.05;
//     particlesMaterial.uniforms.uTime.value = t;
//   }

//   controls.update();
//   renderer.render(scene, camera);
// }
// animate();

// // Resize
// window.addEventListener('resize', () => {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize(window.innerWidth, window.innerHeight);
// });



import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

const canvas = document.getElementById('semi-hand');
if (!canvas) throw new Error("Canvas #semi-hand not found!");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3, 1.74, 1);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

scene.add(new THREE.GridHelper(10, 20, 0x444444, 0x333333));

// --- Fix particle size ---
// Allow to set particle size via uniform, optionally adapt to screen dpi/size.
const PARTICLE_SIZE = 0.175; // fix: slightly larger and easier to see (adjust as needed)

const particlesMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uTime:   { value: 0 },
    uScale:  { value: 1.0 },
    uColor1: { value: new THREE.Color(0x3c3c3c) }, // warm center
    uColor2: { value: new THREE.Color(0x9c9c9c) }, // white edges
    uPointSize: { value: PARTICLE_SIZE }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uScale;
    uniform float uPointSize;
    attribute vec3 aRandom;

    void main() {
        vUv = uv;
        float PI = 3.1415925;
        vPosition = position;

        vec3 pos = position;
        float time = uTime * 3.25;

        pos.x += sin(time * aRandom.x) * 0.01;
        pos.y += cos(time * aRandom.y) * 0.01;
        pos.z += sin(time * aRandom.z) * 0.01;

        pos.x *= uScale + (sin(pos.y * 4.0 + time) * (1.0 - uScale));
        pos.y *= uScale + (cos(pos.z * 4.0 + time) * (1.0 - uScale));
        pos.z *= uScale + (sin(pos.x * 4.0 + time) * (1.0 - uScale));

        pos *= uScale;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        // Fix: use uPointSize and scale by device pixel ratio if needed
        gl_PointSize = uPointSize * (300.0 / length(mvPosition.xyz));
        // above makes particles a bit larger at distance; old: 8.0 / -mvPosition.z;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec3 vPosition;

    void main() {
        float depth = vPosition.z * 0.5 + 0.5;
        float dist = length(gl_PointCoord - vec2(0.5));
        // Soft circular particles
        if(dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.0, dist);
        vec3 color = mix(uColor1, uColor2, depth);
        gl_FragColor = vec4(color, (depth * 0.3 + 0.2) * alpha);
    }
  `
});

// GLOBALS
let meshForSampling = null;
let currentParticles = null;

// CREATE / REPLACE PARTICLES
function createParticles(count) {
  if (!meshForSampling) return;

  if (currentParticles) {
    currentParticles.geometry.dispose();
    scene.remove(currentParticles);
  }

  const sampler = new MeshSurfaceSampler(meshForSampling).build();
  const positions = new Float32Array(count * 3);
  const randoms   = new Float32Array(count * 3);
  const tempPos   = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    sampler.sample(tempPos);
    const dist = tempPos.length();

    // Keep more particles near center
    if (Math.random() > dist * 1.9) { i--; continue; }

    positions[i*3]   = tempPos.x;
    positions[i*3+1] = tempPos.y;
    positions[i*3+2] = tempPos.z;

    randoms[i*3]   = Math.random() * 2.0 - 1.0;
    randoms[i*3+1] = Math.random() * 2.0 - 1.0;
    randoms[i*3+2] = Math.random() * 2.0 - 1.0;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aRandom',  new THREE.BufferAttribute(randoms,   3));

  currentParticles = new THREE.Points(geo, particlesMaterial);
  scene.add(currentParticles);

  document.getElementById('count').textContent = count.toLocaleString();
}

// LOAD MODEL
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('/draco/');
loader.setDRACOLoader(draco);

loader.load('/hand.glb', (gltf) => {
  meshForSampling = gltf.scene.children.find(c => c.isMesh);
  if (!meshForSampling) return console.error("No mesh");

  meshForSampling.visible = false;
  scene.add(meshForSampling);

  createParticles(10000); // matches your slider default
});

// SLIDER — uses your exact HTML
const slider = document.getElementById('particleCount');

slider.addEventListener('input', (e) => {
  document.getElementById('count').textContent = Number(e.target.value).toLocaleString();
});

slider.addEventListener('change', (e) => {
  createParticles(Number(e.target.value));
});

// ANIMATION LOOP
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (currentParticles) {
    particlesMaterial.uniforms.uTime.value = t;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// RESIZE
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});