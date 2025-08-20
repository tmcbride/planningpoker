import {useRoom} from "../contexts/RoomContext";
import {Debug} from "./debug";
import {Votes} from "./votes";
import {DealerControls} from "./dealerControls";

export function Room() {
  const {
    room
  } = useRoom();

  return (
    <div className="room">
        <DealerControls/>
      <div className="room-content">
        <Votes/>

        <div className="ticket-info">
          {room.currentTicket ? (
            <div className="ticket-card ticket-display">
                <h4><a href={room.currentTicket.link} target="jira">{room.currentTicket.key}</a> - {room.currentTicket.title}</h4>
                <pre className="ticket-display-pre">{room.currentTicket.description}</pre>
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