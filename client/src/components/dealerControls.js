import {useRoom} from "../contexts/RoomContext";
import {useState, useEffect} from "react";

export function DealerControls() {
    const {
        setCurrentTicket,
        room,
        isCurrentUserDealer
    } = useRoom();

    const [board, setBoard] = useState(null);
    const [projectVersion, setProjectVersion] = useState("");
    const [boardList, setBoardList] = useState([]);
    const [ticketList, setTicketList] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL;
    const [hideWithStoryPoints, setHideWithStoryPoints] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`${apiUrl}/api/projects`)
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setBoardList(data.values);
            })
            .catch((err) => console.error("Error fetching projects:", err));
    }, []);

    function loadTicketsForBoard() {
        if (!board) return;

        setLoading(true);

        fetch(`${apiUrl}/api/tickets/${board.id}/${projectVersion}`)
            .then(res => res.json())
            .then(data => {
                setTicketList(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching rooms:", err);
                setLoading(false);
            });
    }

    useEffect(() => {
        loadTicketsForBoard();
    }, [board]);

    function isCurrentTicket(ticketKey) {
        return room.currentTicket && room.currentTicket.key === ticketKey;
    }

    if (!isCurrentUserDealer()) {
        return null;
    }

    const filteredTickets = hideWithStoryPoints
        ? ticketList.filter(ticket => !ticket.storyPoints && ticket.storyPoints !== 0)
        : ticketList;

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
            <div className="dealer-controls-buttons">
                <label className="dealer-checkbox-label">
                    <input
                        type="checkbox"
                        checked={hideWithStoryPoints}
                        onChange={e => setHideWithStoryPoints(e.target.checked)}
                    />
                    Hide tickets with story points
                </label>
                <button disabled={!board} onClick={loadTicketsForBoard}>
                    Reload
                </button>
            </div>

            <div className="ticket-list">
                {loading ? (
                    <div className="loading-indicator">
                        <span className="loading-spinner"></span>
                        Loading tickets...
                    </div>
                ) : !filteredTickets || filteredTickets.length === 0 ? (
                    <p>No tickets loaded</p>
                ) : (
                    Array.isArray(filteredTickets) && filteredTickets.map(ticket => (
                        <div key={ticket.key} className="ticket-list-info">
                            <div className={
                                "ticket-card ticket-list-card  " +
                                (isCurrentTicket(ticket.key) ? "selected-ticket" : "")
                            }
                                 onClick={() => setCurrentTicket(ticket)}>
                                <h4>{ticket.key} - {ticket.title}</h4>
                                {ticket.storyPoints ? <h5>Story Points: {ticket.storyPoints}</h5> : ""}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}