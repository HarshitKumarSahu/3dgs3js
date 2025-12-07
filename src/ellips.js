// main.js (your Vite entry point)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
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
if (window.innerWidth > 768) {
  controls.enabled = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.8;
  controls.minDistance = 3;
  controls.maxDistance = 10;
  controls.minPolarAngle = Math.PI / 4;
  controls.maxPolarAngle = Math.PI / 1.5;
  controls.target.set(0, 0.8, 0);
} else {
  controls.enabled = false;
}
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


// LOAD MODEL
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('/draco/');
loader.setDRACOLoader(draco);

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
