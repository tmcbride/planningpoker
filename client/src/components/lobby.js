import {useRoom} from "../contexts/RoomContext";
import {Debug} from "./debug";

export function Lobby() {
  const {
    availableRooms, clearRooms, getRoomList, joinRoom, openRoom
  } = useRoom();

  return (
    <div className="lobby">

      <div className="roomList">
          <div className="room-header">
            <h2>Rooms</h2>
            <button className="leave-button" onClick={clearRooms}>Clear Rooms</button>
            <button onClick={getRoomList}>Refresh</button>
          </div>
        <div className="roomRow">

        {availableRooms.length === 0 && <div>No rooms available</div>}
          {availableRooms.map(room => (
            <div className="roomRow" key={room.id}>
              <div className="room-info">
                <strong>{room.id}</strong>
                <span className="player-count">{room.playerCount} players</span>
              </div>
              <div className="room-actions">
                <button onClick={() => openRoom(room.id)}>Open</button>
                <button onClick={() => joinRoom(room.id)}>Join</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Debug/>
    </div>
  )
}