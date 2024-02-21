// react-circle-link-browsers/websocket-server/circleMotion.js

let circles = []; // 円の配列

function createCircle() {
	const initialPosition = { x: 0, y: 0 };
	const initialVelocity = {
		x: Math.random() * 5,
		y: -10 - Math.random() * 5,
	};
	const createTime = Date.now();

	circles.push({
		position: { ...initialPosition },
		velocity: { ...initialVelocity },
		createTime,
	});
}

function updateCircles() {
	circles.forEach((circle) => {
		// 右側への移動速度を設定（例: 毎回2ピクセル移動）
		const horizontalSpeed = 4;
		// 下への移動速度を設定（例: 毎回1ピクセル移動）
		const verticalSpeed = 2;

		// 速度に基づいて位置を更新
		circle.position.x += horizontalSpeed;
		circle.position.y += verticalSpeed;

		// 6秒以上経過した円を削除
		const currentTime = Date.now();
		if (currentTime - circle.createTime > 6000) {
			circles.splice(circles.indexOf(circle), 1);
		}
	});
}

function sendCirclePositions(wss, clientWindowInfo, isOpen) {
	wss.clients.forEach((client) => {
		if (isOpen(client)) {
			// WebSocket.OPEN の代わりに isOpen 関数を使用
			const windowInfo = clientWindowInfo.get(client);
			if (windowInfo) {
				circles.forEach((circle) => {
					const adjustedPosition = {
						x: circle.position.x - windowInfo.screenX,
						y: circle.position.y - windowInfo.screenY,
					};
					client.send(JSON.stringify(adjustedPosition));
				});
			}
		}
	});
}


module.exports = { createCircle, updateCircles, sendCirclePositions, circles };
