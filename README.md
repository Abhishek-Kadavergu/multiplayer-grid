# 🧩 Multiplayer Grid Web App

A **real-time multiplayer web application** built using **React**, **TypeScript**, **Node.js**, **Express**, and **Socket.io**. Multiple players can join, interact with a shared 10×10 grid, and see instant updates from all connected users.

---

## 🚀 Features Implemented

- ✅ **10×10 Shared Grid** — All players see and interact with the same grid in real-time.
- ✅ **Unicode Support** — Each block accepts any Unicode character (letters, emojis, symbols).
- ✅ **Single Submission Rule** — Once a player fills one block, they cannot update again (per session).
- ✅ **Live Player Count** — Displays how many players are currently online.
- ✅ **Real-time Sync** — When one player updates a cell, all other connected players see the change instantly.
- ✅ **Update History** — Tracks all block updates with timestamps and player IDs.
- ✅ **Accurate Connection Tracking** — Manually tracks active socket connections to avoid double-count bugs.

---

## 🧠 How It Works

1. When a player joins, the frontend (React) connects to the backend using **Socket.io**.
2. The server assigns a **unique socket ID** and sends the current grid state.
3. When a player selects a cell and submits a character:
   - Frontend emits `update-cell` with `{ row, col, char }`.
   - Backend validates, updates the grid (in memory), records history, and broadcasts `cell-updated`.
4. All clients listen to `cell-updated` and update their UI instantly.
5. Server enforces the “one submission per session” rule using socket IDs.
6. Active players are tracked in a server-side Set to ensure accurate online counts.

---

## 🧰 Tech Stack

**Frontend:** React, TypeScript, Vite, Socket.io Client  
**Backend:** Node.js, Express, TypeScript, Socket.io  
**Real-time:** WebSockets via Socket.io

---

## ⚙️ Project Structure

```
multiplayer-grid/
├── backend/
│ ├── src/
│ │ └── server.ts
│ ├── package.json
│ ├── tsconfig.json
├── frontend/
│ ├── src/
│ │ ├── App.tsx
│ │ └── components/
│ ├── package.json
│ ├── vite.config.ts
└── README.md

```

## 💻 Setup Instructions

### 1. Clone the repo

git clone https://github.com/yourusername/multiplayer-grid-app.git
cd multiplayer-grid-app

### 2. Backend

cd backend

npm install

npm run dev

Backend default: http://localhost:4000

### 3. Frontend

cd frontend

npm install

npm run dev

Frontend default: http://localhost:5173

🧪 Demo Behavior

Player A adds 🦋 to a cell → Player B instantly sees 🦋 appear.

Online player count updates when users join/leave.

History logs show [HH:MM:SS] cell (r,c) = <char> by <socketId>.

## 💾 Data & Persistence

Current implementation stores grid, history, and submission tracking in server memory (RAM).

On server restart, state resets. For persistence, integrate MongoDB/Postgres and update server logic to read/write cell state.

# 🤖 AI Tools Used

I used ChatGPT (OpenAI) to assist with architecture design, Socket.io workflow explanations, and example code snippets.
All implementation, debugging, and final integration were done by me.

```

```
