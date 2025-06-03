const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const titleScreen = document.getElementById('titleScreen');
const playButton = document.getElementById('playButton');
const spaceshipImg = document.getElementById('spaceshipImg'); // Use the DOM image
const brickImg = document.getElementById('brickImg');

let spaceship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 64,
    height: 64
};

let gameStarted = false;
let obstacles = [];
let obstacleSpeed = 3;
let obstacleInterval = 1200; // ms
let lastObstacleTime = 0;
let gapHeight = 150;
let minGapY = 80;
let maxGapY = canvas.height - gapHeight - 80;
let score = 0;
let gameOver = false;

let obstacleWidth = 150;
let obstacleHeight = 40;
let gapWidth = 180;

// Reset game state
function resetGame() {
    obstacles = [];
    score = 0;
    gameOver = false;
    spaceship.x = canvas.width / 2 - spaceship.width / 2;
    spaceship.y = canvas.height / 2 - spaceship.height / 2;
}

// Spawn a new pair of obstacles (two bricks with a gap between)
function spawnObstacle() {
    // Randomly choose gap position
    const gapX = Math.random() * (canvas.width - gapWidth);
    obstacles.push({
        y: -obstacleHeight,
        height: obstacleHeight,
        left: {
            x: 0,
            width: gapX
        },
        right: {
            x: gapX + gapWidth,
            width: canvas.width - (gapX + gapWidth)
        },
        passed: false
    });
}

// Update obstacles movement, scoring, and collision
function updateObstacles(delta) {
    for (let obs of obstacles) {
        obs.y += obstacleSpeed;
    }
    // Remove obstacles that have moved off screen
    obstacles = obstacles.filter(obs => obs.y < canvas.height);

    // Scoring and collision
    for (let obs of obstacles) {
        // Score: when spaceship passes the gap and hasn't scored for this obstacle yet
        if (!obs.passed && obs.y + obs.height > spaceship.y + spaceship.height) {
            obs.passed = true;
            score++;
        }
        // Collision with left brick
        if (
            spaceship.x < obs.left.x + obs.left.width &&
            spaceship.x + spaceship.width > obs.left.x &&
            spaceship.y < obs.y + obs.height &&
            spaceship.y + spaceship.height > obs.y
        ) {
            gameOver = true;
        }
        // Collision with right brick
        if (
            spaceship.x < obs.right.x + obs.right.width &&
            spaceship.x + spaceship.width > obs.right.x &&
            spaceship.y < obs.y + obs.height &&
            spaceship.y + spaceship.height > obs.y
        ) {
            gameOver = true;
        }
    }
}

// Draw obstacles using the brick image
function drawObstacles() {
    for (let obs of obstacles) {
        // Draw left brick if width > 0
        if (obs.left.width > 0) {
            ctx.drawImage(
                brickImg,
                obs.left.x,
                obs.y,
                obs.left.width,
                obs.height
            );
        }
        // Draw right brick if width > 0
        if (obs.right.width > 0) {
            ctx.drawImage(
                brickImg,
                obs.right.x,
                obs.y,
                obs.right.width,
                obs.height
            );
        }
    }
}

function drawScore() {
    ctx.fillStyle = "#fff";
    ctx.font = "28px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 20, 40);
}

function showGameOverScreen() {
    document.getElementById('finalScore').textContent = "Score: " + score;
    gameOverScreen.style.display = 'flex';
}

function hideGameOverScreen() {
    gameOverScreen.style.display = 'none';
}

canvas.addEventListener('mousemove', function(e) {
    if (!gameStarted) return;
    const rect = canvas.getBoundingClientRect();
    spaceship.x = e.clientX - rect.left - spaceship.width / 2;
    spaceship.y = e.clientY - rect.top - spaceship.height / 2;
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameStarted) {
        ctx.drawImage(
            spaceshipImg,
            spaceship.x,
            spaceship.y,
            spaceship.width,
            spaceship.height
        );
    }
    requestAnimationFrame(draw);
}

// Wait for both spaceship and brick images to load before starting the game loop
function startGameLoopWhenReady() {
    if (spaceshipImg.complete && brickImg.complete) {
        requestAnimationFrame(gameLoop);
    } else {
        if (!spaceshipImg.complete) {
            spaceshipImg.onload = startGameLoopWhenReady;
        }
        if (!brickImg.complete) {
            brickImg.onload = startGameLoopWhenReady;
        }
    }
}
startGameLoopWhenReady();

playButton.addEventListener('click', function() {
    titleScreen.style.display = 'none';
    hideGameOverScreen();
    resetGame();
    gameStarted = true;
    lastObstacleTime = 0;
    lastTime = 0;
});

// Restart on click after game over (now handled by restart button)
canvas.addEventListener('mousedown', function() {
    // No-op, handled by restart button now
});

// Add references for game over buttons
let gameOverScreen, mainMenuButton, restartButton;

// Create game over screen elements dynamically
function createGameOverScreen() {
    gameOverScreen = document.createElement('div');
    gameOverScreen.id = 'gameOverScreen';
    gameOverScreen.className = 'overlay';
    gameOverScreen.style.display = 'none';

    const title = document.createElement('h1');
    title.textContent = 'Game Over';

    const scoreText = document.createElement('div');
    scoreText.id = 'finalScore';
    scoreText.style.color = '#fff';
    scoreText.style.fontSize = '2rem';
    scoreText.style.margin = '1rem';

    mainMenuButton = document.createElement('button');
    mainMenuButton.id = 'mainMenuButton';
    mainMenuButton.textContent = 'Main Menu';

    restartButton = document.createElement('button');
    restartButton.id = 'restartButton';
    restartButton.textContent = 'Restart';
    restartButton.style.marginLeft = '1rem';

    const btnContainer = document.createElement('div');
    btnContainer.appendChild(mainMenuButton);
    btnContainer.appendChild(restartButton);

    gameOverScreen.appendChild(title);
    gameOverScreen.appendChild(scoreText);
    gameOverScreen.appendChild(btnContainer);

    document.body.appendChild(gameOverScreen);
}
createGameOverScreen();

let lastTime = 0;
function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && !gameOver) {
        // Obstacles
        if (timestamp - lastObstacleTime > obstacleInterval) {
            spawnObstacle();
            lastObstacleTime = timestamp;
        }
        updateObstacles(timestamp - lastTime);
        drawObstacles(); // <-- Make sure this is called here

        // Spaceship
        ctx.drawImage(
            spaceshipImg,
            spaceship.x,
            spaceship.y,
            spaceship.width,
            spaceship.height
        );

        drawScore();
    } else if (gameOver) {
        drawObstacles();
        ctx.drawImage(
            spaceshipImg,
            spaceship.x,
            spaceship.y,
            spaceship.width,
            spaceship.height
        );
        drawScore();
        showGameOverScreen();
    } else {
        hideGameOverScreen();
    }

    lastTime = timestamp;
    requestAnimationFrame(gameLoop);
}

// Game over buttons
mainMenuButton.addEventListener('click', function() {
    gameOver = false;
    gameStarted = false;
    hideGameOverScreen();
    titleScreen.style.display = 'flex';
});

restartButton.addEventListener('click', function() {
    hideGameOverScreen();
    resetGame();
    gameStarted = true;
    lastObstacleTime = 0;
    lastTime = 0;
});
