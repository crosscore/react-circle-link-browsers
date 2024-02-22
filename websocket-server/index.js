// react-circle-link-browsers/websocket-server/index.js
const WebSocket = require("ws");
const {
	createCircle,
	updateCircles,
	sendCirclePositions,
	removeOldCircles,
	switchPattern,
} = require("./circleMotion");
const Player = require("./player");

const wss = new WebSocket.Server({ port: 8080 });
const clientWindowInfo = new Map();
const isOpen = (ws) => ws.readyState === WebSocket.OPEN;
let player = new Player(0, 0);

function updateCirclePosition() {
	updateCircles();
	sendCirclePositions(wss, clientWindowInfo, isOpen);
}

function sendPlayerPosition() {
  const playerPosition = { x: player.position.x, y: player.position.y };
  wss.clients.forEach((client) => {
    if (isOpen(client)) {
      client.send(
        JSON.stringify({
          type: "playerPosition",
          position: playerPosition,
        })
      );
    }
  });
}

function updatePlayerPosition() {
	if (player) {
		player.update();
		sendPlayerPosition();
	}
}

setInterval(updatePlayerPosition, 9);
setInterval(createCircle, 500);
setInterval(updateCirclePosition, 9);
setInterval(removeOldCircles, 1000);

wss.on("connection", (ws) => {
	ws.on("message", (message) => {
		const msg = JSON.parse(message);

		switch (msg.type) {
			case "windowInfo":
				clientWindowInfo.set(ws, msg.data);
				const initialX = msg.data.screenX + msg.data.innerWidth / 2;
				const initialY = msg.data.screenY + msg.data.innerHeight / 2;
				player = new Player(initialX, initialY);
				break;

			case "switchPattern":
				switchPattern();
				break;

			case "movePlayer":
				if (player) {
					player.move(msg.direction);
				}
				break;
		}
	});

	ws.on("close", () => {
		clientWindowInfo.delete(ws);
	});
});
