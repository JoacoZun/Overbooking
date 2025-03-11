import { useState } from "react";
import { registerFlight } from "../api/api";
import "../components/Form.css";

const FlightForm = ({ onFlightRegistered }) => {
  const [flightCode, setFlightCode] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [passengers, setPassengers] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        if (Array.isArray(jsonData)) {
          setPassengers(jsonData);
          console.log(`Cargados ${jsonData.length} pasajeros del archivo`);
        } else {
          alert("El formato del archivo no es válido. Debe ser un array de pasajeros.");
        }
      } catch (error) {
        console.error("Error al parsear el archivo JSON:", error);
        alert("Error al leer el archivo JSON. Asegúrate de que el formato sea correcto.");
      }
    };
    
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passengers.length === 0) {
      alert("Debes cargar un archivo con la lista de pasajeros");
      return;
    }

    if (capacity <= 0) {
      alert("La capacidad debe ser mayor que cero");
      return;
    }

    const flightData = {
      flightCode,
      capacity: parseInt(capacity),
      passengers,
    };

    setIsLoading(true);

    try {
      const response = await registerFlight(flightData);
      console.log("Vuelo registrado:", response);
      onFlightRegistered(response);
      
      // Limpiar el formulario después de registrar el vuelo
      setFlightCode("");
      setCapacity(0);
      setPassengers([]);
      setFileName("");
    } catch (error) {
      console.error("Error registrando vuelo:", error.message);
      alert("Error al registrar el vuelo: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flight-form-container">
      <h2>Registrar nuevo vuelo</h2>
      <form onSubmit={handleSubmit}>
        <div className="flight-details">
          <div>
            <label>Código de Vuelo:</label>
            <input
              type="text"
              value={flightCode}
              onChange={(e) => setFlightCode(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Capacidad:</label>
            <input
              type="number"
              value={capacity || ""}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
              min="1"
              required
            />
          </div>
          <div className="file-upload">
            <label>Archivo de Pasajeros (JSON):</label>
            <div className="file-input-container">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                id="jsonFile"
                className="file-input"
              />
              <label htmlFor="jsonFile" className="file-label">
                {fileName || "Seleccionar archivo..."}
              </label>
            </div>
          </div>
          {passengers.length > 0 && (
            <div className="passenger-summary">
              <p>✅ {passengers.length} pasajeros cargados correctamente</p>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="submit-btn" 
          disabled={isLoading || passengers.length === 0}
        >
          {isLoading ? "Registrando..." : "Registrar Vuelo"}
        </button>
      </form>
    </div>
  );
};

export default FlightForm;