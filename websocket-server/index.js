const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
let circlePosition = { x: 0, y: 0 }; // 円の初期位置

// クライアントのウィンドウ情報を保存するためのマップ
const clientWindowInfo = new Map();

// 円の位置を更新する関数
function updateCirclePosition() {
  // ここで円の位置を更新するロジックを実装
  circlePosition.x += 1; circlePosition.y += 0.5;

  // すべてのクライアントに新しい位置を送信
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      const windowInfo = clientWindowInfo.get(client);
      if (windowInfo) {
        // 円の位置をクライアントのウィンドウ情報に基づいて調整
        const adjustedPosition = {
          x: circlePosition.x - windowInfo.screenX,
          y: circlePosition.y - windowInfo.screenY
        };
        client.send(JSON.stringify(adjustedPosition));
      }
    }
  });
}

// 定期的に円の位置を更新
setInterval(updateCirclePosition, 50);

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
