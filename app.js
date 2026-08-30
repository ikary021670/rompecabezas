const BOARD_SIZE = 3;
let tiles = [];
let moves = 0;
let imageUrl = 'https://picsum.photos/320/320';

const board = document.getElementById('board');
const movesCounter = document.getElementById('moves');
const winMessage = document.getElementById('win-message');
const btnShuffle = document.getElementById('btn-shuffle');
const btnUpload = document.getElementById('btn-upload');
const imgInput = document.getElementById('img-input');

// Event Listeners
btnShuffle.addEventListener('click', () => shuffleBoard());
btnUpload.addEventListener('click', () => imgInput.click());
imgInput.addEventListener('change', loadCustomImage);

function initBoard() {
  tiles = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => i);
  moves = 0;
  movesCounter.textContent = moves;
  winMessage.style.display = 'none';
  shuffleBoard();
}

function renderBoard() {
  board.innerHTML = '';
  tiles.forEach((tileValue, index) => {
    const tile = document.createElement('div');
    tile.classList.add('tile');

    if (tileValue === 8) {
      tile.classList.add('empty');
    } else {
      tile.style.backgroundImage = `url('${imageUrl}')`;
      const row = Math.floor(tileValue / BOARD_SIZE);
      const col = tileValue % BOARD_SIZE;
      tile.style.backgroundPosition = `-${col * 106.66}px -${row * 106.66}px`;
    }

    tile.addEventListener('click', () => moveTile(index));
    board.appendChild(tile);
  });
}

function moveTile(index) {
  const emptyIndex = tiles.indexOf(8);
  const validMoves = getValidMoves(emptyIndex);

  if (validMoves.includes(index)) {
    [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
    moves++;
    movesCounter.textContent = moves;
    renderBoard();
    checkWin();
  }
}

function getValidMoves(emptyIndex) {
  const row = Math.floor(emptyIndex / BOARD_SIZE);
  const col = emptyIndex % BOARD_SIZE;
  const valid = [];

  if (row > 0) valid.push(emptyIndex - BOARD_SIZE);
  if (row < BOARD_SIZE - 1) valid.push(emptyIndex + BOARD_SIZE);
  if (col > 0) valid.push(emptyIndex - 1);
  if (col < BOARD_SIZE - 1) valid.push(emptyIndex + 1);

  return valid;
}

function shuffleBoard() {
  for (let i = 0; i < 100; i++) {
    const emptyIndex = tiles.indexOf(8);
    const validMoves = getValidMoves(emptyIndex);
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    [tiles[randomMove], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[randomMove]];
  }
  moves = 0;
  movesCounter.textContent = moves;
  winMessage.style.display = 'none';
  renderBoard();
}

function checkWin() {
  const isWon = tiles.every((val, i) => val === i);
  if (isWon) {
    winMessage.style.display = 'block';
  }
}

function loadCustomImage(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imageUrl = e.target.result;
      initBoard();
    };
    reader.readAsDataURL(file);
  }
}

// Inicializar Juego
initBoard();

// Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registrado con éxito:', reg.scope))
      .catch(err => console.error('Error al registrar Service Worker:', err));
  });
}