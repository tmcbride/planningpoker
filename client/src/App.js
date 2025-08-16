import "./App.css";
import { useRoom } from "./contexts/RoomContext";
import { Lobby } from "./components/lobby";
import { Room } from "./components/room";

function App() {
  const {room} = useRoom();
  let element = room ? <Room /> : <Lobby />;
  return (
    <div className="App-header">
      <h1>Planning Poker</h1>
      {element}
    </div>
);
}

export default App;