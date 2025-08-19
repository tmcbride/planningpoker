import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useRef } from "react";

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

function randomId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

export function RoomProvider({children}) {
  const [room, setRoom] = useState(null);
  const [name, setName] = useState(localStorage.getItem("name"));
  const [roomId, setRoomId] = useState(localStorage.getItem("name"));
  let initialState = loadOrGenerateUserId();
  const [currentUserId, setUserId] = useState(initialState);
  const [ticket, setTicket] = useState(null);

  const socketRef = useRef(null);

  if (!socketRef.current) {
    socketRef.current = io("http://localhost:4000");
  }

  const socket = socketRef.current;

  useEffect(() => {
    localStorage.setItem("name", name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem("roomId", roomId);
  }, [roomId]);

  useEffect(() => {
    const handleRoomUpdate = (data) => setRoom(data);
    socket.on("roomUpdate", handleRoomUpdate);
    return () => socket.off("roomUpdate", handleRoomUpdate);
  }, [socket]);

  useEffect(() => {
    const handleVotesUpdate = (data) => setRoom(prev => prev ? ({ ...prev, votes: data.votes, showVotes: data.showVotes }) : prev);
    socket.on("votesUpdate", handleVotesUpdate);
    return () => socket.off("votesUpdate", handleVotesUpdate);
  }, [socket]);

  useEffect(() => {
    const handleViewerUpdate = (data) => setRoom(prev => prev ? ({ ...prev, viewers: data.viewers, dealer: data.dealer }) : prev);
    socket.on("viewerUpdate", handleViewerUpdate);
    return () => socket.off("viewerUpdate", handleViewerUpdate);
  }, [socket]);

  useEffect(() => {
    const handleVoterUpdate = (data) => setRoom(prev => prev ? ({ ...prev, voters: data }) : prev);
    socket.on("voterUpdate", handleVoterUpdate);
    return () => socket.off("voterUpdate", handleVoterUpdate);
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
    socket.emit("createRoom", { roomId: roomId, name: name, userId: currentUserId });
  };

  const makeMeDealer = () => {
    socket.emit("makeMeDealer", {roomId: roomId});
  };

  const clearRooms = () => {
    socket.emit("clearRooms");
  };

  const closeRoom = () => {
    socket.emit("closeRoom", {roomId: roomId});
  };

  const joinRoom = (roomIdToJoin) => {
    if (!roomIdToJoin || !name) return alert("Enter name");

    // Save locally
    // localStorage.setItem("username", name);
    // localStorage.setItem("roomId", roomIdToJoin);

    socket.emit("joinRoom", { roomId: roomIdToJoin, name: name });
    setRoomId(roomIdToJoin);
  };

  const openRoom = async (roomIdToJoin) => {
    if (!roomIdToJoin || !name) return alert("Enter name");

    // localStorage.setItem("roomId", roomIdToJoin);
    socket.emit("openRoom", { roomId: roomIdToJoin, name: name});
    setRoomId(roomIdToJoin);
  };

  const leaveRoomVoter = () => {
    socket.emit("leaveRoomVoter", { roomId });
    setRoom(null);
    setRoomId("");
    // localStorage.removeItem("roomId");
  };

  const leaveRoomViewer = () => {
    socket.emit("leaveRoomViewer", { roomId });
    setRoom(null);
    setRoomId("");
    // localStorage.removeItem("roomId");
  };

  const leaveRoom = () => {
    setRoom(null);
    setRoomId("");
    // localStorage.removeItem("roomId");
  };

  // useEffect(() => {
  //   const savedName = localStorage.getItem("username");
  //   const savedRoom = localStorage.getItem("roomId");
  //
  //   if (savedName && savedRoom) {
  //     setName(savedName);
  //     setRoomId(savedRoom);
  //     socket.emit("joinRoom", { roomId: savedRoom, name: savedName });
  //   }
  // }, []);

  const setCurrentTicket = (ticket) => {
    if (!ticket) return alert("Enter a ticket");
    socket.emit("setTicket", { roomId, ticket: ticket });
  };

  const resetVotes = () => {
    socket.emit("resetVotes", { roomId });
  };

  const vote = (value) => {
    socket.emit("vote", { roomId, vote: value });
  };

  const isCurrentUserViewer = () => !!room?.viewers?.[socket.id];
  const isCurrentUserVoter = () => !!room?.voters?.[socket.id];

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
        currentUserId,
        makeMeDealer,
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