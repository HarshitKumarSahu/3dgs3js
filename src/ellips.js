// main.js (your Vite entry point)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Grab the existing canvas
const canvas = document.getElementById('ellipes');
if (!canvas) throw new Error("Canvas #ellipes not found!");

// Scene setup
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(4, 3, 6);
camera.lookAt(0, 0.8, 0);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// // Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

// // ——— ORBIT CONTROLS (manual mouse/touch) ———
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.8;
controls.minDistance = 3;
controls.maxDistance = 10;
controls.minPolarAngle = Math.PI / 4;
controls.maxPolarAngle = Math.PI / 1.5;
controls.target.set(0, 0.8, 0);
// controls.enabled = false;

// THESE 3 LINES KILL ZOOM COMPLETELY
controls.enableZoom = false;     // ← disables mouse wheel / pinch zoom
controls.enablePan = true;       // ← keep panning if you want (or set false)
controls.enableRotate = true; // ← we'll enable only in .first section

let axesHelper = new THREE.AxesHelper(3,3,3)
axesHelper.position.set(0, 0.01,0)

scene.add(new THREE.GridHelper(10, 20, 0x444444, 0x222222));
scene.add(axesHelper);


// The exact shader you wanted (super soft, bright center → white edges)
const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    // centerColor: { value: new THREE.Color(0xffaa33) }, // warm orange-yellow
    // edgeColor: { value: new THREE.Color(0xffffff) },
    centerColor: { value: new THREE.Color(0x3c3c3c) }, // warm orange-yellow
    edgeColor: { value: new THREE.Color(0xffffff) },
    power: { value: 1.2 }                         // tweak 2.5 → 4.5 for sharpness
  },
  vertexShader: `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 centerColor;
    uniform vec3 edgeColor;
    uniform float power;
    varying vec3 vPosition;

    void main() {
      // Compute radius in XY plane once
      float radius = length(vPosition.xy);
      // Combined clamp and pow math for efficiency
      float falloff = clamp(1.0 - pow(radius, power), 0.0, 1.0);
      // Precompute alpha for efficiency
      float alpha = falloff * 0.98 + 0.02;
      // Interpolate color more directly
      gl_FragColor = vec4(mix(edgeColor, centerColor, falloff), alpha);
    }
  `,
//   side: THREE.DoubleSide
});

// Load your model
const loader = new GLTFLoader();
loader.load(
  '/ellipse.glb', // make sure it's in public/ folder in Vite
  (gltf) => {
    const model = gltf.scene;

    let scale = 2.75
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = shaderMaterial;
        child.frustumCulled = false;
        child.scale.set(scale,scale, scale)
      }
    });


    // Auto-scale (but don't move the model—place it at the center of the scene)
    // const box = new THREE.Box3().setFromObject(model);
    // const center = box.getCenter(new THREE.Vector3());
    // const size = box.getSize(new THREE.Vector3()).length();
    // if (size > 0) model.scale.setScalar(2.2 / size);

    // Explicitly set model position to (0, 0, 0) to center in scene
    model.position.set(0, 0, 0);

    scene.add(model);
  },
  (progress) => console.log('Loading:', (progress.loaded / progress.total * 100) + '%'),
  (err) => console.error('Error loading model:', err)
);

// Tiny bit of ambient so it still looks lit when you rotate
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize handler (critical for Vite)
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});












// // main.js — Vite + Three.js r168+
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

// const canvas = document.getElementById('ellipes');
// if (!canvas) throw new Error("Canvas #ellipes not found!");

// const scene = new THREE.Scene();
// // scene.background = null; // already transparent because alpha: true

// const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
// camera.position.set(4, 3, 6);

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
// scene.add(new THREE.AxesHelper(3));

// // ——————— Glowing Particles Shader ———————
// const particlesMaterial = new THREE.ShaderMaterial({
//   transparent: true,
//   depthWrite: false,
//   blending: THREE.AdditiveBlending,
//   uniforms: {
//     uTime: { value: 0 },
//     uSize: { value: 5.0 }
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

// loader.load('/ellipse.glb', (gltf) => {
//   const mesh = gltf.scene.children.find(c => c.isMesh);
//   if (!mesh) return console.error("No mesh found");

//   // DON'T center or scale — keep exactly as in Blender
//   // Only make sure it's visible for sampling
//   mesh.updateMatrixWorld();

//   const sampler = new MeshSurfaceSampler(mesh).build();

//   const numParticles = 60000; // lots!
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










// // main.js (your Vite entry point)
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
// import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

// // Grab the existing canvas
// const canvas = document.getElementById('ellipes');
// if (!canvas) throw new Error("Canvas #ellipes not found!");

// // Scene setup
// const scene = new THREE.Scene();
// // scene.background = new THREE.Color(0x111111);

// const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
// camera.position.set(4, 3, 6);
// camera.lookAt(0, 0.8, 0);

// const renderer = new THREE.WebGLRenderer({
//   canvas: canvas,
//   antialias: true,
//   alpha: true
// });
// renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(window.innerWidth, window.innerHeight);

// // // Controls
// // const controls = new OrbitControls(camera, canvas);
// // controls.enableDamping = true;

