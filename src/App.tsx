// react-circle-link-browsers/src/App.tsx
import React, { useEffect, useState, useRef } from "react";

interface Circle {
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket("ws://localhost:8080");

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
          const newCircles = JSON.parse(event.data);
          setCircles(newCircles);
        };
      }
    };

    setTimeout(connectWebSocket, 1000);

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
    };
  }, []);

  const switchPattern = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ type: "switchPattern" }));
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <button
        onClick={switchPattern}
        style={{ position: "absolute", top: "10px", right: "20px" }}
      >
        switch pattern
      </button>
      <svg width="100vw" height="100vh">
        {circles.map((circle, index) => (
          <circle
            key={index}
            cx={circle.x}
            cy={circle.y}
            r="120"
            fill="#910A67"
          />
        ))}
      </svg>
    </div>
  );
};

export default App;
