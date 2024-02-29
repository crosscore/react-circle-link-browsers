// src/App.tsx
import React, { useEffect, useState, useRef } from "react";

interface Circle {
  x: number;
  y: number;
}

const WEBSOCKET_URL = "ws://localhost:8080";
const MOVEMENT_CHECK_INTERVAL = 10;


const App: React.FC = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const [circleSize, setCircleSize] = useState<number>(120);

  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket(WEBSOCKET_URL);

      if (ws.current) {
        ws.current.onopen = () => {
          console.log("Connected to the server");
          sendWindowInfo();
          window.addEventListener("resize", sendWindowInfo);
        };
        ws.current.onerror = (error) => {
          console.error("WebSocket Error:", error);
        };
        ws.current.onclose = () => {
          console.log("WebSocket Connection Closed");
        };
        ws.current.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === "updateSize") {
            setCircleSize(message.size);
          } else {
            const newCircles = message;
            setCircles(newCircles);
          }
        };
      }
    };

    let lastX = window.screenX;
    let lastY = window.screenY;
    const checkWindowMovement = () => {
      if (window.screenX !== lastX || window.screenY !== lastY) {
        sendWindowInfo();
        lastX = window.screenX;
        lastY = window.screenY;
      }
    };

    const movementCheckInterval = setInterval(
      checkWindowMovement,
      MOVEMENT_CHECK_INTERVAL
    );
    setTimeout(connectWebSocket, 1);

    const sendWindowInfo = () => {
      const windowInfo = {
        screenX: window.screenX,
        screenY: window.screenY,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      };
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({ type: "windowInfo", data: windowInfo })
        );
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      window.removeEventListener("resize", sendWindowInfo);
      clearInterval(movementCheckInterval);
    };
  }, []);

  const switchPattern = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ type: "switchPattern" }));
    }
  };

  const doubleCircleSize = () => {
    setCircleSize(circleSize * 2);
  };

  const halfCircleSize = () => {
    setCircleSize(circleSize * 0.5);
  };

  const syncSize = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "syncSize", size: circleSize }));
    }
  }
  
  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "20px",
          display: "flex",
          gap: "10px",
        }}
      >
        <button onClick={switchPattern}>switch pattern</button>
        <button onClick={doubleCircleSize}>circle size 2x</button>
        <button onClick={halfCircleSize}>circle size 0.5x</button>
        <button onClick={syncSize}>sync size</button>
      </div>
      <svg width="100vw" height="100vh">
        {circles.map((circle, index) => (
          <circle
            key={index}
            cx={circle.x}
            cy={circle.y}
            r={circleSize.toString()}
            fill="#47b0dc"
          />
        ))}
      </svg>
    </div>
  );
};

export default App;
