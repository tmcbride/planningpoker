import {useRoom} from "../contexts/RoomContext";
import {Debug} from "./debug";
import {useEffect, useState} from "react";

export function Lobby() {
  const {
    socket, joinRoom, openRoom
  } = useRoom();

  const [availableRooms, setAvailableRooms] = useState([]);

  function getRoomList() {
    fetch("http://localhost:4000/rooms")
      .then(res => res.json())
      .then(data => {
        setAvailableRooms(data);
      })
      .catch(err => console.error("Error fetching rooms:", err));
  }

  useEffect(() => {
    const handleRoomUpdate = (data) => {
      console.log("Recieved: ", data);
      setAvailableRooms(data);
    }
    socket.on("roomsList", handleRoomUpdate);
    return () => socket.off("roomsList", handleRoomUpdate);
  }, [socket]);

  useEffect(() => {
    getRoomList();
  }, []);

  return (
    <div className="lobby">

      <div className="roomList">
        <div className="room-header">
          <h2>Rooms</h2>
        </div>
        <div className="roomRow">
          {availableRooms.length === 0 && <div>No rooms available</div>}
          {availableRooms.map(room => (
            <div className="roomRow roomEntry" key={room.id}>
              <div className="room-info">
                <strong>{room.id}</strong>
                <span className="player-count">{room.playerCount} players</span>
              </div>
              <div className="room-actions">
                Join as:
                <button onClick={() => joinRoom(room.id)}>Voter</button>
                <button onClick={() => openRoom(room.id)}>Viewer</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Debug/>
    </div>
  )
}