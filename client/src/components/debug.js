import {useRoom} from "../contexts/RoomContext";

export function Debug() {
   const {
     room, availableRooms
   } = useRoom();

  return (
    <div>
      <h2>Current Room</h2>
      <pre>{JSON.stringify(room, null, 4)}</pre>
      <h2>Available Rooms</h2>
      <pre>{JSON.stringify(availableRooms, null, 4)}</pre>
    </div>
  )
 }