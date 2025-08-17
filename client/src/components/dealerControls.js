import {useRoom} from "../contexts/RoomContext";
import {useState} from "react";

export function DealerControls() {
  const {
    setCurrentTicket,
    resetVotes,
    room
  } = useRoom();

  const [project, setProject] = useState("");
  const [ticketList, setTicketList] = useState([]);

  function getTicketList() {
    fetch(`http://localhost:4000/tickets/${project}`)
      .then(res => res.json())
      .then(data => {
        setTicketList(data);
      })
      .catch(err => console.error("Error fetching rooms:", err));
  }

  function isCurrentTicket(ticketKey) {
    return room.currentTicket && room.currentTicket.key === ticketKey;
  }

  return (
    <div className="dealer-controls">
      <select
        value={project}
        placeholder="Project"
        onChange={(e) => setProject(e.target.value)}
      >
        <option value=""></option>
        <option value="PROJECT_ALPHA">Project Alpha</option>
        <option value="PROJECT_BETA">Project Beta</option>
      </select>
      <div className="dealer-controls-buttons">
        <button onClick={getTicketList}>Search Tickets</button>
        <button onClick={resetVotes}>Reset Votes</button>
      </div>
      <div className="ticket-list">
        {ticketList.length === 0 ? (
          <p>No tickets loaded</p>
        ) : (
          ticketList.map(ticket => (
            <div key={ticket.key} className={
              "ticket-card ticket-list-card  " +
              (isCurrentTicket(ticket.key) ? "selected-ticket" : "")
            }
                 onClick={() => setCurrentTicket(ticket)}>
              <h4>{ticket.key} - {ticket.title}</h4>
              <p>{ticket.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}