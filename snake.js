const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;

let x = [];
let y = [];

let bodyParts = 4;
let applesEaten = 0;
let appleX;
let appleY;
let direction = 'RIGHT';
let running = false;
let gameInterval;
let gameSpeed = 120; 
let unitSize = 20;

const menuBox = document.getElementById('menuBox');
const resultBox = document.getElementById('resultBox');
const resultMessage = document.getElementById('resultMessage');
const resultRestartBtn = document.getElementById('resultRestartBtn');

const grassBlocks = []; 

// Initialize grass blocks randomly at some units for animation
function initGrassBlocks() {
  grassBlocks.length = 0;
  const rows = SCREEN_HEIGHT / unitSize;
  const cols = SCREEN_WIDTH / unitSize;

  // ~10% of blocks are grass patches
  const totalGrass = Math.floor(rows * cols * 0.1);

  for (let i = 0; i < totalGrass; i++) {
    let gx = Math.floor(Math.random() * cols) * unitSize;
    let gy = Math.floor(Math.random() * rows) * unitSize;

    // Avoid duplicate positions
    if (!grassBlocks.some(b => b.x === gx && b.y === gy)) {
      grassBlocks.push({x: gx, y: gy, blink: Math.random()});
    }
  }
}

function startGameWithSettings(speed, size) {
  gameSpeed = speed;
  unitSize = size;
  menuBox.style.display = 'none';
  init();
}

function init() {
  x = [];
  y = [];
  bodyParts = 6;
  applesEaten = 0;
  direction = 'RIGHT';
  running = true;

  for (let i = 0; i < bodyParts; i++) {
    x[i] = (bodyParts - i - 1) * unitSize;
    y[i] = 0;
  }

  placeApple();

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, gameSpeed);

  resultBox.style.display = 'none';

  initGrassBlocks();
}

function placeApple() {
  appleX = Math.floor(Math.random() * (SCREEN_WIDTH / unitSize)) * unitSize;
  appleY = Math.floor(Math.random() * (SCREEN_HEIGHT / unitSize)) * unitSize;
}

function gameLoop() {
  if (running) {
    move();
    checkApple();
    checkCollisions();
    draw();
  } else {
    gameOver();
  }
}

function move() {
  for (let i = bodyParts; i > 0; i--) {
    x[i] = x[i - 1];
    y[i] = y[i - 1];
  }
  switch (direction) {
    case 'LEFT': x[0] -= unitSize; break;
    case 'RIGHT': x[0] += unitSize; break;
    case 'UP': y[0] -= unitSize; break;
    case 'DOWN': y[0] += unitSize; break;
  }
}

function checkApple() {
  if (x[0] === appleX && y[0] === appleY) {
    bodyParts++;
    applesEaten++;
    x[bodyParts - 1] = x[bodyParts - 2];
    y[bodyParts - 1] = y[bodyParts - 2];
    placeApple();
  }
}

function checkCollisions() {
  for (let i = bodyParts - 1; i > 0; i--) {
    if (x[0] === x[i] && y[0] === y[i]) {
      running = false;
    }
  }
  if (x[0] < 0 || x[0] >= SCREEN_WIDTH || y[0] < 0 || y[0] >= SCREEN_HEIGHT) {
    running = false;
  }
}

function drawGrass() {
  grassBlocks.forEach(block => {
    const alpha = 0.4 + 0.6 * Math.abs(Math.sin(Date.now() / 500 + block.blink * Math.PI * 2));
    ctx.fillStyle = `rgba(85, 139, 47, ${alpha})`;
    ctx.fillRect(block.x, block.y, unitSize, unitSize);
  });
}

function drawRoundedRect(x, y, width, height, radius, fillStyle) {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function draw() {
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  drawGrass();

  // Draw apple as red circle
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(appleX + unitSize / 2, appleY + unitSize / 2, unitSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw snake parts with rounded rectangles
  for (let i = 0; i < bodyParts; i++) {
    let radius = unitSize / 2 * 0.6;
    let color;

    if (i === 0) {
      color = '#0d47a1';
      radius = unitSize / 2 * 0.9;
    } else if (i === bodyParts - 1) {
      color = '#82b1ff';
      radius = unitSize / 2 * 0.4;
    } else {
      const blueShade = 150 + Math.floor(Math.random() * 105);
      color = `rgb(0, 0, ${blueShade})`;
    }

    drawRoundedRect(x[i], y[i], unitSize, unitSize, radius, color);
  }

  ctx.fillStyle = 'white';
  ctx.font = '28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Score: ' + applesEaten, SCREEN_WIDTH / 2, 35);
}

function gameOver() {
  clearInterval(gameInterval);
  resultMessage.textContent = `💀 Game over! Score: ${applesEaten}`;
  resultBox.style.display = 'block';
}

resultRestartBtn.addEventListener('click', () => {
  resultBox.style.display = 'none';
  menuBox.style.display = 'block';
  // Do NOT call init here — wait for difficulty choice again
  direction = 'RIGHT'; // reset direction
});

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowLeft':
      if (direction !== 'RIGHT') direction = 'LEFT';
      break;
    case 'ArrowRight':
      if (direction !== 'LEFT') direction = 'RIGHT';
      break;
    case 'ArrowUp':
      if (direction !== 'DOWN') direction = 'UP';
      break;
    case 'ArrowDown':
      if (direction !== 'UP') direction = 'DOWN';
      break;
  }
});

menuBox.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', () => {
    const speed = parseInt(button.getAttribute('data-speed'), 10);
    const size = parseInt(button.getAttribute('data-unit-size'), 10);
    startGameWithSettings(speed, size);
  });
});


