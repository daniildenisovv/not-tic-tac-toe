"use client";

import { GameRoom, Player } from "@/types/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPlayerMoves, MAX_PIECES_PER_PLAYER } from "@/lib/game-logic";

interface GameInfoProps {
  room: GameRoom;
  currentUser?: {
    id: string;
    name: string;
    telegramId?: number;
  };
  onRestart?: () => void;
  onShare?: () => void;
  className?: string;
}

export function GameInfo({
  room,
  currentUser,
  onRestart,
  onShare,
  className,
}: GameInfoProps) {
  const { board, players, status } = room;
  const userSymbol = getUserSymbol(currentUser, players);

  const xMoves = getPlayerMoves(board, "X");
  const oMoves = getPlayerMoves(board, "O");

  const getPlayerName = (symbol: Player): string => {
    const player = players[symbol];
    return player?.name || `Player ${symbol}`;
  };

  const getGameStatus = (): string => {
    if (status === "waiting") return "Waiting for opponent...";
    if (board.isGameOver) {
      if (board.winner) return `${getPlayerName(board.winner)} wins!`;
      if (board.isDraw) return "It's a draw!";
    }
    return `${getPlayerName(board.currentPlayer)}'s turn`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-center text-lg">Game Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game Status */}
        <div className="text-center">
          <Badge
            variant={board.isGameOver ? "destructive" : "default"}
            className="text-sm px-3 py-1"
          >
            {getGameStatus()}
          </Badge>
        </div>

        {/* Players Info */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className={cn(
              "p-3 rounded-lg border-2 transition-colors",
              board.currentPlayer === "X" && !board.isGameOver
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                : "border-gray-200 dark:border-gray-700"
            )}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                X
              </div>
              <div className="text-sm font-medium">{getPlayerName("X")}</div>
              <div className="text-xs text-gray-500">
                {xMoves.length}/{MAX_PIECES_PER_PLAYER} pieces
              </div>
              {userSymbol === "X" && (
                <Badge variant="outline" className="mt-1 text-xs">
                  You
                </Badge>
              )}
            </div>
          </div>

          <div
            className={cn(
              "p-3 rounded-lg border-2 transition-colors",
              board.currentPlayer === "O" && !board.isGameOver
                ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                : "border-gray-200 dark:border-gray-700"
            )}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                O
              </div>
              <div className="text-sm font-medium">{getPlayerName("O")}</div>
              <div className="text-xs text-gray-500">
                {oMoves.length}/{MAX_PIECES_PER_PLAYER} pieces
              </div>
              {userSymbol === "O" && (
                <Badge variant="outline" className="mt-1 text-xs">
                  You
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Room ID */}
        <div className="text-center">
          <div className="text-xs text-gray-500">Room ID:</div>
          <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {room.id}
          </code>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {status === "waiting" && onShare && (
            <Button onClick={onShare} variant="outline" className="flex-1">
              Share Room
            </Button>
          )}

          {board.isGameOver && onRestart && (
            <Button onClick={onRestart} className="flex-1">
              Play Again
            </Button>
          )}
        </div>

        {/* Game Rules */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <div>🎯 Each player can have max 3 pieces on board</div>
          <div>🔄 Oldest piece disappears when placing the 4th</div>
        </div>
      </CardContent>
    </Card>
  );
}

function getUserSymbol(
  currentUser: { id: string; telegramId?: number } | undefined,
  players: GameRoom["players"]
): Player | null {
  if (!currentUser) return null;

  // First try to match by socket ID (primary method)
  if (players.X?.id === currentUser.id) return "X";
  if (players.O?.id === currentUser.id) return "O";

  // Fallback: try to match by telegramId if available
  if (currentUser.telegramId) {
    if (players.X?.telegramId === currentUser.telegramId) return "X";
    if (players.O?.telegramId === currentUser.telegramId) return "O";
  }

  return null;
}
