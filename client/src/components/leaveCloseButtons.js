import {useRoom} from "../contexts/RoomContext";
import {Dialog} from "./confirm";
import {useState} from "react";

export function LeaveCloseButtons() {
    const {
        room,
        closeRoom,
        leaveRoomVoter, leaveRoomViewer,
        isCurrentUserDealer,
        isCurrentUserViewer
    } = useRoom();

    const [modalOpen, setModalOpen] = useState(false);

    if (!room) {
        return null;
    }

    const isDealer = isCurrentUserDealer();

    return (
        <div className="app-button">
            {!isDealer && (
                <button className="app-leave-button"
                        onClick={isCurrentUserViewer() ? leaveRoomViewer : leaveRoomVoter}>Leave Room</button>
            )}

            {isDealer && (
                <div>
                    <button className="app-leave-button" onClick={() => setModalOpen(true)}>Close Room</button>

                    <Dialog
                        open={modalOpen}
                        message="Are you sure you want to close this modal for everyone?"
                        onConfirm={() => {
                            closeRoom();
                            setModalOpen(false); /* your action */
                        }}
                        onCancel={() => setModalOpen(false)}
                    />
                </div>
            )}
        </div>

    )
}