// // // ——— ORBIT CONTROLS (manual mouse/touch) ———
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;
// controls.rotateSpeed = 0.8;
// controls.minDistance = 3;
// controls.maxDistance = 10;
// controls.minPolarAngle = Math.PI / 4;
// controls.maxPolarAngle = Math.PI / 1.5;
// controls.target.set(0, 0.8, 0);
// // controls.enabled = false;

// // THESE 3 LINES KILL ZOOM COMPLETELY
// controls.enableZoom = false;     // ← disables mouse wheel / pinch zoom
// controls.enablePan = true;       // ← keep panning if you want (or set false)
// controls.enableRotate = true; // ← we'll enable only in .first section



// scene.add(new THREE.GridHelper(10, 20, 0x444444, 0x222222));

// const shaderMaterial = new THREE.ShaderMaterial({
//   uniforms: {
//     uniforms: {
//         uColor1: {
//             value: new THREE.Color(0xffaa33)
//         },
//         uColor2: {
//             value: new THREE.Color(0xffffff)
//         },
//         uTime: {
//             value: 0
//         },
//         uScale: {
//             value: 0
//         }
//     },
//     vertexShader: vertex,
//     fragmentShader: fragment,
//     transparent: true,
//     depthTest: false,
//     depthWrite: false,
//     blending: THREE.AdditiveBlending                        // tweak 2.5 → 4.5 for sharpness
//   },
//   vertexShader: `
//         varying vec2 vUv;
//         varying vec3 vPosition;
//         uniform float uTime;
//         uniform float uScale;
//         attribute vec3 aRandom;

//         void main() {
//             vUv = uv;
//             float PI = 3.1415925;
//             vPosition = position;

//             vec3 pos = position;
//             float time = uTime * 3.25;
//             pos.x += sin(time * aRandom.x) * 0.01;
//             pos.y += cos(time * aRandom.y) * 0.01;
//             pos.z += sin(time * aRandom.z) * 0.01;

//             pos.x *= uScale + (sin(pos.y * 4. + time) * (1. - uScale));
//             pos.y *= uScale + (cos(pos.z * 4. + time) * (1. - uScale));
//             pos.z *= uScale + (sin(pos.x * 4. + time) * (1. - uScale));

//             pos *= uScale; 

//             vec4 mvPosition =  modelViewMatrix * vec4(pos, 1.0);
//             gl_Position = projectionMatrix * mvPosition;
//             gl_PointSize = 8.0 / -mvPosition.z;
//         }
//   `,
//   fragmentShader: `
//         uniform vec3 uColor1;
//         uniform vec3 uColor2;
//         varying vec3 vPosition;

//         void main() { 
//             float depth = vPosition.z * 0.5 + 0.5;
//             vec3 color = mix(uColor1, uColor2, depth);
//             gl_FragColor = vec4(color, depth * 0.3 + 0.2);
//         }

//   `,
// //   side: THREE.DoubleSide
// });

// const loader = new GLTFLoader();
// const dracoLoader = new DRACOLoader();
// dracoLoader.setDecoderPath('./draco/');
// loader.setDRACOLoader(dracoLoader);

// // Load your model

// loader.load(
//   '/ellipse.glb', // make sure it's in public/ folder in Vite
//   (gltf) => {
//     const model = gltf.scene;

//     // model.traverse((child) => {
//     //   if (child.isMesh) {
//     //     child.material = shaderMaterial;
//     //     child.frustumCulled = false;
//     //   }
//     // });


//     const mesh = gltf.scene.children[0]
//     const material = new THREE.MeshBasicMaterial({
//          wireframe: true,
//         color: "red"
//     })
//     mesh.material = shaderMaterial
//     const geometry = this.mesh.geometry

//     //geometry particles
//             const sampler = new MeshSurfaceSampler(this.mesh).build();
//             const numParticles = 30000
//             this.particlesGeometry = new THREE.BufferGeometry()
//             const particlesPositions = new Float32Array(numParticles * 3)
//             const particlesRandomness = new Float32Array(numParticles * 3)

//             for (let i = 0; i < numParticles; i++) {
//                 const newPosition = new THREE.Vector3();
//                 sampler.sample(newPosition)
//                 particlesPositions.set([
//                     newPosition.x,
//                     newPosition.y,
//                     newPosition.z
//                 ], i * 3)

//                 particlesRandomness.set([
//                     Math.random() * 2 - 1, // -1 to 1
//                     Math.random() * 2 - 1,
//                     Math.random() * 2 - 1,
//                 ], i * 3)
//             }

//             this.particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlesPositions, 3))
//             this.particlesGeometry.setAttribute("aRandom", new THREE.BufferAttribute(particlesRandomness, 3))

//             //particles
//             this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial)

    
//     model.position.set(0, 0, 0);

//     scene.add(model);
//   },
//   (progress) => console.log('Loading:', (progress.loaded / progress.total * 100) + '%'),
//   (err) => console.error('Error loading model:', err)
// );

// // Tiny bit of ambient so it still looks lit when you rotate
// scene.add(new THREE.AmbientLight(0xffffff, 0.2));

// // Animation loop
// function animate() {
//   requestAnimationFrame(animate);
//   controls.update();
//   renderer.render(scene, camera);
// }
// animate();

// // Resize handler (critical for Vite)
// window.addEventListener('resize', () => {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize(window.innerWidth, window.innerHeight);
// });