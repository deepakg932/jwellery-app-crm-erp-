import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@views": resolve(__dirname, "src/views"),
      "@routes": resolve(__dirname, "src/routes"),
    },
    extensions: [".js", ".jsx", ".json"],
  },

  server: {
    port: 5173,
  },

  preview: {
    host: "0.0.0.0",
    port: process.env.PORT || 4173,
    allowedHosts: [
      "jwellery-app-crm-erp-8.onrender.com",
    ],
  },
});