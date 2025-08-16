import { io } from "socket.io-client";
import "./App.css";
import { useRoom } from "./RoomContext";

function App() {
  const {
    room, availableRooms, name, setName,
    roomId, setRoomId, ticket, setTicket,
    createRoom, clearRooms, getRoomList, joinRoom, openRoom,
    leaveRoomVoter, leaveRoomViewer, setCurrentTicket,
    resetVotes, vote, socket
  } = useRoom();

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
          <button onClick={getRoomList}>Refresh Rooms</button>
          {availableRooms.length === 0 && <li>No rooms available</li>}
          {availableRooms.map(room => (
            <li key={room.id}>
              {room.id} ({room.playerCount} players)
              <button onClick={() => openRoom(room.id)}>Open</button>
              <button onClick={() => joinRoom(room.id)}>Join</button>
            </li>
          ))}
        </ul>
        <div>
          <h2>Current Room</h2>
          <pre>{JSON.stringify(room, null, 4)}</pre>
          <h2>Available Rooms</h2>
          <pre>{JSON.stringify(availableRooms, null, 4)}</pre>
        </div>
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
          <button onClick={leaveRoomViewer}>Leave Room</button>
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
            <button onClick={leaveRoomVoter}>Leave Room</button>
          </div>
        </div>
      )}

      <h3>Players’ Hands</h3>
      <div className="cards">
        {room && room.voters && Object.entries(room.voters)
          .map(([id, voter]) => {
            if (!room) return;
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

      <div>
        <h2>Current Room</h2>
        <pre>{JSON.stringify(room, null, 4)}</pre>
        <h2>Available Rooms</h2>
        <pre>{JSON.stringify(availableRooms, null, 4)}</pre>
      </div>
    </div>
  );
}

export default App;