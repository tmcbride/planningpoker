import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css"; // We'll add a bit of styling here

const socket = io("http://localhost:4000"); // Adjust if server is on another host/port

function App() {
  const [room, setRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [ticket, setTicket] = useState("");

  useEffect(() => {
    socket.on("roomsList", setAvailableRooms);
    return () => socket.off("roomsList");
  }, []);

  useEffect(() => {
    socket.on("roomUpdate", (data) => setRoom(data)); // sets full room object
    return () => socket.off("roomUpdate");
  }, []);

  useEffect(() => {
    const logEvent = (event, ...args) => console.log("Socket event received:", event, args);
    socket.onAny(logEvent);

    return () => socket.offAny(logEvent);
  }, []);

  // Auth / Room join
  const createRoom = () => {
    if (!roomId || !name) return alert("Enter name & room ID");
    socket.emit("createRoom", { roomId, dealer: name });
  };

  const joinRoom = (roomIdToJoin) => {
    if (!roomIdToJoin || !name) return alert("Enter name");

    socket.emit("joinRoom", { roomId: roomIdToJoin, name });
    setRoomId(roomIdToJoin); // <-- store roomId for voting
  };

  // Dealer actions
  const setCurrentTicket = () => {
    if (!ticket) return alert("Enter a ticket");
    socket.emit("setTicket", { roomId, ticket });
  };

  const revealVotes = () => {
    socket.emit("revealVotes", { roomId });
  };

  const resetVotes = () => {
    socket.emit("resetVotes", { roomId });
  };

  // Player actions
  const vote = (value) => {
    socket.emit("vote", { roomId, vote: value });
  };

  if (!room) {
    return (
      <div className="login">
        <h1>Planning Poker</h1>
        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <div>
          <button onClick={createRoom}>Create Room</button>
        </div>

        <ul>
          {availableRooms.length === 0 && <li>No rooms available</li>}
          {availableRooms.map(room => (
            <li key={room.id}>
              {room.id} ({room.playerCount} players)
              <button onClick={() => joinRoom(room.id)}>Join</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const currentUserRole = room.users[socket.id]?.role;

  let isDealer = currentUserRole === "dealer";
  return (
    <div className="app">
      <h2>Room: {roomId}</h2>
      <p>Dealer: {room.dealer}</p>
      <h3>Current Ticket: {room.currentTicket || "None"}</h3>

      {isDealer && (
        <div className="dealer-controls">
          <input
            placeholder="Ticket"
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
          />
          <button onClick={setCurrentTicket}>Set Ticket</button>
          <button onClick={revealVotes}>Reveal Votes</button>
          <button onClick={resetVotes}>Reset Votes</button>
        </div>
      )}

      {!isDealer && (
        <div className="vote-buttons">
          {[1, 2, 3, 5, 8, 13].map((v) => (
            <button key={v} onClick={() => vote(v)}>
              {v}
            </button>
          ))}
        </div>
      )}

      <h3>Players’ Hands</h3>
      <div className="cards">
        {Object.entries(room.users)
          .filter(([_, user]) => user.role !== "dealer")
          .map(([id, user]) => {
            const voteValue = room.votes[id];
            const show = room.showVotes || id === socket.id;
            return (
              <div key={id} className="card">
                <div className="card-name">{user.name}</div>
                <div className="card-value">
                  {show
                    ? voteValue ?? "—"
                    : voteValue !== undefined
                      ? "✅"
                      : "—"}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default App;