import {useRoom} from "../contexts/RoomContext";
import {Debug} from "./debug";
import {Votes} from "./votes";
import {DealerControls} from "./dealerControls";

export function Room() {
  const {
    room, isCurrentUserDealer
  } = useRoom();

  return (
    <div className="room">
        <DealerControls/>
      <div className="room-content">
        <Votes/>

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