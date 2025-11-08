import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Grid from "./components/Grid";

type Cell = { char: string | null; updatedBy?: string };

const SERVER = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";
// const SERVER = "https://multiplayer-grid-backend.vercel.app/";

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [youId, setYouId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [youSubmitted, setYouSubmitted] = useState(false);

  useEffect(() => {
    const s = io(SERVER);
    setSocket(s);

    s.on("connect", () => {
      console.log("connected", s.id);
    });

    s.on(
      "init-state",
      (payload: { grid: Cell[][]; history: any[]; youId: string }) => {
        setGrid(payload.grid);
        setHistory(payload.history || []);
        setYouId(payload.youId);
      }
    );

    s.on("cell-updated", (ev: any) => {
      // apply update
      setGrid((prev) => {
        if (!prev || prev.length === 0) return prev;
        const copy = prev.map((row) => row.map((c) => ({ ...c })));
        copy[ev.row][ev.col] = { char: ev.char, updatedBy: ev.by };
        return copy;
      });
      // Add to history array
      setHistory((prev) => [...prev, ev]);
      // If the update is from you, mark submitted
      if (ev.by === s.id) setYouSubmitted(true);
    });

    s.on("online-count", (payload: { count: number }) => {
      setOnlineCount(payload.count);
    });

    s.on("history", (h: any[]) => {
      setHistory(h);
    });

    s.on("error-msg", (e: { message: string }) => {
      setErrorMsg(e.message);
      setTimeout(() => setErrorMsg(null), 3000);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <div className="container">
      <div className="header">
        <h2>Multiplayer 10×10 Grid</h2>
        <div>
          <div>
            Players online: <strong>{onlineCount}</strong>
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>Your id: {youId}</div>
        </div>
      </div>

      <Grid
        grid={grid}
        onCellClick={(r, c) => {
          if (!socket) return;
          if (youSubmitted) {
            setErrorMsg("You already submitted and cannot edit again.");
            setTimeout(() => setErrorMsg(null), 2500);
            return;
          }
          const char = prompt("Enter a single character (unicode allowed):");
          if (char === null) return;
          const trimmed = char.trim();
          if (trimmed.length === 0) {
            alert("Empty input not allowed");
            return;
          }
          const use = trimmed[0];
          socket.emit("update-cell", { row: r, col: c, char: use });
        }}
      />

      <div className="controls">
        <button onClick={() => socket?.emit("request-history")}>
          Load History
        </button>
        <div style={{ marginLeft: "auto", color: "#333" }}>
          {youSubmitted ? (
            <strong>You've submitted</strong>
          ) : (
            <em>You haven't submitted yet</em>
          )}
        </div>
      </div>

      {errorMsg && (
        <div style={{ color: "red", marginTop: 10 }}>{errorMsg}</div>
      )}

      <div className="history">
        <h4>History ({history.length})</h4>
        <ul>
          {history.map((h, idx) => (
            <li key={idx}>
              [{new Date(h.timestamp).toLocaleTimeString()}] cell ({h.row},
              {h.col}) = {h.char} by {h.by}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
