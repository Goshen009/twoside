import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      manifest: {
        name: "Twoside",
        short_name: "Twoside",
        description: "Personal finance & loan tracker",
        theme_color: "#050506",
        background_color: "#050506",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  server: {
    host: true,
    // https: {
    // 	cert: "/home/goshen/tailscale_certs/kettle.ratfish-cosmological.ts.net.crt",
    //  	key: "/home/goshen/tailscale_certs/kettle.ratfish-cosmological.ts.net.key"
    // },
    allowedHosts: ['100.103.127.67', '100.99.208.67'],
    // proxy: {
    // 	'/api': {
    //  		target: 'http://localhost:8080',
    //    	changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, '')
    //  	}
    // }
  },
  preview: {
    port: 5173,
  },
});