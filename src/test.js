// import * as SPLAT from "gsplat";

// const canvas            = document.getElementById("gsplat-canvas");
// const videoElement      = document.querySelector(".videos video");
// const progressContainer = document.getElementById("progress-container");
// const progressIndicator = document.getElementById("progress-indicator");
// const percentText       = document.getElementById("percent"); // May be null depending on HTML

// const renderer = new SPLAT.WebGLRenderer(canvas);
// const camera   = new SPLAT.Camera();
// const controls = new SPLAT.OrbitControls(camera, canvas);

// const scenes = {};          // splat scenes
// let currentScene = null;

// // ─────────────────────────────────────────────────────────────────────────────
// // 1. Define your items (splat + matching video) -- FIX: Correct the first splat URL
// const items = [
//     { 
//         name: "Splat 1: Kotwani",      
//         splat: "https://huggingface.co/datasets/poltu14/3dgs/resolve/main/kotawani.splat", // fixed: same base as others
//         video: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/kotwani.mp4" 
//     },                     
//     { 
//         name: "Splat 2: Nitesh Sir",   
//         splat: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/neemasir.splat",
//         video: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/neemasir.mp4" 
//     },
//     { 
//         name: "Splat 3: Shubhi Maam",  
//         splat: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/shubhimaam.splat",
//         video: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/shubhimaam.mp4" 
//     },
//     { 
//         name: "Splat 4: Kamesh Sir",   
//         splat: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/kameshsir.splat",
//         video: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/kameshsir.mp4" 
//     },
//     { 
//         name: "Splat 5: Statue",       
//         splat: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/statue.splat",
//         video: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/statue.mp4" 
//     },
//     { 
//         name: "Splat 6: LCIT Campus",  
//         splat: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/lcit.splat",
//         video: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/lcit.mp4" 
//     }
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // 2. Preload everything (splats + videos)
// async function loadEverything() {
//   progressContainer.style.display = "flex";

//   const totalTasks = items.length * 2;          // one splat + one video per item
//   let completed = 0;

//   // Robust: protect against percentText being null
//   const updateProgress = () => {
//     const percent = Math.round((completed / totalTasks) * 100);
//     progressIndicator.value = percent;
//     if (percentText) percentText.textContent = percent;
//   };

//   for (const item of items) {
//     // ----- load splat -----
//     const scene = new SPLAT.Scene();
//     await SPLAT.Loader.LoadAsync(item.splat, scene, (p) => {
//       completed = completed - (completed % 2) + p; // fine-grained progress for splat (0-1)
//       updateProgress();
//     });
//     scenes[item.name] = scene;
//     completed = Math.ceil(completed);  // fix: ensure completed is integer after fine-grain
//     completed += 1; // finish the splat task
//     updateProgress();

//     // ----- preload video -----
//     const videoPromise = new Promise((resolve) => {
//       const onCanPlayThrough = () => {
//         videoElement.removeEventListener('canplaythrough', onCanPlayThrough);
//         completed += 1;
//         updateProgress();
//         resolve();
//       };

//       videoElement.src = item.video;
//       videoElement.load();
//       videoElement.addEventListener('canplaythrough', onCanPlayThrough);

//       // even if it never fires, we still count it after a short timeout (FIX: clear event)
//       setTimeout(() => { 
//         videoElement.removeEventListener('canplaythrough', onCanPlayThrough);
//         if (completed % 2 === 1) { 
//           completed += 1; 
//           updateProgress(); 
//           resolve(); 
//         }
//       }, 8000);
//     });
//     item.videoPromise = videoPromise; // store for later instant switching
//     await videoPromise;
//   }

//   progressContainer.style.display = "none";
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // 3. Switch scene + video instantly
// function switchTo(itemName) {
//   const item = items.find(i => i.name === itemName);
//   if (!item) return;

//   currentScene = scenes[itemName];

//   // Switch video (already preloaded → instant)
//   if (!videoElement.src || (videoElement.src !== item.video && !videoElement.src.endsWith(item.video))) {
//     videoElement.src = item.video;
//     videoElement.play().catch(() => {
//       // Some browsers might require .play() on a user gesture
//     });
//   } else {
//     videoElement.play().catch(() => {});
//   }

//   // Optional camera reset
//   // camera.position.set(0, 0, 5);
//   // controls.target.set(0, 0, 0);
//   controls.update();

//   // Update menu highlight
//   const menu = document.getElementById('splat-options');
//   if (menu) {
//     menu.querySelectorAll('li').forEach(li => {
//       li.classList.toggle('active', li.textContent === itemName);
//     });
//   }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // 4. Build menu
// function setupMenu() {
//   const menu = document.getElementById('splat-options');
//   if (!menu) return; // fix: make sure menu is present
//   menu.innerHTML = '<ul>' + items.map(it => `<li>${it.name}</li>`).join('') + '</ul>';

//   menu.querySelectorAll('li').forEach((li, idx) => {
//     li.addEventListener('click', () => switchTo(items[idx].name));
//   });

