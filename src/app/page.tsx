"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTelegram } from "@/components/providers/telegram-provider";
import { useSocket } from "@/components/providers/socket-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const { user, webApp } = useTelegram();
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  // Check for startapp parameter and auto-join room
  useEffect(() => {
    if (!webApp || !isConnected) return;

    const startParam = webApp.initDataUnsafe?.start_param;
    if (startParam) {
      // Automatically navigate to the room
      toast.info(`Joining room: ${startParam}`);
      router.push(`/game/${startParam}`);
    }
  }, [webApp, isConnected, router]);

  const handleCreateRoom = () => {
    if (!socket || !isConnected) {
      toast.error("Not connected to server");
      return;
    }

    setIsCreating(true);

    socket.emit("create-room");

    socket.once("room-created", (room) => {
      setIsCreating(false);
      toast.success(`Room created: ${room.id}`);
      router.push(`/game/${room.id}`);
    });

    socket.once("error", (error) => {
      setIsCreating(false);
      toast.error(error);
    });
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }

    if (!socket || !isConnected) {
      toast.error("Not connected to server");
      return;
    }

    setIsJoining(true);
    router.push(`/game/${roomId.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            🎮 Tic Tac Toe
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Play with friends in Telegram!
          </p>
        </div>

        {/* User Info */}
        {user && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, <span className="font-medium">{user.first_name}</span>!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Connection Status */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm">
                {isConnected ? "Connected" : "Connecting..."}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Game Actions */}
        <div className="space-y-4">
          {/* Create Room */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create New Game</CardTitle>
              <CardDescription>
                Start a new game and invite friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateRoom}
                disabled={!isConnected || isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? "Creating..." : "Create Room"}
              </Button>
            </CardContent>
          </Card>

          {/* Join Room */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Join Game</CardTitle>
              <CardDescription>
                Enter a room ID to join an existing game
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center font-mono text-lg"
              />
              <Button
                onClick={handleJoinRoom}
                disabled={!isConnected || !roomId.trim() || isJoining}
                className="w-full"
                size="lg"
                variant="outline"
              >
                {isJoining ? "Joining..." : "Join Room"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Game Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎯 Game Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div>• Each player can have maximum 3 pieces on the board</div>
            <div>
              • When you place your 4th piece, your oldest piece disappears
            </div>
            <div>• First to get 3 in a row wins!</div>
            <div>• Share your room ID with friends to play together</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
