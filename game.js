const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const GROUND_Y = canvas.height - 50;
const OBSTACLE_SPEED = 8;

class Player {
    constructor() {
        this.size = 30;
        this.x = 50;
        this.y = GROUND_Y - this.size;
        this.vy = 0;
        this.onGround = true;
        this.rotation = 0;
    }

    jump() {
        if (this.onGround) {
            this.vy = JUMP_FORCE;
            this.onGround = false;
        }
    }

    reset() {
        this.y = GROUND_Y - this.size;
        this.vy = 0;
        this.onGround = true;
        this.rotation = 0;
    }

    update() {
        this.vy += GRAVITY;
        this.y += this.vy;

        if (this.y > GROUND_Y - this.size) {
            this.y = GROUND_Y - this.size;
            this.vy = 0;
            this.onGround = true;
            // Snap rotation to nearest 90 degrees on landing
            this.rotation = Math.round(this.rotation / 90) * 90;
        }

        if (!this.onGround) {
            this.rotation += 5; // Rotate while jumping
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

class Obstacle {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = canvas.width;
        this.y = GROUND_Y - this.height;
    }

    update() {
        this.x -= OBSTACLE_SPEED;
    }

    draw() {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

const player = new Player();
let obstacles = [];
let frameCount = 0;

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        player.jump();
    }
});

canvas.addEventListener('mousedown', () => {
    player.jump();
});

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.size > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.size > rect2.y;
}

function resetGame() {
    player.reset();
    obstacles = [];
    frameCount = 0;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(canvas.width, GROUND_Y);
    ctx.stroke();

    player.update();
    player.draw();

    // Spawn obstacles
    frameCount++;
    if (frameCount % 100 === 0) {
        obstacles.push(new Obstacle());
    }

    // Update and draw obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].draw();

        // Collision detection
        if (checkCollision(player, obstacles[i])) {
            resetGame();
            break;
        }

        // Remove off-screen obstacles
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
