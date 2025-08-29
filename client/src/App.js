import "./App.css";
import {useRoom} from "./contexts/RoomContext";
import {Lobby} from "./components/lobby";
import {Room} from "./components/room";
import {NameInput} from "./components/nameInput";
import {LeaveCloseButtons} from "./components/leaveCloseButtons";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const {room, roomId} = useRoom();
    const dealer = room && room.dealer ? room.dealer : "";

    let element = room ? <Room/> : <Lobby/>;
    return (
        <div className="app">
            <div className="app-header">
                <div className="app-header-container">
                    <div  className="app-title">
                        <h1>Scrum Poker</h1>
                        <h3>Beta</h3>
                    </div>

                    {room && (
                        <div className="app-room-title">
                            <h2>{roomId}</h2>
                            <h3>{"Product Owner - " + dealer.name}</h3>
                        </div>
                    )}

                    <LeaveCloseButtons/>
                </div>
            </div>
            <div className="app-content">
                {!room && (<NameInput/>)}
                {element}
            </div>
            <ToastContainer
                position="top-center"
                theme="dark"
            />
        </div>
    );
}

export default App;