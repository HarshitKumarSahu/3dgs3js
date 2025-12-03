// import * as SPLAT from "gsplat";

// const canvas = document.getElementById("gsplat-canvas");
// const progressDialog = document.getElementById("progress-dialog");
// const progressIndicator = document.getElementById("progress-indicator");

// const renderer = new SPLAT.WebGLRenderer(canvas);
// const scene = new SPLAT.Scene();
// const camera = new SPLAT.Camera();
// const controls = new SPLAT.OrbitControls(camera, canvas);
// // const controls = new SPLAT.FPSControls(camera, canvas);

// async function main() {
//     // const url = "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/bonsai-7k-mini.splat";
//     // const url = "https://huggingface.co/datasets/poltu14/3dgs/resolve/main/kotwani.ksplat";
//     const url = "https://huggingface.co/datasets/poltu14/3dgs/resolve/main/kotawani.splat"
    
//     await SPLAT.Loader.LoadAsync(url, scene, (progress) => (progressIndicator.value = progress * 100));
//     progressDialog.close();

//     const handleResize = () => {
//         renderer.setSize(canvas.clientWidth, canvas.clientHeight);
//     };

//     const frame = () => {
//         controls.update();
//         renderer.render(scene, camera);

//         requestAnimationFrame(frame);
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);

//     requestAnimationFrame(frame);
// }

// main();




import * as SPLAT from "gsplat";

const canvas = document.getElementById("gsplat-canvas");
const progressDialog = document.getElementById("progress-dialog");
const progressIndicator = document.getElementById("progress-indicator");

const renderer = new SPLAT.WebGLRenderer(canvas);
let scene = new SPLAT.Scene(); // Make scene mutable so we can replace it
const camera = new SPLAT.Camera();
const controls = new SPLAT.OrbitControls(camera, canvas);
// const controls = new SPLAT.FPSControls(camera, canvas);

async function loadSplat(url, isInitial = false) {
    if (!isInitial) {
        progressDialog.showModal(); // Show the dialog again for subsequent loads
    }
    progressIndicator.value = 0;
    
    // Create a new scene for the new splat to avoid overlapping
    scene = new SPLAT.Scene();
    
    await SPLAT.Loader.LoadAsync(url, scene, (progress) => {
        progressIndicator.value = progress * 100;
    });
    
    progressDialog.close();
}

function highlightSelectedOption(selectedLi) {
    document.querySelectorAll('#splat-options li').forEach(li => {
        li.classList.remove('active');
    });
    selectedLi.classList.add('active');
}

async function main() {
    // Default URLs (replace the placeholders with your actual splat URLs)
    const defaultUrl = "https://huggingface.co/datasets/poltu14/3dgs/resolve/main/kotawani.splat";
    
    // Load the first splat by default
    await loadSplat(defaultUrl, true);
    
    // Highlight the first option as active by default
    const firstOption = document.querySelector('#splat-options li');
    if (firstOption) {
        highlightSelectedOption(firstOption);
    }

    // Add click listeners to the options
    document.querySelectorAll('#splat-options li').forEach(li => {
        li.addEventListener('click', async () => {
            const url = li.dataset.url;
            highlightSelectedOption(li);
            await loadSplat(url);
        });
    });

    const handleResize = () => {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };

    const frame = () => {
        controls.update();
        renderer.render(scene, camera); // Always render the current scene

        requestAnimationFrame(frame);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    requestAnimationFrame(frame);
}

main();