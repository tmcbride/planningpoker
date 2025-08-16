import "./App.css";
import { useRoom } from "./contexts/RoomContext";
import { Lobby } from "./components/lobby";
import { Room } from "./components/room";

function App() {
  const {room} = useRoom();
  return room ? <Room /> : <Lobby />;
}

export default App;