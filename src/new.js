import * as SPLAT from "gsplat";

const canvas            = document.getElementById("gsplat-canvas");
const video             = document.querySelector(".videos video");
const progressContainer = document.getElementById("progress-container");
const progressIndicator = document.getElementById("progress-indicator");

// Gather the menu items and reorder them according to the desired order:
// 1,2,3,4,5,6 by matching their textContent with the map order
const splatVideoMap =  [
    { 
        name: "Splat 1: Kotwani",      
        splat: "https://huggingface.co/datasets/poltu14/3dgs/resolve/main/kotawani.splat",
        video: "https://huggingface.co/datasets/poltu14/3dgs/resolve/main/kotawani.mp4" 
    },                    
    { 
        name: "Splat 2: nitesh sir",   
        splat: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/neemasir.splat",
        video: "https://huggingface.co/datasets/poltu14/3dgs/resolve/main/neema.mp4" 
    },
    { 
        name: "Splat 3: shubhi maam",  
        splat: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/shubhimaam.splat",
        video: "https://huggingface.co/datasets/poltu14/3dgs/resolve/main/shubhi.mp4" 
    },
    { 
        name: "Splat 4: kamesh sir",   
        splat: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/kameshsir.splat",
        video: "https://huggingface.co/datasets/poltu14/3dgs/resolve/main/kamesh.mp4" 
    }, 
    { 
        name: "Splat 5: statue",       
        splat: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/statue.splat",
        video: "https://huggingface.co/datasets/poltu14/3dgs/resolve/main/stachu.mp4" 
    },
    { 
        name: "Splat 6: LCIT Campus",  
        splat: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/lcit.splat",
        video: "https://huggingface.co/datasets/poltu14/3dgs/resolve/main/lcit.mp4?download=true" 
    }
];

// Reorder menuItems NodeList into an array in the same order as splatVideoMap
const menuItemsAll = Array.from(document.querySelectorAll("#splat-options li"));
const menuItems = splatVideoMap.map(item => 
    menuItemsAll.find(li => li.textContent.trim() === item.name)
);

const renderer = new SPLAT.WebGLRenderer(canvas);
const camera   = new SPLAT.Camera();
const controls = new SPLAT.OrbitControls(camera, canvas);

const scenes = {};           // name → SPLAT.Scene
let currentScene = null;

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
        if (video.readyState < 3) {
          completed += 1;
          update();
          resolve();
        }
      }, 10000);
    });
  }

  progressContainer.style.display = "none";
}

// 3. Switch scene + video
function switchTo(name) {
  // If scenes not loaded, don't try
  if (!scenes[name]) {
    return;
  }
  currentScene = scenes[name];

  // Find item for video
  const item = splatVideoMap.find(i => i.name === name);
  if (!item) return;

  // Change video
  if (video.src !== item.video && video.src !== (location.origin + item.video)) {
    video.src = item.video;
    video.play();
  } else {
    video.play();
  }
  video.playbackRate = 2;

  // Highlight active menu item
  menuItems.forEach(li => {
    if (li) li.classList.toggle("active", li.textContent.trim() === name);
  });

  controls.update();
}

// 4. Menu click handlers (ordered as splatVideoMap)
menuItems.forEach((li, idx) => {
  if (!li) return;
  li.addEventListener("click", () => {
    const name = li.textContent.trim();
    switchTo(name);
  });
});

// Auto-select first one after everything is loaded
function selectFirst() {
  if (splatVideoMap.length > 0) {
    const firstLi = menuItems[0];
    if (firstLi) {
      const firstName = firstLi.textContent.trim();
      firstLi.classList.add("active");
      switchTo(firstName);
    }
  }
}

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

// 6. Start
(async () => {
  await loadEverything();
  handleResize();
  selectFirst();
  requestAnimationFrame(frame);
})();