import {useRoom} from "../contexts/RoomContext";
import {useEffect, useState, useMemo} from "react";
import {VoteIcon} from "./voteIcon";

export function Votes() {
  const {
    room, currentUserId, isCurrentUserVoter, isCurrentUserDealer, vote, clearVote, resetVotes
  } = useRoom();
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (room.showVotes && room.showFireworks) {
        setShowFireworks(true)
    }
  }, [room.showFireworks]);

  useEffect(() => {
    if (showFireworks) {
      const timer = setTimeout(() => setShowFireworks(false), 2800);
      return () => clearTimeout(timer);
    }
  }, [showFireworks])

  function getVotes() {
    return Object.entries(room.voters)
        .filter(([id, voter])=> !voter?.removed && room.votes[id] !== undefined)
        .map(([id]) => room.votes[id]);
  }

  const mostCommonVote = useMemo(() => {
    if (!room.votes || !room.showVotes) {
      return null;
    }

    const votes = getVotes();
    if (votes.length < 3) {
      const first = votes[0];
      if (votes.every(v => v === first)) {
        return first;
      }

      return null;
    }

    const counts = {};
    let maxCount = 0;
    let mostCommon = null;

    votes.forEach((vote) => {
      counts[vote] = (counts[vote] || 0) + 1;
      if (counts[vote] >= maxCount) {
        mostCommon = counts[vote] === maxCount ? null : vote;
        maxCount = counts[vote];
      }
    });

    return maxCount >= votes.length / 2 ? mostCommon : null;
  }, [room.votes, room.voters]);

  return (
    <div>
      {showFireworks && <div className="firework"></div>}
      <div className="cards">
        {room && room.voters && Object.entries(room.voters)
            .filter(([id, voter]) => id !== undefined && !voter.removed)
          .map(([id, voter]) => {
            if (!room) return;
            const voteValue = room.votes[id];
            const show = room.showVotes || (id === currentUserId && voteValue !== undefined);
            return (
              <div key={id} className="player-card">
                <div className={`flip-card ${show ? "flipped" : ""}`}>
                  <div className="flip-card-inner">
                    <VoteIcon mostCommonVote={mostCommonVote} voteValue={voteValue} show={room.showVotes} />
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

      {isCurrentUserVoter() && (
        <div className="vote-buttons">
          {[1, 2, 3, 5, 8, 13].map((v) => (
            <button className="vote-button"  key={v} onClick={() => vote(v)} disabled={room.showVotes || !room.currentTicket}>
              {v}
            </button>
          ))}
          <button className="vote-action-button" key="clear" onClick={() => clearVote()} disabled={room.showVotes || !room.currentTicket}>
            Clear
          </button>
        </div>
      )}

      {isCurrentUserDealer() && (
        <div className="vote-buttons">
          <button className="vote-action-button" key="reset" onClick={() => resetVotes()} disabled={(!room.isVoting || !room.currentTicket) && !room.showVotes}>
            Reset Votes
          </button>
        </div>
      )}
    </div>
  )
}