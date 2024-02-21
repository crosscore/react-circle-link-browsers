// react-circle-link-browsers/websocket-server/index.js
const WebSocket = require("ws");
const {
  createCircle,
  updateCircles,
  sendCirclePositions,
} = require("./circleMotion");

const wss = new WebSocket.Server({ port: 8082 });
const clientWindowInfo = new Map();

const isOpen = (ws) => ws.readyState === WebSocket.OPEN;

function updateCirclePosition() {
  updateCircles();
  sendCirclePositions(wss, clientWindowInfo, isOpen);
}

setInterval(createCircle, 3000);
setInterval(updateCirclePosition, 3);

wss.on('connection', ws => {
  ws.on('message', message => {
    const msg = JSON.parse(message);
    if (msg.type === 'windowInfo') {
      clientWindowInfo.set(ws, msg.data);
    }
  });

  ws.on('close', () => {
    clientWindowInfo.delete(ws);
  });
});

