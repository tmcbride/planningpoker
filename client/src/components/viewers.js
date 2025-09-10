import {useRoom} from "../contexts/RoomContext";

export function Viewers() {
    const {
        room
    } = useRoom();

    if (!room) {
        return null;
    }

    if (!room || !room.viewers) {
        return null;
    }

    return (
        <div>
            {Object.entries(room.viewers).length > 0 && (
                <div className="viewer-container">
                    <ul className="viewers">
                        {Object.entries(room.viewers)
                            .map(([id, user]) => (
                                <li key={id}>
                                    <div className="viewer">
                                        <span className="viewer-icon">"👤"</span>
                                        <div>
                                            {user.name}
                                        </div>
                                    </div>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </div>
    )
}