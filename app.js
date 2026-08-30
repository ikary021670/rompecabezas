let boardSize = 3;
let totalTiles = boardSize * boardSize;
let moves = 0;
let imageUrl = 'https://picsum.photos/320/320';

const board = document.getElementById('board');
const piecesContainer = document.getElementById('pieces-container');
const movesCounter = document.getElementById('moves');
const statusMessage = document.getElementById('status-message');
const previewImg = document.getElementById('preview-img');
const btnShuffle = document.getElementById('btn-shuffle');
const btnUpload = document.getElementById('btn-upload');
const imgInput = document.getElementById('img-input');
const difficultySelect = document.getElementById('difficulty-select');

// Modal Elements
const imageModal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-img');

btnShuffle.addEventListener('click', initGame);
btnUpload.addEventListener('click', () => imgInput.click());
imgInput.addEventListener('change', loadCustomImage);
difficultySelect.addEventListener('change', (e) => {
  boardSize = parseInt(e.target.value);
  totalTiles = boardSize * boardSize;
  initGame();
});

// 2. Lógica del Zoom Modal
previewImg.addEventListener('click', () => {
  modalImg.src = imageUrl;
  imageModal.classList.add('active');
});

imageModal.addEventListener('click', () => {
  imageModal.classList.remove('active');
});

function initGame() {
  moves = 0;
  movesCounter.textContent = moves;
  statusMessage.className = 'status-badge';
  statusMessage.style.display = 'none';
  statusMessage.textContent = '';
  previewImg.src = imageUrl;

  buildBoardZones();
  buildPieces();
}

function buildBoardZones() {
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;

  for (let i = 0; i < totalTiles; i++) {
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

function buildPieces() {
  piecesContainer.innerHTML = '';
  const pieceIndexes = Array.from({ length: totalTiles }, (_, i) => i);
  pieceIndexes.sort(() => Math.random() - 0.5);

  const tileSize = 320 / boardSize;

  pieceIndexes.forEach(id => {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.draggable = true;
    tile.dataset.id = id;

    const row = Math.floor(id / boardSize);
    const col = id % boardSize;
    tile.style.backgroundImage = `url('${imageUrl}')`;
    tile.style.backgroundSize = '320px 320px';
    tile.style.backgroundPosition = `-${col * tileSize}px -${row * tileSize}px`;

    // Mouse
    tile.addEventListener('dragstart', handleDragStart);

    // Touch
    tile.addEventListener('touchstart', handleTouchStart, { passive: false });
    tile.addEventListener('touchmove', handleTouchMove, { passive: false });
    tile.addEventListener('touchend', handleTouchEnd);

    piecesContainer.appendChild(tile);
  });
}

let draggedTile = null;

// Mouse Drag
function handleDragStart(e) {
  draggedTile = e.target;
}

function handleDrop(e) {
  e.preventDefault();
  const zone = e.currentTarget;
  zone.classList.remove('hovered');
  placeTileInZone(zone, draggedTile);
}

// 3. Touch Drag con distinción de scroll horizontal vs arrastre vertical
let touchClone = null;
let startX = 0;
let startY = 0;
let isDraggingPiece = false;

function handleTouchStart(e) {
  const touch = e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
  draggedTile = e.currentTarget;
  isDraggingPiece = false;
}

function handleTouchMove(e) {
  if (!draggedTile) return;
  const touch = e.touches[0];
  const diffX = Math.abs(touch.clientX - startX);
  const diffY = touch.clientY - startY;

  // Si la pieza está en el banner, solo arrastrar si el movimiento es hacia ARRIBA (diffY negativo)
  if (!isDraggingPiece && draggedTile.parentElement.id === 'pieces-container') {
    if (diffY < -10 && Math.abs(diffY) > diffX) {
      isDraggingPiece = true;
      createTouchClone(touch);
    } else {
      return; // Permite el scroll horizontal normal de la barra
    }
  } else if (!isDraggingPiece && draggedTile.parentElement.classList.contains('drop-zone')) {
    isDraggingPiece = true;
    createTouchClone(touch);
  }

  if (isDraggingPiece && touchClone) {
    e.preventDefault();
    touchClone.style.left = `${touch.clientX - 40}px`;
    touchClone.style.top = `${touch.clientY - 40}px`;
  }
}

function createTouchClone(touch) {
  draggedTile.classList.add('dragging');
  touchClone = draggedTile.cloneNode(true);
  touchClone.style.position = 'fixed';
  touchClone.style.zIndex = '1000';
  touchClone.style.pointerEvents = 'none';
  touchClone.style.width = '80px';
  touchClone.style.height = '80px';
  touchClone.style.opacity = '0.9';
  touchClone.style.left = `${touch.clientX - 40}px`;
  touchClone.style.top = `${touch.clientY - 40}px`;
  document.body.appendChild(touchClone);
}

function handleTouchEnd(e) {
  if (!draggedTile) return;
  draggedTile.classList.remove('dragging');

  if (touchClone) {
    touchClone.remove();
    touchClone = null;
  }

  if (isDraggingPiece) {
    const touch = e.changedTouches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

    if (targetElement) {
      const dropZone = targetElement.closest('.drop-zone');
      const targetBanner = targetElement.closest('.pieces-banner');

      if (dropZone) {
        placeTileInZone(dropZone, draggedTile);
      } else if (targetBanner || targetElement.id === 'pieces-container') {
        piecesContainer.appendChild(draggedTile);
      }
    }
  }

  draggedTile = null;
  isDraggingPiece = false;
}

function placeTileInZone(zone, tile) {
  if (zone.children.length === 0) {
    zone.appendChild(tile);
  } else {
    const existingTile = zone.children[0];
    const originParent = tile.parentElement;

    zone.appendChild(tile);
    originParent.appendChild(existingTile);
  }
  moves++;
  movesCounter.textContent = moves;
  checkBoardStatus();
}

piecesContainer.addEventListener('dragover', e => e.preventDefault());
piecesContainer.addEventListener('drop', e => {
  e.preventDefault();
  if (draggedTile) {
    piecesContainer.appendChild(draggedTile);
  }
});

// 4. Verificación de Tablero: Validar cuando esté lleno (Ganó o Error)
function checkBoardStatus() {
  const zones = document.querySelectorAll('.drop-zone');
  let placedTiles = 0;
  let correctCount = 0;

  zones.forEach(zone => {
    const tile = zone.children[0];
    if (tile) {
      placedTiles++;
      if (parseInt(tile.dataset.id) === parseInt(zone.dataset.index)) {
        correctCount++;
      }
    }
  });

  if (placedTiles === totalTiles) {
    if (correctCount === totalTiles) {
      statusMessage.textContent = '🎉 ¡Felicidades! Rompecabezas completado correctamente.';
      statusMessage.className = 'status-badge win';
    } else {
      statusMessage.textContent = '❌ Hay piezas fuera de lugar. ¡Sigue intentándolo!';
      statusMessage.className = 'status-badge error';
    }
  } else {
    statusMessage.style.display = 'none';
    statusMessage.className = 'status-badge';
  }
}

initGame();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registrado:', reg.scope))
      .catch(err => console.error('Error Service Worker:', err));
  });
}