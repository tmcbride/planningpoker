import { useRoom } from "../contexts/RoomContext";
import {Debug} from "./debug";

export function Lobby() {
  const {
    availableRooms, name, setName,
    roomId, setRoomId,
    createRoom, clearRooms, getRoomList, joinRoom, openRoom
  } = useRoom();

  return (
    <div className="login">
      <input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br/><br/>

      <input
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <div>
        <button onClick={createRoom}>Create Room</button>
        <button onClick={clearRooms}>Clear Rooms</button>
      </div>

      <button onClick={getRoomList}>Refresh Rooms</button>
      <ul>
        {availableRooms.length === 0 && <li>No rooms available</li>}
        {availableRooms.map(room => (
          <li key={room.id}>
            {room.id} ({room.playerCount} players)
            <button onClick={() => openRoom(room.id)}>Open</button>
            <button onClick={() => joinRoom(room.id)}>Join</button>
          </li>
        ))}
      </ul>

      <Debug/>
    </div>
  )
}