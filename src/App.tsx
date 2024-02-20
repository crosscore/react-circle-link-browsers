// my-react-app/src/App.tsx
import React, { useEffect, useState } from 'react';

interface Circle {
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [circle, setCircle] = useState<Circle>({ x: 50, y: 50 });

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    const sendWindowInfo = () => {
      const windowInfo = {
        screenX: window.screenX,
        screenY: window.screenY,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      };
      ws.send(JSON.stringify({ type: 'windowInfo', data: windowInfo }));
    };

    ws.onopen = () => {
      console.log('Connected to the server');
      sendWindowInfo();
      // ウィンドウサイズ変更時にも情報を送信
      window.addEventListener('resize', sendWindowInfo);
    };

    ws.onmessage = (event) => {
      const newPosition = JSON.parse(event.data);
      setCircle(newPosition);
    };

    return () => {
      ws.close();
      window.removeEventListener('resize', sendWindowInfo);
    };
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <svg width="100vw" height="100vh">
        <circle cx={circle.x} cy={circle.y} r="100" fill="#910A67" />
      </svg>
    </div>
  );
};

export default App;
