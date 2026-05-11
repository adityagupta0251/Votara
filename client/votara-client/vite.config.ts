import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],

    define: {
        global: "globalThis",
    },

    resolve: {
        alias: {
            buffer: "buffer",
            process: "process/browser",
        },
    },

    optimizeDeps: {
        include: [
            "buffer",
            "process",
        ],
    },
});