import { GameBoard, GameMove, Player, CellValue } from "@/types/game";

export const BOARD_SIZE = 3;
export const MAX_PIECES_PER_PLAYER = 3;

/**
 * Create an empty game board
 */
export function createEmptyBoard(): GameBoard {
  const cells: CellValue[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  return {
    cells,
    moves: [],
    currentPlayer: "X",
    winner: null,
    isDraw: false,
    isGameOver: false,
  };
}

/**
 * Check if a cell is empty
 */
export function isCellEmpty(
  board: GameBoard,
  row: number,
  col: number
): boolean {
  return board.cells[row][col] === null;
}

/**
 * Check if the move is valid
 */
export function isValidMove(
  board: GameBoard,
  row: number,
  col: number
): boolean {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return false;
  }
  return isCellEmpty(board, row, col);
}

/**
 * Get moves for a specific player
 */
export function getPlayerMoves(board: GameBoard, player: Player): GameMove[] {
  return board.moves.filter((move) => move.player === player);
}

/**
 * Make a move on the board with the 3-piece limit rule
 */
export function makeMove(
  board: GameBoard,
  row: number,
  col: number,
  player: Player
): GameBoard {
  if (!isValidMove(board, row, col) || board.isGameOver) {
    return board;
  }

  const newBoard = JSON.parse(JSON.stringify(board)) as GameBoard;
  const playerMoves = getPlayerMoves(newBoard, player);

  // If player already has 3 pieces, remove the oldest one
  if (playerMoves.length >= MAX_PIECES_PER_PLAYER) {
    const oldestMove = playerMoves[0];
    newBoard.cells[oldestMove.row][oldestMove.col] = null;
    // Remove the oldest move from moves array
    const moveIndex = newBoard.moves.findIndex(
      (m) =>
        m.row === oldestMove.row &&
        m.col === oldestMove.col &&
        m.player === oldestMove.player &&
        m.moveNumber === oldestMove.moveNumber
    );
    if (moveIndex > -1) {
      newBoard.moves.splice(moveIndex, 1);
    }
  }

  // Add the new move
  const moveNumber = newBoard.moves.length + 1;
  const newMove: GameMove = {
    row,
    col,
    player,
    timestamp: Date.now(),
    moveNumber,
  };

  newBoard.cells[row][col] = player;
  newBoard.moves.push(newMove);

  // Check for winner
  newBoard.winner = checkWinner(newBoard);
  newBoard.isDraw = !newBoard.winner && isBoardFull(newBoard);
  newBoard.isGameOver = newBoard.winner !== null || newBoard.isDraw;

  // Switch player if game is not over
  if (!newBoard.isGameOver) {
    newBoard.currentPlayer = player === "X" ? "O" : "X";
  }

  return newBoard;
}

/**
 * Check if the board is full (no empty cells)
 */
export function isBoardFull(board: GameBoard): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board.cells[row][col] === null) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Check for a winner
 */
export function checkWinner(board: GameBoard): Player | null {
  const { cells } = board;

  // Check rows
  for (let row = 0; row < BOARD_SIZE; row++) {
    if (
      cells[row][0] &&
      cells[row][0] === cells[row][1] &&
      cells[row][1] === cells[row][2]
    ) {
      return cells[row][0];
    }
  }

  // Check columns
  for (let col = 0; col < BOARD_SIZE; col++) {
    if (
      cells[0][col] &&
      cells[0][col] === cells[1][col] &&
      cells[1][col] === cells[2][col]
    ) {
      return cells[0][col];
    }
  }

  // Check diagonals
  if (
    cells[0][0] &&
    cells[0][0] === cells[1][1] &&
    cells[1][1] === cells[2][2]
  ) {
    return cells[0][0];
  }

  if (
    cells[0][2] &&
    cells[0][2] === cells[1][1] &&
    cells[1][1] === cells[2][0]
  ) {
    return cells[0][2];
  }

  return null;
}

/**
 * Get the latest move for a specific cell
 */
export function getCellMoveNumber(
  board: GameBoard,
  row: number,
  col: number
): number | null {
  const cellMoves = board.moves.filter(
    (move) => move.row === row && move.col === col
  );
  if (cellMoves.length === 0) return null;

  // Return the move number of the latest move in this cell
  return Math.max(...cellMoves.map((move) => move.moveNumber));
}

/**
 * Get cells that will be removed on next move for a player
 */
export function getCellsToBeRemoved(
  board: GameBoard,
  player: Player
): { row: number; col: number } | null {
  const playerMoves = getPlayerMoves(board, player);

  if (playerMoves.length >= MAX_PIECES_PER_PLAYER) {
    const oldestMove = playerMoves.reduce((oldest, current) =>
      current.moveNumber < oldest.moveNumber ? current : oldest
    );
    return { row: oldestMove.row, col: oldestMove.col };
  }

  return null;
}

/**
 * Restart the game
 */
export function restartGame(): GameBoard {
  return createEmptyBoard();
}
