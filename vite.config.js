// // vite.config.js
// import { defineConfig } from 'vite';
// import glsl from 'vite-plugin-glsl';

// export default defineConfig({
//   plugins: [glsl()]
// });

export default {
    build: {
        rollupOptions: {
            input: {
                main: './index.html',
                explore: './explore.html',
                gsplat: './gsplat.html',
            }
        }
    }
};
