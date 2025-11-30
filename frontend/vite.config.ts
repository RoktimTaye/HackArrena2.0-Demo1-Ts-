import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "@mui/material", "@mui/icons-material", "jwt-decode", "i18next", "react-i18next"]
  }
});
