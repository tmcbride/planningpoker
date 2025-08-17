import {useRoom} from "../contexts/RoomContext";

export function Viewers() {
  const {
    room, getUserId, makeMeDealer
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
    <div className="viewer-container">
    {isViewer && !isDealer && (
      <button onClick={makeMeDealer}>Make Me Dealer</button>
    )}

    <ul className="viewers">
      {room && room.viewers && Object.entries(room.viewers)
        .map(([id, user]) => (
          <li key={id}>
            <div className="viewer">
              <span className="viewer-icon">{isUserDealer(id) ? "🃏" : "👤"}</span>
              <div>
                {user.name}
              </div>
            </div>
          </li>
        ))}
    </ul>
  </div>
  )
}