import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

type Cell = { char: string | null; updatedBy?: string; timestamp?: number };

type UpdateEvent = {
  row: number;
  col: number;
  char: string;
  by: string;
  timestamp: number;
};

type UpdatePayload = {
  row: number;
  col: number;
  char: string;
};

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your frontend URL in production for safety
    methods: ["GET", "POST"],
  },
});

const ROWS = 10;
const COLS = 10;

// Initialize grid
let grid: Cell[][] = Array.from({ length: ROWS }, () =>
  Array.from({ length: COLS }, () => ({ char: null }))
);

// History of updates
let history: UpdateEvent[] = [];

// Track which sockets (players) have submitted
const submitted: Set<string> = new Set();

// Track active players
const activePlayers: Set<string> = new Set();

function getGridState() {
  return grid.map((row) =>
    row.map((cell) => ({ char: cell.char, updatedBy: cell.updatedBy }))
  );
}

// REST endpoint: get history
app.get("/history", (req: Request, res: Response) => {
  res.json(history);
});

// Socket.io handlers
io.on("connection", (socket: Socket) => {
  console.log("connect:", socket.id);
  activePlayers.add(socket.id);

  // Send current state to the new player
  socket.emit("init-state", {
    grid: getGridState(),
    history,
    youId: socket.id,
  });

  // Broadcast updated player count
  io.emit("online-count", { count: activePlayers.size });

  socket.on("update-cell", (payload: UpdatePayload) => {
    const { row, col, char } = payload;

    // Validation checks
    if (submitted.has(socket.id)) {
      socket.emit("error-msg", { message: "You already submitted!" });
      return;
    }

    if (grid[row][col].char !== null) {
      socket.emit("error-msg", { message: "Cell already filled!" });
      return;
    }

    const ts = Date.now();
    grid[row][col] = { char, updatedBy: socket.id, timestamp: ts };
    history.push({ row, col, char, by: socket.id, timestamp: ts });
    submitted.add(socket.id);

    io.emit("cell-updated", { row, col, char, by: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("disconnect:", socket.id);
    activePlayers.delete(socket.id);
    io.emit("online-count", { count: activePlayers.size });
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
