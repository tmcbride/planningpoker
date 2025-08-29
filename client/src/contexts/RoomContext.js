import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useRef } from "react";
import { toast } from 'react-toastify';

const RoomContext = createContext();
export const useRoom = () => useContext(RoomContext);

function loadOrGenerateUserId() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = randomId();
    localStorage.setItem("userId", userId);
  }

  return userId;
}

function randomId(length = 12) {
  return Math.random().toString(36).substring(2, 2 + length);
}

export function RoomProvider({children}) {
  const [room, setRoom] = useState(null);
  const [name, setName] = useState(localStorage.getItem("name"));
  const [roomId, setRoomId] = useState(localStorage.getItem("roomId"));
  let initialState = loadOrGenerateUserId();
  const [currentUserId] = useState(initialState);
  const [ticket, setTicket] = useState(null);

  const socketRef = useRef(null);
  const apiUrl = process.env.REACT_APP_SOCKET_URL || "";

  if (!socketRef.current) {
    socketRef.current = io(apiUrl);
  }

  const socket = socketRef.current;

  useEffect(() => {
    localStorage.setItem("name", name);
  }, [name]);

  useEffect(() => {
    const handleRoomUpdate = (data) => setRoom(data);
    socket.on("roomUpdate", handleRoomUpdate);
    return () => socket.off("roomUpdate", handleRoomUpdate);
  }, [socket]);

  useEffect(() => {
    const handleVotesUpdate = (data) => setRoom(prev => prev ? ({ ...prev, votes: data.votes, showVotes: data.showVotes, isVoting: data.isVoting }) : prev);
    socket.on("votesUpdate", handleVotesUpdate);
    return () => socket.off("votesUpdate", handleVotesUpdate);
  }, [socket]);

  useEffect(() => {
    const handleViewerUpdate = (data) => setRoom(prev => prev ? ({ ...prev, viewers: data.viewers, dealer: data.dealer }) : prev);
    socket.on("viewerUpdate", handleViewerUpdate);
    return () => socket.off("viewerUpdate", handleViewerUpdate);
  }, [socket]);

  useEffect(() => {
    const handleVoterUpdate = (data) => {
      setRoom(prev => prev ? ({...prev, voters: data}) : prev);
      console.log(data);
    }
    socket.on("voterUpdate", handleVoterUpdate);
    return () => socket.off("voterUpdate", handleVoterUpdate);
  }, [socket]);

  useEffect(() => {
    const handleTicketUpdate = (data) => setRoom(prev => prev ? ({ ...prev, currentTicket: data, showVotes: false, votes: {} }) : prev);
    socket.on("ticketUpdate", handleTicketUpdate);
    return () => socket.off("ticketUpdate", handleTicketUpdate);
  }, [socket]);

  useEffect(() => {
    const logEvent = (event, ...args) => console.log("Socket event received:", event, args);
    socket.onAny(logEvent);

    return () => socket.offAny(logEvent);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handleRoomClosed = () => {
      leaveRoom();
    };
    socket.on("roomClosed", handleRoomClosed);
    return () => socket.off("roomClosed", handleRoomClosed);
  }, [socket]);

  const createRoom = () => {
    if (!roomId || !name) return alert("Enter name & Sprint Name");
    localStorage.setItem("roomIdDealer", roomId);
    socket.emit("createRoom", { roomId: roomId, name: name, userId: currentUserId });
  };

  const clearRooms = () => {
    socket.emit("clearRooms");
  };

  const closeRoom = () => {
    socket.emit("closeRoom", {roomId: roomId});
  };

  const joinRoom = (roomIdToJoin) => {
    if (!roomIdToJoin || !name) return alert("Enter name");

    localStorage.setItem("roomId", roomIdToJoin);

    socket.emit("joinRoom", { roomId: roomIdToJoin, name: name, userId: currentUserId });
    setRoomId(roomIdToJoin);
  };

  const openRoom = async (roomIdToJoin) => {
    if (!roomIdToJoin || !name) return alert("Enter name");

    localStorage.setItem("roomIdViewer", roomIdToJoin);
    socket.emit("openRoom", { roomId: roomIdToJoin, name: name, userId: currentUserId});
    setRoomId(roomIdToJoin);
  };

  const leaveRoomVoter = () => {
    socket.emit("leaveRoomVoter", { roomId, userId: currentUserId });
    leaveRoom();
  };

  const leaveRoomViewer = () => {
    socket.emit("leaveRoomViewer", { roomId, userId: currentUserId });
    leaveRoom();
  };

  const leaveRoom = () => {
    setRoom(null);
    setRoomId("");
    localStorage.removeItem("roomId");
    localStorage.removeItem("roomIdViewer");
    localStorage.removeItem("roomIdDealer");
  };

  useEffect(() => {
    const savedName = localStorage.getItem("name");
    const savedRoom = localStorage.getItem("roomId");
    const savedRoomViewer = localStorage.getItem("roomIdViewer");
    const roomIdDealer = localStorage.getItem("roomIdDealer");

    if (savedName && (roomIdDealer || savedRoom || savedRoomViewer)) {
      setName(savedName);
      if (savedRoom) {
        setRoomId(savedRoom);
        socket.emit("joinRoom", { roomId: savedRoom, name: savedName, userId: currentUserId });
      }
      else {
        setRoomId(savedRoomViewer);
        socket.emit("openRoom", { roomId: savedRoomViewer, name: savedName, userId: currentUserId });
      }
    }
  }, []);

  const setCurrentTicket = (ticket) => {
    if (room.isVoting) {
      toast("Voting in progress, reset votes before you can select a new ticket");
      return;
    }

    if (!ticket) return toast("Enter a ticket");
    socket.emit("setTicket", { roomId, ticket: ticket });
  };

  const resetVotes = () => {
    socket.emit("resetVotes", { roomId });
  };

  const vote = (value) => {
    socket.emit("vote", { roomId, vote: value, userId: currentUserId });
  };

  const clearVote = () => {
    socket.emit("clearVote", { roomId, userId: currentUserId });
  };

  const isCurrentUserViewer = () => {
    let viewer = room?.viewers?.[currentUserId];
    return viewer && !viewer.removed;
  }

  const isCurrentUserVoter = () => {
    let voter = room?.voters?.[currentUserId];
    return voter && !voter.removed;
  }

  const isUserDealer = (userId) => {
    console.log(
      "currentUserId:", currentUserId, typeof currentUserId,
      "dealerId:", room?.dealer?.userId, typeof room?.dealer?.userId,
      "equal?:", currentUserId === room?.dealer?.userId
    );
    return room && room.dealer && room.dealer.userId === userId;
  }

  const isCurrentUserDealer = () => {
    return isUserDealer(currentUserId);
  }

  return (
    <RoomContext.Provider
      value={{
        room,
        name,
        setName,
        roomId,
        setRoom,
        setRoomId,
        ticket,
        setTicket,
        createRoom,
        clearRooms,
        joinRoom,
        openRoom,
        leaveRoomVoter,
        leaveRoomViewer,
        setCurrentTicket,
        resetVotes,
        vote,
        clearVote,
        currentUserId,
        closeRoom,
        socket,
        isUserDealer,
        isCurrentUserDealer,
        isCurrentUserViewer,
        isCurrentUserVoter
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}