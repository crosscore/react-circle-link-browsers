// react-circle-link-browsers/websocket-server/player.js
class Player {
	constructor(initialX, initialY) {
		this.position = { x: initialX, y: initialY }; // Updated initial position
		this.velocity = { x: 0, y: 0 };
	}

	move(direction) {
		const speed = 5;
		switch (direction) {
			case "w": // up
				this.velocity.y = -speed;
				break;
			case "a": // left
				this.velocity.x = -speed;
				break;
			case "s": // down
				this.velocity.y = speed;
				break;
			case "d": // right
				this.velocity.x = speed;
				break;
			default: // stop
				this.velocity.x = 0;
				this.velocity.y = 0;
		}
	}

	update() {
		// update the position based on the velocity
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}

module.exports = Player;
