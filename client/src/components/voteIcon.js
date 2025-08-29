export function VoteIcon({mostCommonVote, voteValue, show}) {
    if (!show || !mostCommonVote) {
        return null;
    }

    let iconVal;
    let className = "";

    if (!mostCommonVote) {
        iconVal = "-";
    } else if (voteValue === mostCommonVote) {
        iconVal = "★"; // Unicode star
        className = "most-voted";
    } else if (voteValue < mostCommonVote) {
        iconVal = "▼"; // Down triangle
        className = "outside-vote";
    } else {
        iconVal = "▲"; // Up triangle
        className = "outside-vote";
    }

    return (
        <div className="card-icon" title="Card Icon">
            <div className={className}>{iconVal}</div>
        </div>
    )
}