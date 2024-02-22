// react-circle-link-browsers/src/App.tsx
import React, { useEffect, useState } from "react";

interface Circle {
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [circles, setCircles] = useState<Circle[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    const sendWindowInfo = () => {
      const windowInfo = {
        screenX: window.screenX,
        screenY: window.screenY,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      };
      ws.send(JSON.stringify({ type: "windowInfo", data: windowInfo }));
    };

    ws.onopen = () => {
      console.log("Connected to the server");
      sendWindowInfo();
      window.addEventListener("resize", sendWindowInfo);
    };

    ws.onmessage = (event) => {
      const newCircles = JSON.parse(event.data);
      setCircles(newCircles);
    };

    return () => {
      ws.close();
      window.removeEventListener("resize", sendWindowInfo);
    };
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <svg width="100vw" height="100vh">
        {circles.map((circle, index) => (
          <circle
            key={index}
            cx={circle.x}
            cy={circle.y}
            r="150"
            fill="#910A67"
          />
        ))}
      </svg>
    </div>
  );
};

export default App;
