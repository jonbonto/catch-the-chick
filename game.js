// Game canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = false;
let gamePaused = false;
let score = 0;
let missed = 0;
let level = 1;
let animationId = null;

// Game objects
const basket = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 60,
    width: 80,
    height: 40,
    speed: 7
};

const chicks = [];
const maxMissed = 5;

// Controls
const keys = {};

// DOM elements
const scoreEl = document.getElementById('score');
const missedEl = document.getElementById('missed');
const levelEl = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && gameRunning) {
        togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);

// Chick class
class Chick {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 2 + level * 0.5;
        this.caught = false;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        // Draw a cute chick emoji/shape
        ctx.font = '30px Arial';
        ctx.fillText('🐤', this.x, this.y + this.height);
    }

    isOffScreen() {
        return this.y > canvas.height;
    }

    checkCollision(basket) {
        return (
            this.x < basket.x + basket.width &&
            this.x + this.width > basket.x &&
            this.y + this.height > basket.y &&
            this.y < basket.y + basket.height
        );
    }
}

// Game functions
function startGame() {
    gameRunning = true;
    gamePaused = false;
    score = 0;
    missed = 0;
    level = 1;
    chicks.length = 0;
    basket.x = canvas.width / 2 - 40;

    updateUI();
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    gameOverEl.classList.add('hidden');

    gameLoop();
}

function togglePause() {
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
    if (!gamePaused) {
        gameLoop();
    }
}

function restartGame() {
    startGame();
}

function endGame() {
    gameRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    cancelAnimationFrame(animationId);

    finalScoreEl.textContent = score;
    gameOverEl.classList.remove('hidden');
}

function updateUI() {
    scoreEl.textContent = score;
    missedEl.textContent = missed;
    levelEl.textContent = level;
}

function updateBasket() {
    // Move basket left/right
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        basket.x -= basket.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        basket.x += basket.speed;
    }

    // Keep basket within canvas bounds
    basket.x = Math.max(0, Math.min(canvas.width - basket.width, basket.x));
}

function drawBasket() {
    // Draw basket
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);

    // Draw basket weave pattern
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (let i = 0; i < basket.width; i += 10) {
        ctx.beginPath();
        ctx.moveTo(basket.x + i, basket.y);
        ctx.lineTo(basket.x + i, basket.y + basket.height);
        ctx.stroke();
    }

    // Draw basket emoji on top
    ctx.font = '40px Arial';
    ctx.fillText('🧺', basket.x + basket.width / 2 - 20, basket.y + 35);
}

function spawnChick() {
    // Spawn rate increases with level
    const spawnChance = 0.02 + level * 0.005;
    if (Math.random() < spawnChance) {
        chicks.push(new Chick());
    }
}

function updateChicks() {
    for (let i = chicks.length - 1; i >= 0; i--) {
        const chick = chicks[i];
        chick.update();

        // Check collision with basket
        if (!chick.caught && chick.checkCollision(basket)) {
            chick.caught = true;
            score += 10;
            updateUI();
            chicks.splice(i, 1);

            // Level up every 50 points
            if (score % 50 === 0 && score > 0) {
                level++;
                updateUI();
            }
        }
        // Check if chick fell off screen
        else if (chick.isOffScreen()) {
            if (!chick.caught) {
                missed++;
                updateUI();

                if (missed >= maxMissed) {
                    endGame();
                    return;
                }
            }
            chicks.splice(i, 1);
        }
    }
}

function drawChicks() {
    chicks.forEach(chick => chick.draw());
}

function drawBackground() {
    // Sky gradient (already in CSS, but we can add clouds)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';

    // Draw some simple clouds
    const time = Date.now() * 0.0001;
    for (let i = 0; i < 3; i++) {
        const x = (time * 20 + i * 200) % (canvas.width + 100) - 50;
        const y = 50 + i * 40;

        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 20, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGround() {
    // Draw ground at bottom
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    // Draw grass texture
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, canvas.height - 40, 2, 10);
    }
}

function gameLoop() {
    if (!gameRunning || gamePaused) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawBackground();
    drawGround();
    updateBasket();
    drawBasket();
    spawnChick();
    updateChicks();
    drawChicks();

    // Continue game loop
    animationId = requestAnimationFrame(gameLoop);
}

// Initial draw
ctx.fillStyle = '#333';
ctx.font = '20px Arial';
ctx.textAlign = 'center';
ctx.fillText('Click "Start Game" to begin!', canvas.width / 2, canvas.height / 2);
ctx.fillText('Use ← → or A/D to move the basket', canvas.width / 2, canvas.height / 2 + 30);
ctx.font = '40px Arial';
ctx.fillText('🐤', canvas.width / 2 - 20, canvas.height / 2 - 30);
