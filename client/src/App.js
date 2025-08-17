import "./App.css";
import { useRoom } from "./contexts/RoomContext";
import { Lobby } from "./components/lobby";
import { Room } from "./components/room";
import {NameInput} from "./components/nameInput";
import {Viewers} from "./components/viewers";

function App() {
  const {room, roomId} = useRoom();
  const dealer = room && room.dealer && room.viewers[room.dealer] ? room.viewers[room.dealer] : "";
  let element = room ? <Room /> : <Lobby />;
  return (
    <div className="App">
      <div className="App-header">
        <h1>Planning Poker</h1>
        { room && (
          <div className="room-title">
            <h2>{roomId}</h2>
            <h3>{dealer.name ? "Dealer - " + dealer.name : "No Dealer!!"}</h3>
          </div>
        )}

        <Viewers/>
      </div>
      <div className="App-content">
        {!room && (<NameInput/> )}
        {element}
      </div>
    </div>
);
}

export default App;