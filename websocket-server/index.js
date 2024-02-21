// react-circle-link-browsers/websocket-server/index.js
const WebSocket = require("ws");
const {
	createCircle,
	updateCircles,
	sendCirclePositions,
} = require("./circleMotion");

const wss = new WebSocket.Server({ port: 8080 });
const clientWindowInfo = new Map();

// クライアントの状態がオープンかどうかを確認する関数
const isOpen = (ws) => ws.readyState === WebSocket.OPEN;

function updateCirclePosition() {
	updateCircles(); // 円の位置を更新
	sendCirclePositions(wss, clientWindowInfo, isOpen); // 円の位置をクライアントに送信
}

setInterval(createCircle, 3000); // 2秒ごとに新しい円を生成
setInterval(updateCirclePosition, 3); // 3ミリ秒ごとに円の位置を更新

wss.on("connection", (ws) => {
	ws.on("message", (message) => {
		const msg = JSON.parse(message);
		if (msg.type === "windowInfo") {
			// ウィンドウ情報を保存
			clientWindowInfo.set(ws, msg.data);
		}
	});

	ws.on("close", () => {
		// クライアントが切断された場合、その情報を削除
		clientWindowInfo.delete(ws);
	});
});
