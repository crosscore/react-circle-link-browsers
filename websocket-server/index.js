// react-circle-link-browsers/websocket-server/index.js
const WebSocket = require('ws');
const { createCircle, updateCircles, circles } = require('./circleMotion');

const wss = new WebSocket.Server({ port: 8080 });
const clientWindowInfo = new Map();

setInterval(createCircle, 1000); // 1秒ごとに新しい円を生成

function updateCirclePosition() {
  updateCircles(); // 円の位置を更新

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
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

setInterval(updateCirclePosition, 50); // 50msごとに円の位置を更新

wss.on('connection', ws => {
  ws.on('message', message => {
    const msg = JSON.parse(message);
    if (msg.type === 'windowInfo') {
      // ウィンドウ情報を保存
      clientWindowInfo.set(ws, msg.data);
    }
  });

  ws.on('close', () => {
    // クライアントが切断された場合、その情報を削除
    clientWindowInfo.delete(ws);
  });
});
