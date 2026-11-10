import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// proxy /api ไป Express (port 3000) ตอน dev
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:3000" } },
});
