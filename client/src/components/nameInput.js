import {useRoom} from "../contexts/RoomContext";
import {useState} from "react";
import {Dialog} from "./confirm";

export function NameInput() {
    const {
        name, setName,
        roomId, setRoomId,
        createRoom,
    } = useRoom();

    const [dialogWarning, setDialogWarning] = useState(false);

    const handleCreateRoom = () =>{
        if (!roomId || !name) {
            setDialogWarning(true);
            return;
        }

        setDialogWarning(false);
        createRoom();
    }

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
            <button onClick={handleCreateRoom}>Create Room</button>
            <Dialog
                open={dialogWarning}
                message="Please Enter Name and Sprint Name to create a room"
                onCancel={() => setDialogWarning(false)}
            />
        </div>
    )
}