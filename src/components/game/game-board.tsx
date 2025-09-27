"use client";

import { GameBoard as GameBoardType, Player } from "@/types/game";
import { GameCell } from "./game-cell";
import { getCellMoveNumber, getCellsToBeRemoved } from "@/lib/game-logic";
import { cn } from "@/lib/utils";

interface GameBoardProps {
  board: GameBoardType;
  onCellClick: (row: number, col: number) => void;
  disabled?: boolean;
  currentPlayer?: Player;
  className?: string;
}

export function GameBoard({
  board,
  onCellClick,
  disabled = false,
  currentPlayer,
  className,
}: GameBoardProps) {
  const winningCells = getWinningCells(board);
  const cellsToBeRemoved = currentPlayer
    ? getCellsToBeRemoved(board, currentPlayer)
    : null;

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg",
        className
      )}
    >
      {board.cells.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const moveNumber = getCellMoveNumber(board, rowIndex, colIndex);
          const isWinningCell = winningCells.some(
            ([r, c]) => r === rowIndex && c === colIndex
          );
          const isToBeRemoved = Boolean(
            cellsToBeRemoved &&
              cellsToBeRemoved.row === rowIndex &&
              cellsToBeRemoved.col === colIndex
          );

          return (
            <GameCell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              onClick={() => onCellClick(rowIndex, colIndex)}
              disabled={disabled || cell !== null}
              isWinningCell={isWinningCell}
              isToBeRemoved={isToBeRemoved}
              moveNumber={moveNumber}
            />
          );
        })
      )}
    </div>
  );
}

/**
 * Get the coordinates of winning cells
 */
function getWinningCells(board: GameBoardType): [number, number][] {
  const { cells } = board;
  const size = 3;

  // Check rows
  for (let row = 0; row < size; row++) {
    if (
      cells[row][0] &&
      cells[row][0] === cells[row][1] &&
      cells[row][1] === cells[row][2]
    ) {
      return [
        [row, 0],
        [row, 1],
        [row, 2],
      ];
    }
  }

  // Check columns
  for (let col = 0; col < size; col++) {
    if (
      cells[0][col] &&
      cells[0][col] === cells[1][col] &&
      cells[1][col] === cells[2][col]
    ) {
      return [
        [0, col],
        [1, col],
        [2, col],
      ];
    }
  }

  // Check main diagonal
  if (
    cells[0][0] &&
    cells[0][0] === cells[1][1] &&
    cells[1][1] === cells[2][2]
  ) {
    return [
      [0, 0],
      [1, 1],
      [2, 2],
    ];
  }

  // Check anti-diagonal
  if (
    cells[0][2] &&
    cells[0][2] === cells[1][1] &&
    cells[1][1] === cells[2][0]
  ) {
    return [
      [0, 2],
      [1, 1],
      [2, 0],
    ];
  }

  return [];
}
