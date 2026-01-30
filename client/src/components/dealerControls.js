import {useRoom} from "../contexts/RoomContext";
import {useEffect, useState} from "react";
import {Tooltip} from "react-tooltip";

export function DealerControls() {
    const {
        setCurrentTicket,
        room,
        isCurrentUserDealer
    } = useRoom();

    const [board, setBoard] = useState(null);
    const [boardList, setBoardList] = useState([]);
    const [ticketList, setTicketList] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL ?? "/poker";
    const [hideWithStoryPoints, setHideWithStoryPoints] = useState(true);
    const [loading, setLoading] = useState(false);
    const [totalPoints, setTotalPoints] = useState(-1);
    const [ticketCount, setTicketCount] = useState(0);
    const [targetPoints, setTargetPoints] = useState(null);
    const [draftTargetPoints, setDraftTargetPoints] = useState("");

    useEffect(() => {
        fetch(`${apiUrl}/api/projects`)
            .then((res) => res.json())
            .then((data) => {
                setBoardList(data.values);
            })
            .catch((err) => console.error("Error fetching projects:", err));
    }, []);

    function loadTicketsForBoard() {
        if (!board) return;

        setLoading(true);
        getCurrentStoryPoints();

        fetch(`${apiUrl}/api/tickets/${board.id}`)
            .then(res => res.json())
            .then(data => {
                setTicketList(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching tickets:", err);
                setLoading(false);
            });
    }

    function getCurrentStoryPoints() {
        if (!board) {
            setTotalPoints(-1);
            setTicketCount(0);
            return;
        }

        fetch(`${apiUrl}/api/storyPoints/${board.id}`)
            .then(res => res.json())
            .then(data => {
                setTotalPoints(data.totalStoryPoints);
                setTicketCount(data.ticketCount);
            })
            .catch(err => {
                console.error("Error getting story points:", err);
                setTotalPoints(-1);
                setTicketCount(0);
            });
    }

    useEffect(() => {
        let intervalId;

        if (board) {
            getCurrentStoryPoints();
            intervalId = setInterval(() => {
                getCurrentStoryPoints();
            }, 10000);
        } else {
            setTotalPoints(-1);
            setTicketCount(0);
            if (intervalId) {
                clearInterval(intervalId);
            }
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [board]);

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

            {ticketCount > 0 && (
                <label className="sprint-metrics">
                    <span className="sprint-title">Active Sprint</span>
                    <span className="sprint-metric">
                            Tickets: <strong>{ticketCount}</strong>
                        </span>
                    <span className="sprint-metric">
                            Points: <strong>{totalPoints}</strong>
                        </span>
                    <div data-tooltip-id="sprint-target" className="sprint-target-container"
                         data-tooltip-html={totalPoints >= targetPoints ? totalPoints - targetPoints + " Over Target" : targetPoints - totalPoints + " Until Target Points"}
                    >
                        <div className="sprint-target-label">
                            {!targetPoints ? (<div></div>) :
                                totalPoints >= targetPoints ? (
                                    <div>&#x2713;</div>
                                ) : (
                                    <div>&#43;</div>
                                )}
                        </div>

                        <Tooltip id="sprint-target"/>
                        <input
                            data-tooltip-id="sprint-target"
                            id="targetPoints"
                            placeholder="Target"
                            value={draftTargetPoints}
                            onChange={(e) => setDraftTargetPoints(e.target.value)}
                            onBlur={(e) => setTargetPoints(e.target.value)}
                        />
                    </div>

                </label>
            )}

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