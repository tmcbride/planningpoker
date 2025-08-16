import {useRoom} from "../contexts/RoomContext";

export function Votes() {
  const {
    room, getUserId
  } = useRoom();

  return (
    <div>

      <h3>Players’ Hands</h3>
      <div className="cards">
        {room && room.voters && Object.entries(room.voters)
          .map(([id, voter]) => {
            if (!room) return;
            const voteValue = room.votes[id];
            const show = room.showVotes || id === getUserId();
            return (
              <div key={id} className="card">
                <div className="card-name">{voter.name}</div>
                <div className="card-value">
                  {show
                    ? voteValue ?? "—"
                    : voteValue !== undefined
                      ? "✅"
                      : "—"}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  )
}