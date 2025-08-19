import {useRoom} from "../contexts/RoomContext";
import {useState, useEffect} from "react";

export function DealerControls() {
    const {
        setCurrentTicket,
        resetVotes,
        room,
        isCurrentUserDealer
    } = useRoom();

    const [board, setBoard] = useState(null);
    const [projectVersion, setProjectVersion] = useState("");
    const [projectVersionList, setProjectVersionList] = useState([]);
    const [boardList, setBoardList] = useState([]);
    const [ticketList, setTicketList] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL;

    // Fetch projects from the server when component mounts
    useEffect(() => {
        fetch(`${apiUrl}/api/projects`)
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setBoardList(data.values);
            })
            .catch((err) => console.error("Error fetching projects:", err));
    }, []);

    useEffect(() => {
        console.log("Trying to call ", board?.id);
        if (!board || !board.id) return;
        console.log("Tringgering call to ", board);
        fetch(`${apiUrl}/api/projectList/${board.id}`)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setProjectVersionList(data);
            })
            .catch(err => console.error("Error fetching rooms:", err));
    }, [board]);

    function getTicketList() {
        console.log("Getting tickets list board", board?.id, " Project", projectVersion);

        fetch(`${apiUrl}/api/tickets/${board.id}/${projectVersion}`)
            .then(res => res.json())
            .then(data => {
                console.log("Tickets", data);
                setTicketList(data.issues);
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
                value={board?.id || ""}
                onChange={e => {
                    const selectedBoard = boardList.find(b => String(b.id) === e.target.value);
                    setBoard(selectedBoard);
                }}
            >
                <option value="">Select a Board</option>
                {boardList.map((board) => (
                    <option key={board.id} value={board.id}>
                        {board.name}
                    </option>
                ))}
            </select>
            {/*<select*/}
            {/*    value={projectVersion}*/}
            {/*    onChange={e => setProjectVersion(e.target.value)}*/}
            {/*>*/}
            {/*    <option value="">Select a Project Version</option>*/}
            {/*    {Array.isArray(projectVersionList) && projectVersionList.map((project) => (*/}
            {/*        <option key={project.id} value={project.name}>*/}
            {/*            {project.name}*/}
            {/*        </option>*/}
            {/*    ))}*/}
            {/*</select>*/}
            <div className="dealer-controls-buttons">
                <button onClick={getTicketList}>Search Tickets</button>
                <button onClick={resetVotes}>Reset Votes</button>
            </div>
            <div className="ticket-list">
                {ticketList.length === 0 ? (
                    <p>No tickets loaded</p>
                ) : (
                    Array.isArray(ticketList) && ticketList.map(ticket => (
                        <div key={ticket.key} className="ticket-list-info">
                            <div className={
                                "ticket-card ticket-list-card  " +
                                (isCurrentTicket(ticket.key) ? "selected-ticket" : "")
                            }
                                 onClick={() => setCurrentTicket(ticket)}>
                                <h4>{ticket.key} - {ticket.fields.summary}</h4>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}