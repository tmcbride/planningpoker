import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useRef } from "react";

const RoomContext = createContext();
export const useRoom = () => useContext(RoomContext);

export function RoomProvider({children}) {
  const [room, setRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [name, setName] = useState(localStorage.getItem("name"));
  const [roomId, setRoomId] = useState("");
  const [ticket, setTicket] = useState("");

  const socketRef = useRef(null);

  if (!socketRef.current) {
    socketRef.current = io("http://localhost:4000");
  }

  const socket = socketRef.current;

  function getRoomList() {
    fetch("http://localhost:4000/rooms")
      .then(res => res.json())
      .then(data => {
        setAvailableRooms(data);
      })
      .catch(err => console.error("Error fetching rooms:", err));
  }

  function getUserId() {
    return socket.id;
  }

  useEffect(() => {
    localStorage.setItem("name", name);
  }, [name]);

  useEffect(() => {
    getRoomList();
  }, []);

  useEffect(() => {
    const handleRoomUpdate = (data) => setRoom(data);
    socket.on("roomUpdate", handleRoomUpdate);
    return () => socket.off("roomUpdate", handleRoomUpdate);
  }, [socket]);

  useEffect(() => {
    const handleRoomUpdate = (data) => {
      console.log("Recieved: ", data);
      setAvailableRooms(data);
    }
    socket.on("roomsList", handleRoomUpdate);
    return () => socket.off("roomsList", handleRoomUpdate);
  }, [socket]);

  useEffect(() => {
    const handleVotesUpdate = (data) => setRoom(prev => prev ? ({ ...prev, votes: data.votes, showVotes: data.showVotes }) : prev);
    socket.on("votesUpdate", handleVotesUpdate);
    return () => socket.off("votesUpdate", handleVotesUpdate);
  }, [socket]);

  useEffect(() => {
    const handleViewerUpdate = (data) => setRoom(prev => prev ? ({ ...prev, viewers: data }) : prev);
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

  const createRoom = () => {
    if (!roomId || !name) return alert("Enter name & room ID");
    socket.emit("createRoom", { roomId, name: name });
  };

  const clearRooms = () => {
    socket.emit("clearRooms");
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

  // Dealer actions
  const setCurrentTicket = () => {
    if (!ticket) return alert("Enter a ticket");
    socket.emit("setTicket", { roomId, ticket });
  };

  const resetVotes = () => {
    socket.emit("resetVotes", { roomId });
  };

  // Player actions
  const vote = (value) => {
    socket.emit("vote", { roomId, vote: value });
  };

  return (
    <RoomContext.Provider
      value={{
        room,
        availableRooms,
        name,
        setName,
        roomId,
        setRoomId,
        ticket,
        setTicket,
        getRoomList,
        createRoom,
        clearRooms,
        joinRoom,
        openRoom,
        leaveRoomVoter,
        leaveRoomViewer,
        setCurrentTicket,
        resetVotes,
        vote,
        getUserId
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}