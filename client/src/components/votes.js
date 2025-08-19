import {useRoom} from "../contexts/RoomContext";
import {useEffect, useState, useMemo} from "react";

export function Votes() {
  const {
    room, currentUserId, isCurrentUserViewer, vote
  } = useRoom();
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (room.showVotes) {
      const votes = Object.values(room.votes).filter(v => v !== undefined);
      if (votes.length > 1) {
        const first = votes[0];
        if (votes.every(v => v === first)) {
          setShowFireworks(true);
          const timer = setTimeout(() => setShowFireworks(false), 2800);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [room.showVotes, room.votes]);

  const mostCommonVote = useMemo(() => {
    if (!room.votes) return null;
    const counts = {};
    let maxCount = 0;
    let mostCommon = null;
    Object.values(room.votes).forEach((vote) => {
      counts[vote] = (counts[vote] || 0) + 1;
      if (counts[vote] > maxCount) {
        maxCount = counts[vote];
        mostCommon = vote;
      }
    });
    return mostCommon;
  }, [room.votes]);

  return (
    <div>
      {showFireworks && <div className="firework"></div>}
      <div className="cards">
        {room && room.voters && Object.entries(room.voters)
          .map(([id, voter]) => {
            if (!room) return;
            const voteValue = room.votes[id];
            const show = room.showVotes || (id === currentUserId && voteValue !== undefined);
            return (
              <div key={id}>
                <div className={`flip-card ${show ? "flipped" : ""}`}>
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      {voteValue !== undefined
                        ? <div>&#x2713;</div>
                        : ""}
                    </div>
                    <div className={
                      "flip-card-back " +
                      (room.showVotes && voteValue === mostCommonVote ? "highlight-vote" : "")
                    }>
                      {show
                        ? voteValue ?? ""
                        : voteValue !== undefined
                          ? <div>&#x2713;</div>
                          : ""}
                    </div>
                  </div>
                </div>
                <div className="card-name">{voter.name}</div>
              </div>
            );
          })}
      </div>

      {!isCurrentUserViewer && (
        <div className="vote-buttons">
          {[1, 2, 3, 5, 8, 13].map((v) => (
            <button key={v} onClick={() => vote(v)} disabled={room.showVotes || !room.currentTicket}>
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}