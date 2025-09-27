const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || (dev ? "localhost" : "0.0.0.0");
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Game state
const rooms = new Map();

// Game logic is implemented directly in this file

function generateRoomId() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? [process.env.FRONTEND_URL || "https://tic-tac-toe.onrender.com"]
          : "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Create room
    socket.on("create-room", () => {
      const roomId = generateRoomId();
      const room = {
        id: roomId,
        players: {
          X: {
            id: socket.id,
            name: "Player X",
          },
        },
        board: {
          cells: Array(3)
            .fill(null)
            .map(() => Array(3).fill(null)),
          moves: [],
          currentPlayer: "X",
          winner: null,
          isDraw: false,
          isGameOver: false,
        },
        status: "waiting",
        createdAt: Date.now(),
      };

      rooms.set(roomId, room);
      socket.join(roomId);

      console.log(`Room created: ${roomId} by player: ${socket.id}`);
      socket.emit("room-created", room);
    });

    // Join room
    socket.on("join-room", (roomId) => {
      const room = rooms.get(roomId);

      if (!room) {
        socket.emit("error", "Room not found");
        return;
      }

      // Check if player is already in the room
      const isPlayerX = room.players.X?.id === socket.id;
      const isPlayerO = room.players.O?.id === socket.id;

      if (isPlayerX || isPlayerO) {
        // Player is already in the room, just emit room-joined
        console.log(`Player already in room: ${roomId}, socket: ${socket.id}`);
        socket.emit("room-joined", room);
        return;
      }

      socket.join(roomId);

      // Assign player symbol
      if (!room.players.X) {
        room.players.X = {
          id: socket.id,
          name: "Player X",
        };
      } else if (!room.players.O) {
        room.players.O = {
          id: socket.id,
          name: "Player O",
        };
        room.status = "playing";
      } else {
        // Room is full
        socket.emit("error", "Room is full");
        return;
      }

      rooms.set(roomId, room);

      console.log(`Player joined room: ${roomId}, socket: ${socket.id}`);
      socket.emit("room-joined", room);
      socket.to(roomId).emit("player-joined", room);
    });

    // Leave room
    socket.on("leave-room", (roomId) => {
      const room = rooms.get(roomId);

      if (!room) return;

      socket.leave(roomId);

      // Remove player from room
      if (room.players.X?.id === socket.id) {
        delete room.players.X;
      } else if (room.players.O?.id === socket.id) {
        delete room.players.O;
      }

      // Update room status
      if (!room.players.X && !room.players.O) {
        rooms.delete(roomId);
        console.log(`Room deleted: ${roomId}`);
      } else {
        room.status = "waiting";
        rooms.set(roomId, room);
        socket.to(roomId).emit("player-left", room);
      }

      socket.emit("room-left");
    });

    // Make move - simplified game logic
    socket.on("make-move", ({ roomId, row, col }) => {
      const room = rooms.get(roomId);

      if (!room) {
        socket.emit("error", "Room not found");
        return;
      }

      if (room.status !== "playing") {
        socket.emit("error", "Game is not in progress");
        return;
      }

      // Determine player symbol
      let playerSymbol = null;
      if (room.players.X?.id === socket.id) {
        playerSymbol = "X";
      } else if (room.players.O?.id === socket.id) {
        playerSymbol = "O";
      }

      if (!playerSymbol) {
        socket.emit("error", "You are not a player in this game");
        return;
      }

      if (room.board.currentPlayer !== playerSymbol) {
        socket.emit("error", "It is not your turn");
        return;
      }

      // Check if cell is empty
      if (room.board.cells[row][col] !== null) {
        socket.emit("error", "Cell is already occupied");
        return;
      }

      // Simple game logic - check if player has 3 pieces already
      const playerMoves = room.board.moves.filter(
        (move) => move.player === playerSymbol
      );

      if (playerMoves.length >= 3) {
        // Remove oldest piece
        const oldestMove = playerMoves[0];
        room.board.cells[oldestMove.row][oldestMove.col] = null;
        // Remove from moves array
        const moveIndex = room.board.moves.findIndex(
          (m) =>
            m.row === oldestMove.row &&
            m.col === oldestMove.col &&
            m.player === oldestMove.player
        );
        if (moveIndex > -1) {
          room.board.moves.splice(moveIndex, 1);
        }
      }

      // Add new move
      const newMove = {
        row,
        col,
        player: playerSymbol,
        timestamp: Date.now(),
        moveNumber: room.board.moves.length + 1,
      };

      room.board.cells[row][col] = playerSymbol;
      room.board.moves.push(newMove);

      // Check for winner
      room.board.winner = checkWinner(room.board.cells);
      room.board.isDraw = !room.board.winner && isBoardFull(room.board.cells);
      room.board.isGameOver = room.board.winner !== null || room.board.isDraw;

      // Switch player if game is not over
      if (!room.board.isGameOver) {
        room.board.currentPlayer = playerSymbol === "X" ? "O" : "X";
      }

      room.lastMove = Date.now();
      rooms.set(roomId, room);

      console.log(
        `Move made in room ${roomId}: ${playerSymbol} at (${row}, ${col})`
      );

      if (room.board.isGameOver) {
        room.status = "finished";
        rooms.set(roomId, room);
        io.to(roomId).emit("game-over", room);
      } else {
        io.to(roomId).emit("move-made", room);
      }
    });

    // Restart game
    socket.on("restart-game", (roomId) => {
      const room = rooms.get(roomId);

      if (!room) {
        socket.emit("error", "Room not found");
        return;
      }

      // Only allow restart if both players are present
      if (!room.players.X || !room.players.O) {
        socket.emit("error", "Both players must be present to restart");
        return;
      }

      room.board = {
        cells: Array(3)
          .fill(null)
          .map(() => Array(3).fill(null)),
        moves: [],
        currentPlayer: "X",
        winner: null,
        isDraw: false,
        isGameOver: false,
      };
      room.status = "playing";

      rooms.set(roomId, room);

      console.log(`Game restarted in room: ${roomId}`);
      io.to(roomId).emit("game-restarted", room);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Find and update rooms where this socket was a player
      for (const [roomId, room] of rooms.entries()) {
        if (
          room.players.X?.id === socket.id ||
          room.players.O?.id === socket.id
        ) {
          // Remove player from room
          if (room.players.X?.id === socket.id) {
            delete room.players.X;
          } else if (room.players.O?.id === socket.id) {
            delete room.players.O;
          }

          // Update room status
          if (!room.players.X && !room.players.O) {
            rooms.delete(roomId);
            console.log(`Room deleted due to disconnect: ${roomId}`);
          } else {
            room.status = "waiting";
            rooms.set(roomId, room);
            socket.to(roomId).emit("player-left", room);
          }
        }
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

// Helper functions
function checkWinner(cells) {
  const size = 3;

  // Check rows
  for (let row = 0; row < size; row++) {
    if (
      cells[row][0] &&
      cells[row][0] === cells[row][1] &&
      cells[row][1] === cells[row][2]
    ) {
      return cells[row][0];
    }
  }

  // Check columns
  for (let col = 0; col < size; col++) {
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

function isBoardFull(cells) {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (cells[row][col] === null) {
        return false;
      }
    }
  }
  return true;
}
