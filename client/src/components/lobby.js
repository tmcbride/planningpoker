import {useRoom} from "../contexts/RoomContext";
import {Debug} from "./debug";
import {useEffect, useState} from "react";

export function Lobby() {
  const {
    socket, joinRoom, openRoom, currentUserId
  } = useRoom();

  const [availableRooms, setAvailableRooms] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const handleRoomUpdate = (data) => {
      console.log("Recieved: ", data);
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
    console.log("Comparing ", room, " and ", currentUserId);
    return room.dealerId && room.dealerId === currentUserId;
  }

  return (
    <div className="lobby">

      <div className="roomList">
        <div className="room-header">
          <h2>Rooms</h2>
        </div>
        <div>
          {availableRooms.length === 0 && <div>No rooms available</div>}
          {availableRooms.map(room => (
            <div className="roomRow roomEntry" key={room.id}>
              <div className="room-info">
                <strong>{room.id}</strong>
                <span className="player-count">{room.playerCount} players</span>
              </div>
              <div className="room-actions">
                {isRoomDealer(room) && (
                  <button onClick={() => openRoom(room.id)}>Open</button>
                )}

                {!isRoomDealer(room) && (
                  <div>
                    Join as:
                    <button onClick={() => joinRoom(room.id)}>Voter</button>
                    <button onClick={() => openRoom(room.id)}>Viewer</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Debug/>
    </div>
  )
}