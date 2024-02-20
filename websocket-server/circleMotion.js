// react-circle-link-browsers/websocket-server/circleMotion.js

let circles = []; // 円の配列
const gravity = 0.1; // 重力加速度

function createCircle() {
  const initialPosition = { x: 0, y: 0 };
  const initialVelocity = { x: Math.random() * 5, y: -10 - Math.random() * 5 };
  const createTime = Date.now();

  circles.push({ position: {...initialPosition}, velocity: {...initialVelocity}, createTime });
}

function updateCircles() {
	circles.forEach((circle) => {
		// 右側への移動速度を設定（例: 毎回2ピクセル移動）
		const horizontalSpeed = 6;
		// 下への移動速度を設定（例: 毎回1ピクセル移動）
		const verticalSpeed = 3;

		// 速度に基づいて位置を更新
		circle.position.x += horizontalSpeed;
		circle.position.y += verticalSpeed;

		// 7秒以上経過した円を削除
		const currentTime = Date.now();
		if (currentTime - circle.createTime > 9000) {
			circles.splice(circles.indexOf(circle), 1);
		}
	});
}


module.exports = { createCircle, updateCircles, circles };
