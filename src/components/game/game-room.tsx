"use client";

import { useEffect, useState } from "react";
import { GameRoom as GameRoomType, Player } from "@/types/game";
import { GameBoard } from "./game-board";
import { GameInfo } from "./game-info";
import { useSocket } from "@/components/providers/socket-provider";
import { useTelegram } from "@/components/providers/telegram-provider";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GameRoomProps {
  initialRoom?: GameRoomType;
  roomId?: string;
}

export function GameRoom({ initialRoom, roomId }: GameRoomProps) {
  const [room, setRoom] = useState<GameRoomType | null>(initialRoom || null);
  const [isLoading, setIsLoading] = useState(!initialRoom);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const { socket, isConnected, joinRoom } = useSocket();
  const { user, webApp } = useTelegram();

  useEffect(() => {
    if (!socket || !isConnected || !roomId) return;

    // Join room if roomId is provided and we haven't joined yet
    if (!room && !isJoining) {
      setIsJoining(true);
      joinRoom(roomId);
    }

    // Socket event handlers
    const handleRoomJoined = (gameRoom: GameRoomType) => {
      setRoom(gameRoom);
      setIsLoading(false);
      setIsJoining(false);
      toast.success("Joined game room!");
    };

    const handlePlayerJoined = (gameRoom: GameRoomType) => {
      setRoom(gameRoom);
      toast.success("Player joined the game!");
    };

    const handlePlayerLeft = (gameRoom: GameRoomType) => {
      setRoom(gameRoom);
      toast.info("Player left the game");
    };

    const handleMoveMade = (gameRoom: GameRoomType) => {
      setRoom(gameRoom);

      // Haptic feedback for Telegram
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred("light");
      }
    };

    const handleGameOver = (gameRoom: GameRoomType) => {
      setRoom(gameRoom);

      if (gameRoom.board.winner) {
        toast.success(`${gameRoom.board.winner} wins!`);
      } else if (gameRoom.board.isDraw) {
        toast.info("It's a draw!");
      }

      // Haptic feedback for game over
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred("success");
      }
    };

    const handleGameRestarted = (gameRoom: GameRoomType) => {
      setRoom(gameRoom);
      toast.success("Game restarted!");
    };

    const handleError = (error: string) => {
      toast.error(error);
      setIsLoading(false);
      setIsJoining(false);
    };

    // Register event listeners
    socket.on("room-joined", handleRoomJoined);
    socket.on("player-joined", handlePlayerJoined);
    socket.on("player-left", handlePlayerLeft);
    socket.on("move-made", handleMoveMade);
    socket.on("game-over", handleGameOver);
    socket.on("game-restarted", handleGameRestarted);
    socket.on("error", handleError);

    return () => {
      socket.off("room-joined", handleRoomJoined);
      socket.off("player-joined", handlePlayerJoined);
      socket.off("player-left", handlePlayerLeft);
      socket.off("move-made", handleMoveMade);
      socket.off("game-over", handleGameOver);
      socket.off("game-restarted", handleGameRestarted);
      socket.off("error", handleError);
    };
  }, [socket, isConnected, roomId, isJoining, room, joinRoom, webApp]);

  const handleCellClick = (row: number, col: number) => {
    if (!room || !socket || room.board.isGameOver) return;

    const userSymbol = getUserSymbol();
    if (!userSymbol || room.board.currentPlayer !== userSymbol) {
      toast.error("It's not your turn!");
      return;
    }

    if (room.board.cells[row][col] !== null) {
      toast.error("Cell is already occupied!");
      return;
    }

    socket.emit("make-move", {
      roomId: room.id,
      row,
      col,
    });
  };

  const handleRestart = () => {
    if (!room || !socket) return;

    socket.emit("restart-game", room.id);
    setShowRestartDialog(false);
  };

  const handleShare = () => {
    if (!room) return;

    const shareUrl = `${window.location.origin}/game/${room.id}`;

    if (webApp?.openTelegramLink) {
      const shareText = `Join my Tic Tac Toe game! 🎮\n\nRoom: ${room.id}\nClick to play: ${shareUrl}`;
      webApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(shareText)}`
      );
    } else if (navigator.share) {
      navigator.share({
        title: "Tic Tac Toe Game",
        text: `Join my Tic Tac Toe game! Room: ${room.id}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Room link copied to clipboard!");
    }
  };

  const getUserSymbol = (): Player | null => {
    if (!room || !socket) return null;

    if (room.players.X?.id === socket.id) return "X";
    if (room.players.O?.id === socket.id) return "O";

    return null;
  };

  const canMakeMove = (): boolean => {
    if (!room || !socket) return false;

    const userSymbol = getUserSymbol();
    return userSymbol === room.board.currentPlayer && !room.board.isGameOver;
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading game...</p>
        </CardContent>
      </Card>
    );
  }

  if (!room) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-lg font-medium text-red-600">
            Game room not found
          </p>
          <p className="text-sm text-gray-600 mt-2">
            The room may have expired or been deleted.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <GameInfo
        room={room}
        currentUser={
          socket?.id
            ? {
                id: socket.id,
                name: user
                  ? user.first_name +
                    (user.last_name ? ` ${user.last_name}` : "")
                  : "Unknown User",
                telegramId: user?.id,
              }
            : undefined
        }
        onRestart={() => setShowRestartDialog(true)}
        onShare={handleShare}
      />

      <GameBoard
        board={room.board}
        onCellClick={handleCellClick}
        disabled={!canMakeMove()}
        currentPlayer={room.board.currentPlayer}
      />

      {/* Restart Confirmation Dialog */}
      <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart Game?</AlertDialogTitle>
            <AlertDialogDescription>
              This will start a new game and reset the board. Both players will
              need to agree.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestart}>
              Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
