// react-circle-link-browsers/websocket-server/circleMotion.js

let circles = [];

function createCircle() {
  const initialPosition = { x: 0, y: 0 };
  const velocity = { x: 4, y: 2 };
  const createTime = Date.now();
  circles.push({ position: { ...initialPosition }, velocity, createTime });
  console.log(circles[circles.length - 1]);
}

function updateCircles() {
  circles.forEach(circle => {
    circle.position.x += circle.velocity.x;
    circle.position.y += circle.velocity.y;
  });
}

function sendCirclePositions(wss, clientWindowInfo, isOpen) {
  wss.clients.forEach(client => {
    if (isOpen(client)) {
      const windowInfo = clientWindowInfo.get(client);
      if (windowInfo) {
        const positions = circles.map(circle => {
          return {
            x: circle.position.x - windowInfo.screenX,
            y: circle.position.y - windowInfo.screenY
          };
        });
        client.send(JSON.stringify(positions)); // send the circle positions to the client
      }
    }
  });
}

function removeOldCircles() {
  const currentTime = Date.now();
  circles = circles.filter(circle => currentTime - circle.createTime <= 4000);
}

module.exports = { createCircle, updateCircles, sendCirclePositions, removeOldCircles, circles };

