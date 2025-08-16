import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:4000"); // Adjust if server is on another host/port

function App() {
  const [room, setRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [ticket, setTicket] = useState("");

  useEffect(() => {
    socket.on("roomsList", setAvailableRooms);
    socket.emit("requestRooms");

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
    socket.emit("createRoom", { roomId, name: name });
  };

  // Auth / Room join
  const clearRooms = () => {
    socket.emit("clearRooms", {});
  };

  const joinRoom = (roomIdToJoin) => {
    if (!roomIdToJoin || !name) return alert("Enter name");

    // Save locally
    localStorage.setItem("username", name);
    localStorage.setItem("roomId", roomIdToJoin);

    socket.emit("joinRoom", { roomId: roomIdToJoin, name: name });
    setRoomId(roomIdToJoin); // <-- store roomId for voting
  };

  const openRoom = async (roomIdToJoin) => {
    if (!roomIdToJoin || !name) return alert("Enter name");

    localStorage.setItem("roomId", roomIdToJoin);
    socket.emit("openRoom", { roomId: roomIdToJoin, name: name});
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom", { roomId });
    setRoom(null);
    setRoomId("");
    localStorage.removeItem("roomId");
  };

  useEffect(() => {
    const savedName = localStorage.getItem("username");
    const savedRoom = localStorage.getItem("roomId");

    if (savedName && savedRoom) {
      setName(savedName);
      setRoomId(savedRoom);
      socket.emit("joinRoom", { roomId: savedRoom, name: savedName });
    }
  }, []);

  // Dealer actions
  const setCurrentTicket = () => {
    if (!ticket) return alert("Enter a ticket");
    socket.emit("setTicket", { roomId, ticket });
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

        <br/><br/>

        <input
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <div>
          <button onClick={createRoom}>Create Room</button>
          <button onClick={clearRooms}>Clear Rooms</button>
        </div>

        <ul>
          {availableRooms.length === 0 && <li>No rooms available</li>}
          {availableRooms.map(room => (
            <li key={room.id}>
              {room.id} ({room.playerCount} players)
              <button onClick={() => openRoom(room.id)}>Open</button>
              <button onClick={() => joinRoom(room.id)}>Join</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const isViewer = !!room?.viewers?.[socket.id];

  return (
    <div className="app">
      <h2>Room: {roomId}</h2>
      <h4>Viewers:</h4>
      <ul>
        {room && room.viewers && Object.values(room.viewers)
          .map((user, idx) => (
            <li key={idx}>{user.name}</li>
          ))}
      </ul>
      <h3>Current Ticket: {room.currentTicket || "None"}</h3>

      {isViewer && (
        <div className="dealer-controls">
          <input
            placeholder="Ticket"
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
          />
          <button onClick={setCurrentTicket}>Set Ticket</button>
          <button onClick={resetVotes}>Reset Votes</button>
          <button onClick={leaveRoom}>Leave Room</button>
        </div>
      )}

      {!isViewer && (
        <div className="vote-buttons">
          {[1, 2, 3, 5, 8, 13].map((v) => (
            <button key={v} onClick={() => vote(v)}>
              {v}
            </button>
          ))}
          <div>
            <button onClick={leaveRoom}>Leave Room</button>
          </div>
        </div>
      )}

      <h3>Players’ Hands</h3>
      <div className="cards">
        {room && room.voters && Object.entries(room.voters)
          .map(([id, voter]) => {
            const voteValue = room.votes[id];
            const show = room.showVotes || id === socket.id;
            return (
              <div key={id} className="card">
                <div className="card-name">{voter.name}</div>
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