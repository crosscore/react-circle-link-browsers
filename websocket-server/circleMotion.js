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
  const currentTime = Date.now();

  circles.forEach(circle => {
    const timeDelta = (currentTime - circle.createTime) / 1000; // 秒単位の経過時間

    // 重力の影響を速度に加える
    circle.velocity.y += gravity * timeDelta;

    // 速度に基づいて位置を更新
    circle.position.x += circle.velocity.x;
    circle.position.y += circle.velocity.y;

    // 3秒以上経過した円を削除
    if (currentTime - circle.createTime > 3000) {
      circles.splice(circles.indexOf(circle), 1);
    }
  });
}

module.exports = { createCircle, updateCircles, circles };
