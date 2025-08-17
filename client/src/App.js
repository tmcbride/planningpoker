import "./App.css";
import { useRoom } from "./contexts/RoomContext";
import { Lobby } from "./components/lobby";
import { Room } from "./components/room";
import {NameInput} from "./components/nameInput";

function App() {
  const {room} = useRoom();
  let element = room ? <Room /> : <Lobby />;
  return (
    <div className="App">
      <div className="App-header">
        <h1>Planning Poker</h1>
      </div>
      <div className="App-content">
        {!room && (<NameInput/> )}
        {element}
      </div>
    </div>
);
}

export default App;