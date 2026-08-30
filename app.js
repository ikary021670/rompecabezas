const BOARD_SIZE = 3;
const TOTAL_TILES = BOARD_SIZE * BOARD_SIZE;
let moves = 0;
let imageUrl = 'https://picsum.photos/300/300';

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

function buildBoardZones() {
  board.innerHTML = '';
  for (let i = 0; i < TOTAL_TILES; i++) {
    const zone = document.createElement('div');
    zone.classList.add('drop-zone');
    zone.dataset.index = i;

    // Eventos Mouse Drag & Drop
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
  const pieceIndexes = Array.from({ length: TOTAL_TILES }, (_, i) => i);
  pieceIndexes.sort(() => Math.random() - 0.5);

  pieceIndexes.forEach(id => {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.draggable = true;
    tile.dataset.id = id;

    const row = Math.floor(id / BOARD_SIZE);
    const col = id % BOARD_SIZE;
    tile.style.backgroundImage = `url('${imageUrl}')`;
    tile.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;

    // Soporte para Mouse
    tile.addEventListener('dragstart', handleDragStart);

    // Soporte para Pantallas Táctiles (Touch)
    tile.addEventListener('touchstart', handleTouchStart, { passive: false });
    tile.addEventListener('touchmove', handleTouchMove, { passive: false });
    tile.addEventListener('touchend', handleTouchEnd);

    piecesContainer.appendChild(tile);
  });
}

let draggedTile = null;

// --- LÓGICA MOUSE ---
function handleDragStart(e) {
  draggedTile = e.target;
}

function handleDrop(e) {
  e.preventDefault();
  const zone = e.currentTarget;
  zone.classList.remove('hovered');
  placeTileInZone(zone, draggedTile);
}

// --- LÓGICA TOUCH (MÓVIL) ---
let touchClone = null;

function handleTouchStart(e) {
  draggedTile = e.currentTarget;
  draggedTile.classList.add('dragging');

  // Crear clon visual que sigue el dedo
  touchClone = draggedTile.cloneNode(true);
  touchClone.style.position = 'fixed';
  touchClone.style.zIndex = '1000';
  touchClone.style.pointerEvents = 'none';
  touchClone.style.width = '80px';
  touchClone.style.height = '80px';
  
  const touch = e.touches[0];
  touchClone.style.left = `${touch.clientX - 40}px`;
  touchClone.style.top = `${touch.clientY - 40}px`;

  document.body.appendChild(touchClone);
}

function handleTouchMove(e) {
  if (!touchClone) return;
  e.preventDefault(); // Previene el scroll del navegador al arrastrar una pieza

  const touch = e.touches[0];
  touchClone.style.left = `${touch.clientX - 40}px`;
  touchClone.style.top = `${touch.clientY - 40}px`;
}

function handleTouchEnd(e) {
  if (!draggedTile) return;
  draggedTile.classList.remove('dragging');

  if (touchClone) {
    touchClone.remove();
    touchClone = null;
  }

  const touch = e.changedTouches[0];
  // Detectar elemento debajo del punto donde se soltó el dedo
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

  draggedTile = null;
}

// Colocar o intercambiar pieza
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
  checkWin();
}

// Regresar pieza al banner con mouse drag
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