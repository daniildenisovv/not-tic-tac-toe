export type Player = "X" | "O";
export type CellValue = Player | null;

export interface GameMove {
  row: number;
  col: number;
  player: Player;
  timestamp: number;
  moveNumber: number;
}

export interface GameBoard {
  cells: CellValue[][];
  moves: GameMove[];
  currentPlayer: Player;
  winner: Player | null;
  isDraw: boolean;
  isGameOver: boolean;
}

export interface GameRoom {
  id: string;
  players: {
    X?: {
      id: string;
      name: string;
      telegramId?: number;
    };
    O?: {
      id: string;
      name: string;
      telegramId?: number;
    };
  };
  board: GameBoard;
  status: "waiting" | "playing" | "finished";
  createdAt: number;
  lastMove?: number;
}

export interface Player_Info {
  id: string;
  name: string;
  telegramId?: number;
  symbol?: Player;
}

export interface GameState {
  room: GameRoom | null;
  isLoading: boolean;
  error: string | null;
}

export interface SocketEvents {
  // Client to Server
  "create-room": () => void;
  "join-room": (roomId: string) => void;
  "leave-room": (roomId: string) => void;
  "make-move": (data: { roomId: string; row: number; col: number }) => void;
  "restart-game": (roomId: string) => void;

  // Server to Client
  "room-created": (room: GameRoom) => void;
  "room-joined": (room: GameRoom) => void;
  "room-left": () => void;
  "player-joined": (room: GameRoom) => void;
  "player-left": (room: GameRoom) => void;
  "move-made": (room: GameRoom) => void;
  "game-over": (room: GameRoom) => void;
  "game-restarted": (room: GameRoom) => void;
  error: (error: string) => void;
}
