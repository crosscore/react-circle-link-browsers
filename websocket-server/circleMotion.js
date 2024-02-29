// websocket-server/circleMotion.js

let circles = [];
const circleVelocity = { x: 4, y: 2 };
const circleLifetime = 4000;
let currentPatternMultiplier = 1;
const patternMultipliers = [1, 2, 3, 6];

function createCircle(windowInfo) {
  const initialCirclePosition = { x: 0, y: windowInfo.innerHeight / 2 };
  const createTime = Date.now();
  circles.push({
    position: { ...initialCirclePosition },
    velocity: circleVelocity,
    createTime,
  });
  //console.log(circles[circles.length - 1]);
}

function updateCirclePosition(circle, multiplier) {
  circle.position.x += circle.velocity.x * multiplier;
  //circle.position.y += circle.velocity.y * multiplier;
}

function updateCircles() {
  circles.forEach(circle => updateCirclePosition(circle, currentPatternMultiplier));
}

function switchPattern() {
  const currentIndex = patternMultipliers.indexOf(currentPatternMultiplier);
  const nextIndex = (currentIndex + 1) % patternMultipliers.length;
  currentPatternMultiplier = patternMultipliers[nextIndex];
}

/**
 * Sends the positions of all circles to each connected client, adjusted based on the client's window position.
 * @param {WebSocket.Server} wss - The WebSocket server instance.
 * @param {Map} clientWindowInfo - A map of client window information.
 * @param {Function} isOpen - A function to check if a client's connection is open.
 */
function sendCirclePositions(wss, clientWindowInfo, isOpen) {
  wss.clients.forEach(client => {
    if (isOpen(client)) {
      const windowInfo = clientWindowInfo.get(client);
      if (windowInfo) {
        const positions = circles.map(circle => ({
          x: circle.position.x - windowInfo.screenX,
          y: circle.position.y - windowInfo.screenY,
        }));
        client.send(JSON.stringify(positions));
        //console.log(`Sending circle positions: ${JSON.stringify(positions, null, 0)}`);
      }
    }
  });
}

function removeOldCircles() {
  const currentTime = Date.now();
  circles = circles.filter(circle => currentTime - circle.createTime <= circleLifetime);
}

module.exports = {
  createCircle,
  updateCircles,
  sendCirclePositions,
  removeOldCircles,
  switchPattern,
  circles,
};
