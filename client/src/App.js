import "./App.css";
import { useRoom } from "./contexts/RoomContext";
import { Lobby } from "./components/lobby";
import { Room } from "./components/room";
import {NameInput} from "./components/nameInput";
import {RoomControls} from "./components/roomControls";

function App() {
  const {room, roomId} = useRoom();
  const dealer = room && room.dealer ? room.dealer : "";

  let element = room ? <Room /> : <Lobby />;
  return (
    <div className="App">
      <div className="App-header">
        <h1 className="App-title">Scrum Poker</h1>

        { room && (
          <div className="room-title">
            <h2>{roomId}</h2>
            <h3>{"Product Owner - " + dealer.name }</h3>
          </div>
        )}

        <RoomControls/>
      </div>
      <div className="App-content">
        {!room && (<NameInput/> )}
        {element}
      </div>
    </div>
);
}

export default App;