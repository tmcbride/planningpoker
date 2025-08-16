import {useRoom} from "../contexts/RoomContext";

export function NameInput() {
  const {
    name, setName
  } = useRoom();

  return (
    <div>
      <input
        id="name"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>

  )
}