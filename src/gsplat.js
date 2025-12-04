import * as SPLAT from "gsplat";

const canvas = document.getElementById("gsplat-canvas");
const progressContainer = document.getElementById("progress-container");
const progressIndicator = document.getElementById("progress-indicator");

const renderer = new SPLAT.WebGLRenderer(canvas);
const camera = new SPLAT.Camera();
const controls = new SPLAT.OrbitControls(camera, canvas);

// We'll store all preloaded scenes here
const scenes = {};
let currentScene = null;

// List of your splats (add as many as you want)
const splatList = [
    { name: "Splat 1: Kotwani",     url: "https://huggingface.co/datasets/poltu14/3dgs/resolve/main/kotawani.splat" },
    { name: "Splat 2: Nitesh Sir",        url: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/neemasir.splat" },
    { name: "Splat 3: Shubhi Maam",    url: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/shubhimaam.splat" },
    { name: "Splat 4: Kamesh Sir",              url: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/kameshsir.splat" },
    { name: "Splat 5: Statue",  url: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/statue.splat" },
    { name: "Splat 6: LCIT Campus",              url: "https://huggingface.co/datasets/poltu14/3dgsplat/resolve/main/lcit.splat" }
];

async function loadAllSplats() {
    progressContainer.style.display = "flex"; // Show centered loader

    let loadedCount = 0;
    const total = splatList.length;

    for (const splat of splatList) {
        const scene = new SPLAT.Scene();
        await SPLAT.Loader.LoadAsync(splat.url, scene, (progress) => {
            // Overall progress: average of all files
            progressIndicator.value = ((loadedCount + progress) / total) * 100;
        });
        scenes[splat.name] = scene;
        loadedCount++;
        progressIndicator.value = (loadedCount / total) * 100;
    }

    progressContainer.style.display = "none"; // Hide forever
}

function switchToScene(sceneName) {
    currentScene = scenes[sceneName];
    // if (currentScene) {
    //     // Optional: reset camera when switching
    //     camera.position.set(0, 0, 5);
    //     camera.rotation.set(0, 0, 0);
    //     controls.target.set(0, 0, 0);
    //     controls.update();
    // }

    controls.update();
    // controls.autoRotate = true;

    // Update active menu item
    document.querySelectorAll('#splat-options li').forEach(li => {
        li.classList.toggle('active', li.textContent === sceneName);
    });
}

function setupMenu() {
    const menu = document.getElementById('splat-options');
    menu.innerHTML = '<ul>' + splatList.map(splat => 
        `<li>${splat.name}</li>`
    ).join('') + '</ul>';

    menu.querySelectorAll('li').forEach((li, index) => {
        li.addEventListener('click', () => {
            switchToScene(splatList[index].name);
        });
    });

    // Auto-select first one
    if (splatList.length > 0) {
        switchToScene(splatList[0].name);
    }
}

const handleResize = () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
};

const frame = () => {
    if (currentScene) {
        controls.update();
        renderer.render(currentScene, camera);
    }
    requestAnimationFrame(frame);
};

// Start everything
(async () => {
    await loadAllSplats();   // ← Loads everything ONCE
    setupMenu();             // ← Build menu + enable instant switching
    handleResize();
    window.addEventListener("resize", handleResize);
    requestAnimationFrame(frame);
})();