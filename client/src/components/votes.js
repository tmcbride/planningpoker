import {useRoom} from "../contexts/RoomContext";

export function Votes() {
  const {
    room, getUserId
  } = useRoom();

  return (
    <div>
      <div className="cards">
        {room && room.voters && Object.entries(room.voters)
          .map(([id, voter]) => {
            if (!room) return;
            const voteValue = room.votes[id];
            const show = room.showVotes || (id === getUserId() && voteValue !== undefined);
            return (
              <div>
                <div className={`flip-card ${show ? "flipped" : ""}`}>
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      {voteValue !== undefined
                      ? "✅"
                      : ""}
                    </div>
                    <div className="flip-card-back">
                            {show
                              ? voteValue ?? ""
                              : voteValue !== undefined
                                ? "✅"
                                : ""}
                    </div>
                  </div>
                </div>
                <div className="card-name">{voter.name}</div>
              </div>
            );
          })}
      </div>
    </div>
  )
}