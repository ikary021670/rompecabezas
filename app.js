const BOARD_SIZE = 3;
const TOTAL_TILES = BOARD_SIZE * BOARD_SIZE;
let moves = 0;
let imageUrl = 'https://picsum.photos/320/320';

const board = document.getElementById('board');
const piecesContainer = document.getElementById('pieces-container');
const movesCounter = document.getElementById('moves');
const winMessage = document.getElementById('win-message');
const previewImg = document.getElementById('preview-img');
const btnShuffle = document.getElementById('btn-shuffle');
const btnUpload = document.getElementById('btn-upload');
const imgInput = document.getElementById('img-input');

btnShuffle.addEventListener('click', initGame);
btnUpload.addEventListener('click', () => imgInput.click());
imgInput.addEventListener('change', loadCustomImage);

function initGame() {
  moves = 0;
  movesCounter.textContent = moves;
  winMessage.style.display = 'none';
  previewImg.src = imageUrl;

  buildBoardZones();
  buildPieces();
}

// 1. Crear las 9 celdas receptoras en el tablero
function buildBoardZones() {
  board.innerHTML = '';
  for (let i = 0; i < TOTAL_TILES; i++) {
    const zone = document.createElement('div');
    zone.classList.add('drop-zone');
    zone.dataset.index = i;

    zone.addEventListener('dragover', e => e.preventDefault());
    zone.addEventListener('dragenter', e => {
      e.preventDefault();
      zone.classList.add('hovered');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('hovered'));
    zone.addEventListener('drop', handleDrop);

    board.appendChild(zone);
  }
}

// 2. Crear las piezas y mezclarlas en la barra lateral
function buildPieces() {
  piecesContainer.innerHTML = '';
  const pieceIndexes = Array.from({ length: TOTAL_TILES }, (_, i) => i);
  
  // Mezclar array
  pieceIndexes.sort(() => Math.random() - 0.5);

  pieceIndexes.forEach(id => {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.draggable = true;
    tile.dataset.id = id;

    // Calcular recorte de fondo según la pieza
    const row = Math.floor(id / BOARD_SIZE);
    const col = id % BOARD_SIZE;
    tile.style.backgroundImage = `url('${imageUrl}')`;
    tile.style.backgroundPosition = `-${col * 106.66}px -${row * 106.66}px`;

    tile.addEventListener('dragstart', handleDragStart);
    piecesContainer.appendChild(tile);
  });
}

let draggedTile = null;

function handleDragStart(e) {
  draggedTile = e.target;
}

function handleDrop(e) {
  e.preventDefault();
  const zone = e.currentTarget;
  zone.classList.remove('hovered');

  // Si la celda ya tiene una pieza, intercambiar o no permitir
  if (zone.children.length === 0) {
    zone.appendChild(draggedTile);
    moves++;
    movesCounter.textContent = moves;
    checkWin();
  } else {
    // Intercambia la pieza existente con la zona de origen de la nueva
    const existingTile = zone.children[0];
    const parentOfDragged = draggedTile.parentElement;

    zone.appendChild(draggedTile);
    parentOfDragged.appendChild(existingTile);
    
    moves++;
    movesCounter.textContent = moves;
    checkWin();
  }
}

// Permitir regresar las piezas a la barra lateral si se arrastran de vuelta
piecesContainer.addEventListener('dragover', e => e.preventDefault());
piecesContainer.addEventListener('drop', e => {
  e.preventDefault();
  if (draggedTile) {
    piecesContainer.appendChild(draggedTile);
  }
});

function checkWin() {
  const zones = document.querySelectorAll('.drop-zone');
  let correctCount = 0;

  zones.forEach(zone => {
    const tile = zone.children[0];
    if (tile && parseInt(tile.dataset.id) === parseInt(zone.dataset.index)) {
      correctCount++;
    }
  });

  if (correctCount === TOTAL_TILES) {
    winMessage.style.display = 'block';
  }
}

function loadCustomImage(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imageUrl = e.target.result;
      initGame();
    };
    reader.readAsDataURL(file);
  }
}

// Inicializar Juego
initGame();

// Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registrado con éxito:', reg.scope))
      .catch(err => console.error('Error al registrar Service Worker:', err));
  });
}