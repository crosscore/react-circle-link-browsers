// websocket-server/circleMotion.js

let circles = [];
const initialCirclePosition = { x: 0, y: 0 };
const circleVelocity = { x: 4, y: 2 };
const circleLifetime = 4000; // Circle lifetime in milliseconds
let currentPatternMultiplier = 1;
const patternMultipliers = [1, 2, 3, 6];

/**
 * Creates a new circle and adds it to the circles array.
 */
function createCircle() {
  const createTime = Date.now();
  circles.push({ position: { ...initialCirclePosition }, velocity: circleVelocity, createTime });
  //console.log(circles[circles.length - 1]);
}

/**
 * Updates the position of a given circle based on its velocity and a multiplier.
 * @param {Object} circle - The circle to update.
 * @param {number} multiplier - The multiplier to apply to the circle's velocity.
 */
function updateCirclePosition(circle, multiplier) {
  circle.position.x += circle.velocity.x * multiplier;
  circle.position.y += circle.velocity.y * multiplier;
}

/**
 * Updates the position of all circles.
 */
function updateCircles() {
  circles.forEach(circle => updateCirclePosition(circle, currentPatternMultiplier));
}

/**
 * Switches the current pattern multiplier to the next one in the sequence.
 */
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
      }
    }
  });
}

/**
 * Removes circles that have existed longer than their lifetime.
 */
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
