import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "three";
          if (id.includes("@react-three/fiber") || id.includes("@react-three/drei")) return "r3f";
          if (id.includes("@react-three/rapier") || id.includes("ecctrl")) return "physics";
          if (id.includes("postprocessing") || id.includes("@react-three/postprocessing")) {
            return "postfx";
          }
          if (id.includes("@supabase")) return "supabase";
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
});
