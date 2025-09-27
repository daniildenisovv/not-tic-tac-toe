"use client";

import { GameRoom } from "@/components/game/game-room";
import { use } from "react";

interface GamePageProps {
  params: Promise<{ roomId: string }>;
}

export default function GamePage({ params }: GamePageProps) {
  const { roomId } = use(params);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
      <GameRoom roomId={roomId} />
    </div>
  );
}
