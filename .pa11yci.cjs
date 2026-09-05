module.exports = {
  defaults: {
    standard: "WCAG2AA",
    runners: ["axe"],
    level: "error",
    threshold: 0,
    timeout: 30000,
    wait: 500,
    chromeLaunchConfig: {
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
  },
  urls: [
    "http://127.0.0.1:4321/",
    "http://127.0.0.1:4321/paths/logistics/",
    "http://127.0.0.1:4321/paths/marketing/",
    "http://127.0.0.1:4321/paths/technology/",
    "http://127.0.0.1:4321/paths/academy/",
    "http://127.0.0.1:4321/load-board/",
    "http://127.0.0.1:4321/carrier/",
    "http://127.0.0.1:4321/ru/",
  ],
};
