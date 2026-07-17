require("dotenv").config();

const serverPort = Number(process.env.PORT || 3001);
const baseUrl = new URL(
  process.env.BASE_URL || "http://localhost:3000"
);
const proxyPort = Number(baseUrl.port || 80);
const socketPort = Number(
  process.env.BROWSER_SYNC_SOCKET_PORT || proxyPort + 2
);

module.exports = {
  proxy: {
    target: `http://localhost:${serverPort}`,
    ws: true
  },
  port: proxyPort,
  socket: {
    port: socketPort
  },
  ui: false,
  open: false,
  notify: false,
  ghostMode: false,
  files: [
    "public/css/*.css",
    "public/js/ImprovedInitiative.*.js",
    "html/**/*.html"
  ],
  reloadDebounce: 300
};
