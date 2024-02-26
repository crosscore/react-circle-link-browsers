// websocket-server/index.js
const WebSocket = require("ws");
const {
  createCircle,
  updateCircles,
  sendCirclePositions,
  removeOldCircles,
  switchPattern,
} = require("./circleMotion");

const PORT = 8080;
const CREATE_CIRCLE_INTERVAL = 500; // Interval for creating circles in milliseconds
const UPDATE_CIRCLE_POSITION_INTERVAL = 9; // Interval for updating circle positions in milliseconds
const REMOVE_OLD_CIRCLES_INTERVAL = 1000; // Interval for removing old circles in milliseconds

const wss = new WebSocket.Server({ port: PORT });
const clientWindowInfo = new Map();

/**
 * Checks if a WebSocket connection is open.
 * @param {WebSocket} ws - The WebSocket to check.
 * @returns {boolean} True if the WebSocket is open, otherwise false.
 */
const isOpen = (ws) => ws.readyState === WebSocket.OPEN;

/**
 * Updates the positions of circles and sends the new positions to connected clients.
 */
function updateCirclePositions() {
  updateCircles();
  sendCirclePositions(wss, clientWindowInfo, isOpen);
}

setInterval(createCircle, CREATE_CIRCLE_INTERVAL);
setInterval(updateCirclePositions, UPDATE_CIRCLE_POSITION_INTERVAL);
setInterval(removeOldCircles, REMOVE_OLD_CIRCLES_INTERVAL);

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const msg = JSON.parse(message);
    if (msg.type === "windowInfo") {
      clientWindowInfo.set(ws, msg.data);
    } else if (msg.type === "switchPattern") {
      switchPattern();
    }
  });

  ws.on("close", () => {
    clientWindowInfo.delete(ws);
  });
});

