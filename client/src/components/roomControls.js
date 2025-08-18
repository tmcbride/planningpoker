import {useRoom} from "../contexts/RoomContext";

export function RoomControls() {
  const {
    room, getUserId, makeMeDealer,
    closeRoom,
    leaveRoomVoter, leaveRoomViewer,
  } = useRoom();

  if (!room) {
    return null;
  }

  const isDealer = isUserDealer(getUserId());
  const isViewer = !!room?.viewers?.[getUserId()];

  function isUserDealer(userId) {
    return room.dealer === userId;
  }

  return (
    <div className="header-controls">
        {!isDealer && (
          <button className="leave-button" onClick={isViewer ? leaveRoomViewer : leaveRoomVoter}>Leave Room</button>
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