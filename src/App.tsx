// react-circle-link-browsers/src/App.tsx
import React, { useEffect, useState, useRef } from "react";

interface Circle {
	x: number;
	y: number;
}

const App: React.FC = () => {
	const [circles, setCircles] = useState<Circle[]>([]);
	const ws = useRef<WebSocket | null>(null);
	const [player, setPlayerPosition] = useState({ position: { x: 0, y: 0 } });

	useEffect(() => {
		ws.current = new WebSocket("ws://localhost:8080");

		const sendWindowInfo = () => {
			const windowInfo = {
				screenX: window.screenX,
				screenY: window.screenY,
				innerWidth: window.innerWidth,
				innerHeight: window.innerHeight,
			};
			if (ws.current) {
				ws.current.send(
					JSON.stringify({ type: "windowInfo", data: windowInfo })
				);
			}
		};

		if (ws.current) {
			ws.current.onopen = () => {
				sendWindowInfo();
				window.addEventListener("resize", sendWindowInfo);
			};

			ws.current.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data && data.circles && Array.isArray(data.circles)) {
					setCircles(data.circles);
				}
			};
		}

		ws.current.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.player) {
				setPlayerPosition(data.player);
			} else {
				setCircles(data.circles);
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			console.log("Key pressed", event.key);
			if (ws.current) {
				ws.current.send(
					JSON.stringify({ type: "movePlayer", direction: event.key })
				);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
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
				style={{
					position: "absolute",
					top: "10px",
					right: "30px",
				}}
			>
				switch pattern
			</button>
			<svg width="100vw" height="100vh">
				<circle
					cx={player.position.x}
					cy={player.position.y}
					r="10"
					fill="blue"
				/>
				{Array.isArray(circles) && circles.map((circle, index) => (
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
