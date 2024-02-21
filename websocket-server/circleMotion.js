// react-circle-link-browsers/websocket-server/circleMotion.js

let circles = [];

function createCircle() {
  const initialPosition = { x: 0, y: 0 };
  const initialVelocity = { x: 0, y: 0 };
  const createTime = Date.now();

	circles.push({ position: { ...initialPosition }, velocity: { ...initialVelocity }, createTime });
	console.log(circles[circles.length - 1]);
}

function updateCircles() {
  circles.forEach(circle => {
    const horizontalSpeed = 2;
    const verticalSpeed = 1;

    circle.position.x += horizontalSpeed;
    circle.position.y += verticalSpeed;

    const currentTime = Date.now();
    if (currentTime - circle.createTime > 6000) {
      circles.splice(circles.indexOf(circle), 1);
    }
  });
}

function sendCirclePositions(wss, clientWindowInfo, isOpen) {
  wss.clients.forEach(client => {
    if (isOpen(client)) {
      const windowInfo = clientWindowInfo.get(client);
      if (windowInfo) {
        circles.forEach(circle => {
          const adjustedPosition = {
            x: circle.position.x - windowInfo.screenX,
            y: circle.position.y - windowInfo.screenY
          };
          client.send(JSON.stringify(adjustedPosition));
        });
      }
    }
  });
}

module.exports = { createCircle, updateCircles, sendCirclePositions, circles };

