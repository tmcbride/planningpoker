import {useRoom} from "../contexts/RoomContext";

export function NameInput() {
  const {
    name, setName,
    roomId, setRoomId,
    createRoom,
  } = useRoom();

  return (
    <div className="name-input">
      <input
        id="name"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

        <input

          placeholder="Sprint Name"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={createRoom}>Create Room</button>
    </div>

  )
}