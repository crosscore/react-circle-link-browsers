// websocket-server/index.js
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
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

const isOpen = (ws) => ws.readyState === WebSocket.OPEN;
// console.log(`WebSocket.Open: ${WebSocket.OPEN}`);
// console.log(`WebSocket.CLOSED: ${WebSocket.CLOSED}`);
// console.log(`ws.readyState: ${wss.readyState}`);

function updateCirclePositions() {
  updateCircles();
  sendCirclePositions(wss, clientWindowInfo, isOpen);
}

setInterval(updateCirclePositions, UPDATE_CIRCLE_POSITION_INTERVAL);
setInterval(removeOldCircles, REMOVE_OLD_CIRCLES_INTERVAL);

setInterval(() => {
  wss.clients.forEach((client) => {
    if (isOpen(client)) {
      const windowInfo = clientWindowInfo.get(client);
      if (windowInfo) {
        //console.log(`windowInfo.innerHeight: ${windowInfo.innerHeight}`);
        createCircle(windowInfo);
      }
    }
  });
}, CREATE_CIRCLE_INTERVAL);


wss.on("connection", (ws) => {
  console.log(`is open: ${isOpen(ws)}`);
  const clientID = uuidv4();
  clientIDs.set(ws, clientID);
  console.log(`Client ${clientID} connected`);

  ws.on("message", (message) => {
    const msg = JSON.parse(message);
    if (msg.type === "windowInfo") {
      clientWindowInfo.set(ws, msg.data);
    } else if (msg.type === "switchPattern") {
      switchPattern();
      console.log("Switching pattern");
    } else if (msg.type === "syncSize") {
      console.log("Syncing size");
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "updateSize", size: msg.size }));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log(`is open: ${isOpen(ws)}`);
    clientWindowInfo.delete(ws);
    console.log(`Client ${clientIDs.get(ws)} disconnected`);
    clientIDs.delete(ws);
  });
});
