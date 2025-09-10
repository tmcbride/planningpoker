import {useRoom} from "../contexts/RoomContext";
import {useEffect, useState} from "react";
import {Dialog} from "./confirm";
import {Tooltip} from 'react-tooltip';

export function NameInput() {
    const {
        name, setName,
        roomId, setRoomId,
        createRoom, nameWarning, setNameWarning
    } = useRoom();

    const [dialogWarning, setDialogWarning] = useState(false);
    const nameRegex = /^\s*\w{1,8}(?:\s+\w{1,8})?\s*$/;

    const handleCreateRoom = () => {
        if (!roomId || !name || nameWarning) {
            setDialogWarning(true);
            return;
        }

        setDialogWarning(false);
        createRoom();
    }

    useEffect(() => {
        let validName = nameRegex.test(name);
        setNameWarning(!validName || validName.length < 1);
    }, [name]);

    function cleanupName(e) {
        return setName(e.target.value.trim().replace(/\s+/g, ' '));
    }

    return (
        <div className="name-input">
            <div data-tooltip-id="name-warning"
                 data-tooltip-html="Enter your first name (required) and last name (optional)<br/>
                                    Each name must be 1–8 characters.<br/>
                                    Separate names with a space."
                 hidden={!nameWarning}
            >
                <div className="name-warning-label">!</div>
                <Tooltip id="name-warning"/>
            </div>
            <input
                id="name"
                placeholder="Your name"
                className={nameWarning ? "invalid-input" : ""}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => cleanupName(e)}
            />
            <input

                placeholder="Sprint Name"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
            />
            <button onClick={handleCreateRoom}>Create Room</button>
            <Dialog
                open={dialogWarning}
                message="Please Enter Valid Name and Sprint Name to create a room"
                onCancel={() => setDialogWarning(false)}
            />
        </div>
    )
}