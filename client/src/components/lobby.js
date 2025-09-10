import {useRoom} from "../contexts/RoomContext";
import {Debug} from "./debug";
import {useEffect, useState} from "react";
import {Dialog} from "./confirm";

export function Lobby() {
    const {
        socket, joinRoom, openRoom, currentUserId, name, nameWarning
    } = useRoom();

    const [availableRooms, setAvailableRooms] = useState([]);
    const [dialogWarning, setDialogWarning] = useState(false);

    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const handleRoomUpdate = (data) => {
            setAvailableRooms(data);
        }
        socket.on("roomsList", handleRoomUpdate);
        return () => socket.off("roomsList", handleRoomUpdate);
    }, [socket]);

    useEffect(() => {
        fetch(`${apiUrl}/api/rooms`)
            .then(res => res.json())
            .then(data => {
                setAvailableRooms(data);
            })
            .catch(err => console.error("Error fetching rooms:", err));
    }, [apiUrl]);

    function isRoomDealer(room) {
        return room.dealerId && room.dealerId === currentUserId;
    }

    function handleJoin(roomId, viewer) {
        if (!name || nameWarning) {
            setDialogWarning(true);
            return;
        } else {
            setDialogWarning(false);
        }

        if (viewer) {
            openRoom(roomId);
        } else {
            joinRoom(roomId);
        }
    }

    return (
        <div className="room-lobby">

            <div className="room-list">
                <div className="room-header">
                    <h2>Rooms</h2>
                </div>
                <div>
                    {availableRooms.length === 0 && <div>No rooms available</div>}
                    {availableRooms.map(room => (
                        <div className="room-row room-entry" key={room.id}>
                            <div className="room-info">
                                <strong>{room.id}</strong>
                                <span className="player-count">{room.playerCount} players</span>
                            </div>
                            <div className="room-actions">
                                {isRoomDealer(room) && (
                                    <button onClick={() => handleJoin(room.id, true)}>Open</button>
                                )}

                                {!isRoomDealer(room) && (
                                    <div>
                                        Join as:
                                        <button onClick={() => handleJoin(room.id, false)}>Voter</button>
                                        <button onClick={() => handleJoin(room.id, true)}>Viewer</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Dialog
                open={dialogWarning}
                message="Please enter a valid name to join a room"
                onCancel={() => setDialogWarning(false)}
            />
            <Debug/>
        </div>
    )
}