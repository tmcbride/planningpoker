import { useRoom } from "../contexts/RoomContext";
import {Debug} from "./debug";
import {Votes} from "./votes";

export function Room() {
  const {
    room,
    roomId, ticket, setTicket,
    leaveRoomVoter, leaveRoomViewer, setCurrentTicket,
    resetVotes, vote, getUserId
  } = useRoom();

  const isViewer = !!room?.viewers?.[getUserId()];

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

      <Votes/>
      <Debug/>
    </div>
  );
}