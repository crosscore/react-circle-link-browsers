// my-react-app/src/App.tsx
import React, { useEffect, useState } from 'react';

interface Circle {
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [circle, setCircle] = useState<Circle>({ x: 50, y: 50 });
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const newWs = new WebSocket('ws://localhost:8080');
    setWs(newWs);

    newWs.onopen = () => {
      console.log('Connected to the server');
    };

    newWs.onmessage = (event) => {
      console.log('Message from server:', event.data);
      // ここでサーバーからの座標情報を受け取り、circleを更新する
    };

    return () => {
      newWs.close();
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const newCircle = { x: event.clientX, y: event.clientY };
    setCircle(newCircle);
    ws?.send(JSON.stringify(newCircle));
  };

  return (
    <div onMouseMove={handleMouseMove} style={{ height: '100vh', width: '100vw' }}>
      <svg width="100vw" height="100vh">
        <circle cx={circle.x} cy={circle.y} r="100" fill="blue" />
      </svg>
    </div>
  );
};

export default App;
