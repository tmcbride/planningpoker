import {useRoom} from "../contexts/RoomContext";
import {Debug} from "./debug";
import {Votes} from "./votes";
import {DealerControls} from "./dealerControls";

export function Room() {
  const {
    room
  } = useRoom();

    function formatDescription() {
      return room.currentTicket.description
          .replace(/<a[^>]*>/gi, "") // Remove links, including emails
          .replace(
          /<img[^>]*src=["']([^"']+)["'][^>]*>/gi,
          (match, src) => {
            const imageName = src.split('/').pop();
            return `View Image: <a href="${src}" target="jiraImage">${imageName}</a>`;
          });
    }

    return (
    <div className="room">
        <DealerControls/>
      <div className="room-content">
        <Votes/>

        <div className="ticket-info">
          {room.currentTicket ? (
            <div className="ticket-card ticket-display">
                <h4><a href={room.currentTicket.link} target="jira">{room.currentTicket.key}</a> - {room.currentTicket.title}</h4>
                <div className="ticket-display-pre" dangerouslySetInnerHTML={{ __html: formatDescription() }} />
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