//   // Auto-select first
//   if (items.length) switchTo(items[0].name);
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // 5. Render loop & resize
// const handleResize = () => {
//   renderer.setSize(canvas.clientWidth, canvas.clientHeight);
// };

// const frame = () => {
//   if (currentScene) {
//     controls.update();
//     renderer.render(currentScene, camera);
//   }
//   requestAnimationFrame(frame);
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // 6. Start everything
// (async () => {
//   // Force 2× speed globally (also works after src change)
//   videoElement.playbackRate = 2;
//   videoElement.muted = true;
//   videoElement.loop = true; 
//   videoElement.playsInline = true;

//   await loadEverything();
//   setupMenu();
//   handleResize();
//   window.addEventListener("resize", handleResize);
//   requestAnimationFrame(frame);
// })();








// src/test.js  (or any file you load with type="module")
import * as SPLAT from "gsplat";

const canvas            = document.getElementById("gsplat-canvas");
const video             = document.querySelector(".videos video");
const progressContainer = document.getElementById("progress-container");
const progressIndicator = document.getElementById("progress-indicator");
const menuItems         = document.querySelectorAll("#splat-options li");

const renderer = new SPLAT.WebGLRenderer(canvas);
const camera   = new SPLAT.Camera();
const controls = new SPLAT.OrbitControls(camera, canvas);

const scenes = {};           // name → SPLAT.Scene
let currentScene = null;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Define splat + video pairs (add/edit video paths as needed)
const splatVideoMap =  [
        { 
            name: "Splat 1: Kotwani",      
            splat: "https://huggingface.co/datasets/poltu14/3dgs/resolve/main/kotawani.splat", // fixed: same base as others
            video: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/kotwani.mp4" 
        },                     
        { 
            name: "Splat 2: Nitesh Sir",   
            splat: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/neemasir.splat",
            video: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/neemasir.mp4" 
        },
        { 
            name: "Splat 3: Shubhi Maam",  
            splat: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/shubhimaam.splat",
            video: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/shubhimaam.mp4" 
        },
        { 
            name: "Splat 4: Kamesh Sir",   
            splat: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/kameshsir.splat",
            video: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/kameshsir.mp4" 
        },
        { 
            name: "Splat 5: Statue",       
            splat: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/statue.splat",
            video: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/statue.mp4" 
        },
        { 
            name: "Splat 6: LCIT Campus",  
            splat: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/lcit.splat",
            video: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/lcit.mp4" 
        }
    ];

// ─────────────────────────────────────────────────────────────────────────────
// 2. Preload all splats + videos (shows one progress bar)
async function loadEverything() {
  progressContainer.style.display = "flex";

  const totalTasks = splatVideoMap.length * 2; // splat + video per item
  let completed = 0;

  const update = () => {
    progressIndicator.value = (completed / totalTasks) * 100;
  };

  for (const item of splatVideoMap) {
    // Load splat
    const scene = new SPLAT.Scene();
    await SPLAT.Loader.LoadAsync(item.splat, scene, (prog) => {
      // prog is 0–1 for this splat
      completed = Math.floor(completed) + prog;
      update();
    });
    scenes[item.name] = scene;
    completed += 1 - (completed % 1); // finish the splat part
    update();

    // Preload video
    await new Promise((resolve) => {
      video.src = item.video;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.playbackRate = 2;

      const onCanPlay = () => {
        video.pause();           // we only wanted to preload
        completed += 1;
        update();
        resolve();
      };
      video.addEventListener("canplaythrough", onCanPlay, { once: true });
      video.load();

      // Fallback in case canplaythrough never fires
      setTimeout(() => {
        if (!video.readyState >= 3) {
          completed += 1;
          update();
          resolve();
        }
      }, 10000);
    });
  }

  progressContainer.style.display = "none";
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Switch scene + video
function switchTo(name) {
  const item = splatVideoMap.find(i => i.name === name);
  if (!item) return;

  currentScene = scenes[name];

  // Change video instantly (already preloaded)
  if (video.src !== (location.origin + item.video)) {
    video.src = item.video;
    video.play();
  }
  video.playbackRate = 2;

  // Highlight active menu item
  menuItems.forEach(li => li.classList.toggle("active", li.textContent.trim() === name));

  controls.update();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Menu click handlers (using your existing <li> elements)
menuItems.forEach(li => {
  li.addEventListener("click", () => {
    const name = li.textContent.trim();
    switchTo(name);
  });
});

// Auto-select first one after everything is loaded
function selectFirst() {
  if (splatVideoMap.length > 0) {
    menuItems[0].classList.add("active");
    switchTo(splatVideoMap[0].name);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Resize & render loop
const handleResize = () => renderer.setSize(canvas.clientWidth, canvas.clientHeight);
window.addEventListener("resize", handleResize);

const frame = () => {
  if (currentScene) {
    controls.update();
    renderer.render(currentScene, camera);
  }
  requestAnimationFrame(frame);
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Start
(async () => {
  await loadEverything();
  handleResize();
  selectFirst();
  requestAnimationFrame(frame);
})();