import {useRoom} from "../contexts/RoomContext";
import {Debug} from "./debug";

export function Lobby() {
  const {
    availableRooms,
    roomId, setRoomId,
    createRoom, clearRooms, getRoomList, joinRoom, openRoom
  } = useRoom();

  return (
    <div className="lobby">
      <div>
        <input
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={createRoom}>Create Room</button>
        <button onClick={clearRooms}>Clear Rooms</button>
      </div>

      <div className="roomList">
        <strong>Rooms</strong>
        <button onClick={getRoomList} style={{ marginLeft: "1rem"}}>Refresh</button>
        <div>
          {availableRooms.length === 0 && <li>No rooms available</li>}
          {availableRooms.map(room => (
            <div className="roomRow">
              <button onClick={() => openRoom(room.id)}>Open</button>
              <button onClick={() => joinRoom(room.id)}>Join</button>

              -

              {room.id} ({room.playerCount} players)
            </div>
          ))}
        </div>
      </div>

      <Debug/>
    </div>
  )
}