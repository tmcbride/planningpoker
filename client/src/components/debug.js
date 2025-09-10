import {useRoom} from "../contexts/RoomContext";

export function Debug() {
    const {
        room, availableRooms
    } = useRoom();

    return (
        <div className="debug">
            <br/><br/>
            <p>Current Room</p>
            <pre>{JSON.stringify(room, null, 4)}</pre>
            <p>Available Rooms</p>
            <pre>{JSON.stringify(availableRooms, null, 4)}</pre>
        </div>
    )
}