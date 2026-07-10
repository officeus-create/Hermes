import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://hermeslogisticus.com",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
