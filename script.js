document.addEventListener('DOMContentLoaded', () => {
  // Constants
  const ROWS = 6;
  const COLS = 7;
  const PLAYER1 = 1;
  const PLAYER2 = 2;
  
  // Game state
  let board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
  let currentPlayer = PLAYER1;
  let winner = null;
  let isDraw = false;
  let winningCells = [];
  let lastDropped = null;
  
  // DOM elements
  const boardElement = document.getElementById('board');
  const hoverIndicator = document.getElementById('hover-indicator');
  const playerTurnElement = document.getElementById('player-turn');
  const currentPlayerElement = document.getElementById('current-player');
  const playerDiscElement = document.getElementById('player-disc');
  const winnerMessageElement = document.getElementById('winner-message');
  const winnerPlayerElement = document.getElementById('winner-player');
  const winnerDiscElement = document.getElementById('winner-disc');
  const drawMessageElement = document.getElementById('draw-message');
  const resetButton = document.getElementById('reset-button');
  
  // Initialize the game
  initGame();
  
  function initGame() {
    // Create the board
    createBoard();
    
    // Set up event listeners
    boardElement.addEventListener('mousemove', handleMouseMove);
    boardElement.addEventListener('mouseleave', handleMouseLeave);
    resetButton.addEventListener('click', resetGame);
    
    // Update UI
    updateGameStatus();
  }
  
  function createBoard() {
    boardElement.innerHTML = '';
    
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.addEventListener('click', () => dropDisc(col));
        
        const cellInner = document.createElement('div');
        cellInner.className = 'cell-inner';
        cell.appendChild(cellInner);
        
        const disc = document.createElement('div');
        disc.className = 'disc';
        disc.id = `disc-${row}-${col}`;
        cell.appendChild(disc);
        
        boardElement.appendChild(cell);
      }
    }
  }
  
  function handleMouseMove(e) {
    if (winner || isDraw) return;
    
    const rect = boardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const colWidth = rect.width / COLS;
    const col = Math.floor(x / colWidth);
    
    if (col >= 0 && col < COLS) {
      // Check if column is full
      if (board[0][col] !== null) {
        hoverIndicator.classList.remove('visible');
        return;
      }
      
      // Update hover indicator
      hoverIndicator.style.left = `${(col / COLS) * 100}%`;
      hoverIndicator.classList.add('visible');
      
      // Update hover disc color
      const hoverDisc = hoverIndicator.querySelector('.hover-disc');
      hoverDisc.className = 'hover-disc';
      hoverDisc.classList.add(currentPlayer === PLAYER1 ? 'red' : 'yellow');
      
      // Update cell hover state
      const cells = document.querySelectorAll('.cell');
      cells.forEach(cell => {
        cell.classList.remove('hover');
        if (parseInt(cell.dataset.col) === col && board[parseInt(cell.dataset.row)][col] === null) {
          cell.classList.add('hover');
        }
      });
    }
  }
  
  function handleMouseLeave() {
    hoverIndicator.classList.remove('visible');
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('hover'));
  }
  
  function dropDisc(col) {
    if (winner || isDraw) return;
    if (board[0][col] !== null) return; // Column is full
    
    // Find the lowest empty cell in the column
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === null) {
        row = r;
        break;
      }
    }
    
    if (row === -1) return; // Should never happen, but just in case
    
    // Update the board
    board[row][col] = currentPlayer;
    lastDropped = [row, col];
    
    // Update the UI
    const disc = document.getElementById(`disc-${row}-${col}`);
    disc.className = 'disc';
    disc.classList.add(currentPlayer === PLAYER1 ? 'red' : 'yellow');
    disc.classList.add('visible');
    
    // Check for win
    const winResult = checkWin(row, col);
    if (winResult) {
      winner = currentPlayer;
      winningCells = winResult;
      highlightWinningCells();
      updateGameStatus();
      return;
    }
    
    // Check for draw
    if (checkDraw()) {
      isDraw = true;
      updateGameStatus();
      return;
    }
    
    // Switch player
    currentPlayer = currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1;
    updateGameStatus();
  }
  
  function checkWin(row, col) {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down-right
      [1, -1],  // diagonal down-left
    ];
    
    const player = board[row][col];
    
    for (const [dx, dy] of directions) {
      const winningCells = [[row, col]];
      
      // Check in both directions
      for (let dir = -1; dir <= 1; dir += 2) {
        if (dir === 0) continue;
        
        for (let i = 1; i < 4; i++) {
          const newRow = row + i * dx * dir;
          const newCol = col + i * dy * dir;
          
          if (
            newRow >= 0 && 
            newRow < ROWS && 
            newCol >= 0 && 
            newCol < COLS && 
            board[newRow][newCol] === player
          ) {
            winningCells.push([newRow, newCol]);
          } else {
            break;
          }
        }
      }
      
      if (winningCells.length >= 4) {
        return winningCells;
      }
      
      winningCells.length = 1;
    }
    
    return null;
  }
  
  function checkDraw() {
    return board[0].every(cell => cell !== null);
  }
  
  function highlightWinningCells() {
    winningCells.forEach(([row, col]) => {
      const disc = document.getElementById(`disc-${row}-${col}`);
      disc.classList.add('winning');
    });
  }
  
  function updateGameStatus() {
    // Update player turn
    playerTurnElement.className = 'status-card';
    playerTurnElement.classList.add(currentPlayer === PLAYER1 ? 'player1' : 'player2');
    currentPlayerElement.textContent = currentPlayer;
    playerDiscElement.className = 'player-disc';
    playerDiscElement.classList.add(currentPlayer === PLAYER1 ? 'red' : 'yellow');
    
    // Show/hide game status elements
    if (winner) {
      playerTurnElement.classList.add('hidden');
      winnerMessageElement.classList.remove('hidden');
      drawMessageElement.classList.add('hidden');
      
      winnerPlayerElement.textContent = winner;
      winnerDiscElement.className = 'player-disc';
      winnerDiscElement.classList.add(winner === PLAYER1 ? 'red' : 'yellow');
    } else if (isDraw) {
      playerTurnElement.classList.add('hidden');
      winnerMessageElement.classList.add('hidden');
      drawMessageElement.classList.remove('hidden');
    } else {
      playerTurnElement.classList.remove('hidden');
      winnerMessageElement.classList.add('hidden');
      drawMessageElement.classList.add('hidden');
    }
  }
  
  function resetGame() {
    // Reset game state
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    currentPlayer = PLAYER1;
    winner = null;
    isDraw = false;
    winningCells = [];
    lastDropped = null;
    
    // Reset UI
    const discs = document.querySelectorAll('.disc');
    discs.forEach(disc => {
      disc.className = 'disc';
    });
    
    // Update game status
    updateGameStatus();
  }
}); 