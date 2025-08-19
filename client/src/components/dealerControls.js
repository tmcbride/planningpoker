import {useRoom} from "../contexts/RoomContext";
import {useState, useEffect} from "react";

export function DealerControls() {
  const {
    setCurrentTicket,
    resetVotes,
    room,
    isCurrentUserDealer
  } = useRoom();

  const [project, setProject] = useState("");
  const [projectList, setProjectList] = useState([]);
  const [ticketList, setTicketList] = useState([]);

  // Fetch projects from the server when component mounts
  useEffect(() => {
    fetch("http://localhost:4000/api/projects")
      .then((res) => res.json())
      .then((data) => setProjectList(data))
      .catch((err) => console.error("Error fetching projects:", err));
  }, []);

  function getTicketList() {
    fetch(`http://localhost:4000/api/tickets/${project}`)
      .then(res => res.json())
      .then(data => {
        setTicketList(data);
      })
      .catch(err => console.error("Error fetching rooms:", err));
  }

  function isCurrentTicket(ticketKey) {
    return room.currentTicket && room.currentTicket.key === ticketKey;
  }

  if (!isCurrentUserDealer()) {
    return null;
  }

  return (
    <div className="dealer-controls">
      <select
        value={project}
        placeholder="Project"
        onChange={(e) => setProject(e.target.value)}
      >
        <option value="">Select a project</option>
        {projectList.map((proj) => (
          <option key={proj} value={proj}>
            {proj}
          </option>
        ))}
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
            <div key={ticket.key} className="ticket-list-info">
              <div className={
                "ticket-card ticket-list-card  " +
                (isCurrentTicket(ticket.key) ? "selected-ticket" : "")
              }
                   onClick={() => setCurrentTicket(ticket)}>
                <h4>{ticket.key} - {ticket.title}</h4>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}