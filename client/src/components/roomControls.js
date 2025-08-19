import {useRoom} from "../contexts/RoomContext";

export function RoomControls() {
  const {
    room,
    closeRoom,
    leaveRoomVoter, leaveRoomViewer,
    isCurrentUserDealer,
    isCurrentUserViewer
  } = useRoom();

  if (!room) {
    return null;
  }

  const isDealer = isCurrentUserDealer();

  return (
    <div className="header-controls">
        {!isDealer && (
          <button className="leave-button" onClick={isCurrentUserViewer() ? leaveRoomViewer : leaveRoomVoter}>Leave Room</button>
        )}

        {/*{isViewer && !isDealer && (*/}
        {/*  <button className="leave-button" onClick={makeMeDealer}>Make Me Dealer</button>*/}
        {/*)}*/}
        {isDealer && (
          <button className="leave-button" onClick={() => {
            if (window.confirm("Are you sure you want to close the room for everyone?")) {
              closeRoom();
            }
          }}>Close Room</button>
        )}
    </div>

  )
}