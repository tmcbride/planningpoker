import {useRoom} from "../contexts/RoomContext";
import {Debug} from "./debug";
import {Votes} from "./votes";

export function Room() {
  const {
    room,
    roomId, ticket, setTicket, ticketDetails, setTicketDetails,
    leaveRoomVoter, leaveRoomViewer, setCurrentTicket,
    resetVotes, vote, getUserId
  } = useRoom();

  const isViewer = !!room?.viewers?.[getUserId()];

  return (
    <div className="app">
      <div className="room-header">
        <h2>{roomId}</h2>
        <button className="leave-button" onClick={isViewer ? leaveRoomViewer : leaveRoomVoter}>Leave Room</button>
      </div>

      <Votes/>
      {!isViewer && (

        <div className="vote-buttons">
          {[1, 2, 3, 5, 8, 13].map((v) => (
            <button key={v} onClick={() => vote(v)}>
              {v}
            </button>
          ))}
        </div>

      )}

      {isViewer && (
        <div className="dealer-controls">
          <input
            placeholder="Ticket Title"
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
          />
          <input
            placeholder="Ticket Description"
            value={ticketDetails}
            onChange={(e) => setTicketDetails(e.target.value)}
          />
          <button onClick={setCurrentTicket}>Set Ticket</button>
          <button onClick={resetVotes}>Reset Votes</button>
        </div>
      )}

      <div className="ticket-info">
        {room.currentTicket ? (
          <div className="ticket-card">
            <h4>{room.currentTicket.title}</h4>
            <p>{room.currentTicket.details}</p>
          </div>
        ) : (
          <p>No ticket selected</p>
        )}
      </div>

      <div>
        <p>Peanut Gallery</p>
        <ul className="viewers">
          {room && room.viewers && Object.values(room.viewers)
            .map((user, idx) => (
              <li key={idx}>
                <div className="viewer">
                  <span className="viewer-icon">👤</span>
                  <div>
                    {user.name}
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>

      <Debug/>
    </div>
  );
}