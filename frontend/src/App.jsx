import { useState } from "react";
import FlightForm from "./components/FlightForm";
import PassengerList from "./components/PassengerList";
import "./App.css";

function App() {
  const [registeredFlight, setRegisteredFlight] = useState(null);

  const handleFlightRegistered = (flightData) => {
    setRegisteredFlight(flightData);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Sistema de Gestión de Vuelos y Overbooking</h1>
      </header>
      
      <main>
        <FlightForm onFlightRegistered={handleFlightRegistered} />
        <PassengerList flightData={registeredFlight} />
      </main>
      
      <footer>
        <p>Sistema de priorización de pasajeros | Gestión de Overbooking</p>
      </footer>
    </div>
  );
}

export default App;