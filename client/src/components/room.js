import {useRoom} from "../contexts/RoomContext";
import {Debug} from "./debug";
import {Votes} from "./votes";
import {DealerControls} from "./dealerControls";

export function Room() {
  const {
    room,
    vote, getUserId
  } = useRoom();

  const isDealer = isUserDealer(getUserId());
  const isViewer = !!room?.viewers?.[getUserId()];

  function isUserDealer(userId) {
    return room.dealer === userId;
  }

  return (
    <div className="room">
      {isDealer && (
        <DealerControls/>
      )}

      <div className="room-content">
        <Votes/>
        {!isViewer && (
          <div className="vote-buttons">
            {[1, 2, 3, 5, 8, 13].map((v) => (
              <button key={v} onClick={() => vote(v)} disabled={room.showVotes || !room.currentTicket}>
                {v}
              </button>
            ))}
          </div>
        )}

        <div className="ticket-info">
          {room.currentTicket ? (
            <div className="ticket-card ticket-display">
              <h4>{room.currentTicket.key} - {room.currentTicket.title}</h4>
              <p>{room.currentTicket.description}</p>
            </div>
          ) : (
            <p>No ticket selected</p>
          )}
        </div>

        <Debug/>
      </div>



    </div>
  );
}