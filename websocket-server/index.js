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
const player = new Player();

if (process.env.NODE_ENV === "development") {
	console.log("websocket server running on port 8080");
}

function updateCirclePosition() {
	updateCircles();
	sendCirclePositions(wss, clientWindowInfo, isOpen);
}

function updatePlayerPosition() {
	player.update();
}

setInterval(updatePlayerPosition, 9);
setInterval(createCircle, 500);
setInterval(updateCirclePosition, 9);
setInterval(removeOldCircles, 1000);

wss.on("connection", (ws) => {
	ws.on("message", (message) => {
		const msg = JSON.parse(message);
		if (msg.type === "windowInfo") {
			clientWindowInfo.set(ws, msg.data);
		}
	});

	ws.on("message", (message) => {
		const msg = JSON.parse(message);
		if (msg.type === "switchPattern") {
			switchPattern();
		}
	});

	wss.on("connection", (ws) => {
		ws.on("message", (message) => {
			const msg = JSON.parse(message);
			if (msg.type === "windowInfo") {
				clientWindowInfo.set(ws, msg.data);
				const initialX = msg.data.screenX + msg.data.innerWidth / 2;
				const initialY = msg.data.screenY + msg.data.innerHeight / 2;
				player = new Player(initialX, initialY);
			}
		});

		ws.on("close", () => {
			clientWindowInfo.delete(ws);
		});
	});
});
