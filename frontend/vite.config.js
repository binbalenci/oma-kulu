import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  define: {
    "process.env.VITE_API_URL": JSON.stringify(
      process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8080"
    ),
  },
});
