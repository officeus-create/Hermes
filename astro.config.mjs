import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { evergreenLoadBoardDemo } from "./scripts/evergreen-load-board-demo.mjs";

export default defineConfig({
  site: "https://hermeslogisticsus.com",
  output: "static",
  vite: {
    plugins: [evergreenLoadBoardDemo(), tailwindcss()],
  },
});
