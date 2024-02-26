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
const CREATE_CIRCLE_INTERVAL = 500;
const UPDATE_CIRCLE_POSITION_INTERVAL = 9;
const REMOVE_OLD_CIRCLES_INTERVAL = 1000;

const wss = new WebSocket.Server({ port: PORT });
const clientWindowInfo = new Map();
const clientIDs = new Map();
let nextClientID = 0;

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
  const clientID = nextClientID++;
  clientIDs.set(ws, clientID);
  console.log(`Client ${clientID} connected`);

  ws.on("message", (message) => {
    const msg = JSON.parse(message);
    if (msg.type === "windowInfo") {
      clientWindowInfo.set(ws, msg.data);
    } else if (msg.type === "switchPattern") {
      switchPattern();
      console.log("Switching pattern");
    }
  });

  ws.on("close", () => {
    clientWindowInfo.delete(ws);
    console.log(`Client ${clientIDs.get(ws)} disconnected`);
    clientIDs.delete(ws);
  });
});
