import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

gsap.registerPlugin(ScrollTrigger);

// ——— THREE.JS SETUP (same as before) ———
const canvas = document.getElementById('camera');
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x0a0a0a);

const mainCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
mainCamera.position.set(4, 3, 6);
mainCamera.lookAt(0, 0.8, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);


scene.add(new THREE.GridHelper(10, 20, 0x444444, 0x222222));

const orbitCamera = new THREE.PerspectiveCamera(50, 1, 0.25, 0.75);
scene.add(orbitCamera);
const cameraHelper = new THREE.CameraHelper(orbitCamera);
scene.add(cameraHelper);

cameraHelper.material.color.setHex(0x00ffff);    // cyan
cameraHelper.material.color.setHex(0xff00ff); // magenta
cameraHelper.material.opacity = 1;
cameraHelper.material.transparent = true;
cameraHelper.material.depthTest = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// ——— ORBIT CONTROLS (manual mouse/touch) ———
const controls = new OrbitControls(mainCamera, canvas);
if (window.innerWidth > 768) {
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
  } else {
    controls.enabled = false;
  }
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;
// controls.rotateSpeed = 0.8;
// controls.minDistance = 3;
// controls.maxDistance = 10;
// controls.minPolarAngle = Math.PI / 4;
// controls.maxPolarAngle = Math.PI / 1.5;
// controls.target.set(0, 0.8, 0);
// controls.enabled = false;

// // THESE 3 LINES KILL ZOOM COMPLETELY
// controls.enableZoom = false;     // ← disables mouse wheel / pinch zoom
// controls.enablePan = true;       // ← keep panning if you want (or set false)
// controls.enableRotate = true; // ← we'll enable only in .first section

// Load hand model
let handModel;
let scale = 2

// LOAD MODEL
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('/draco/');
loader.setDRACOLoader(draco);

loader.load(
  '/hand.glb',
  gltf => {
    handModel = gltf.scene;
    // handModel.traverse(child => {
    //   if (child.isMesh) {
    //     child.material = new THREE.MeshNormalMaterial();
    //   }
    // });
    handModel.scale.set(scale, scale, scale);
    const box = new THREE.Box3().setFromObject(handModel);
    handModel.position.sub(box.getCenter(new THREE.Vector3()));
    scene.add(handModel);
  }
);

// ——— THE IMPORTANT PART: trigger on .work-page .first ———
const firstSection = document.querySelector('.work-page .first');

if (firstSection) {
  ScrollTrigger.create({                                // ← changed to .create()
    trigger: firstSection,
    start: "top top",
    end: "bottom top",
    scrub: 1,
    pin: '.work-page',
    anticipatePin: 1,
    // markers: true,

    // Enable/disable OrbitControls automatically
    onEnter: () => controls.enabled = true,
    onLeave: () => controls.enabled = false,
    onEnterBack: () => controls.enabled = true,
    onLeaveBack: () => controls.enabled = false,

    onUpdate: self => {
      const progress = self.progress;
      const angle = progress * Math.PI * 4; // 2 full 360° rotations — change as needed

      const radius = 4.5;
      orbitCamera.position.x = Math.sin(angle) * radius;
      orbitCamera.position.z = Math.cos(angle) * radius;
      orbitCamera.position.y = 1.6 + Math.sin(angle * 0.8) * 0.5;
      orbitCamera.lookAt(0, 0.8, 0);
      cameraHelper.update();
    }
  });
}

// ——— RENDER LOOP ———
function animate() {
  requestAnimationFrame(animate);
  controls.update();                    // ← needed for damping
  renderer.render(scene, mainCamera);
}
animate();

// Resize
window.addEventListener('resize', () => {
  mainCamera.aspect = window.innerWidth / window.innerHeight;
  mainCamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});