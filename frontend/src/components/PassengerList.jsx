import { useEffect, useState } from "react";
import "../components/Styles.css"

const PassengerList = ({ flightData }) => {
  const [boardedPassengers, setBoardedPassengers] = useState([]);
  const [overbookedPassengers, setOverbookedPassengers] = useState([]);
  const [flightCapacity, setFlightCapacity] = useState(null);
  const [flightCode, setFlightCode] = useState("");
  const [groupedByReservation, setGroupedByReservation] = useState({
    boarded: {},
    overbooked: {}
  });

  useEffect(() => {
    if (flightData) {
      const boarded = flightData.boardedPassengers || [];
      const overbooked = flightData.overbookedPassengers || [];
      
      setBoardedPassengers(boarded);
      setOverbookedPassengers(overbooked);
      setFlightCapacity(flightData.capacity);
      setFlightCode(flightData.flightCode);
      
      // Agrupar pasajeros por ID de reserva
      setGroupedByReservation({
        boarded: groupPassengersByReservation(boarded),
        overbooked: groupPassengersByReservation(overbooked)
      });
    }
  }, [flightData]);

  // Función para agrupar pasajeros por ID de reserva
  const groupPassengersByReservation = (passengers) => {
    const grouped = {};
    
    passengers.forEach(passenger => {
      const resId = passenger.reservationId;
      if (!grouped[resId]) {
        grouped[resId] = [];
      }
      grouped[resId].push(passenger);
    });
    
    return grouped;
  };

  if (!flightData) {
    return <p className="no-data-message">Registra un vuelo para ver la lista de pasajeros.</p>;
  }

  const getCategoryColor = (category) => {
    const colors = {
      Black: "#333",
      Platinum: "#E5E4E2",
      Gold: "#FFD700",
      Normal: "#A9A9A9"
    };
    return colors[category] || "#A9A9A9";
  };

  const renderPassengerCard = (passenger, index, groupLength) => {
    return (
      <div 
        key={passenger.id} 
        className="passenger-card"
        style={{
          borderLeft: `5px solid ${getCategoryColor(passenger.flightCategory)}`
        }}
      >
        <div className="passenger-header">
          <span className="passenger-name">{passenger.name}</span>
          <span className="passenger-category">{passenger.flightCategory}</span>
        </div>
        
        <div className="passenger-details">
          <div className="passenger-info">
            <div>ID: {passenger.id}</div>
            <div>Edad: {passenger.age} años</div>
          </div>
          
          <div className="passenger-tags">
            {passenger.hasConnections && 
              <span className="tag connection">Conexión</span>}
            {passenger.hasCheckedBaggage && 
              <span className="tag baggage">Equipaje</span>}
          </div>
        </div>
        
        {groupLength > 1 && index === 0 && (
          <div className="family-tag">
            Grupo familiar/Reserva conjunta
          </div>
        )}
      </div>
    );
  };

  const renderReservationGroup = (passengers, reservationId, section) => {
    const isFamily = passengers.length > 1;
    
    return (
      <div 
        key={`${section}-${reservationId}`} 
        className={`reservation-group ${isFamily ? 'family-group' : ''}`}
      >
        <div className="reservation-id">
          Reserva: {reservationId} {isFamily && `(${passengers.length} pasajeros)`}
        </div>
        <div className="passenger-list-items">
          {passengers.map((passenger, index) => 
            renderPassengerCard(passenger, index, passengers.length)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="passenger-list-container">
      <div className="flight-header">
        <h2>Vuelo: {flightCode}</h2>
        <div className="flight-details">
          <span>Capacidad: {flightCapacity} pasajeros</span>
          <span>Total registrados: {boardedPassengers.length + overbookedPassengers.length}</span>
        </div>
      </div>

      <div className="passengers-section boarded">
        <h3>
          <span className="status-icon">✅</span> 
          Pasajeros Abordados ({boardedPassengers.length})
        </h3>
        
        {boardedPassengers.length > 0 ? (
          <div className="reservation-groups">
            {Object.entries(groupedByReservation.boarded).map(([resId, passengers]) => 
              renderReservationGroup(passengers, resId, 'boarded')
            )}
          </div>
        ) : (
          <p className="empty-list">No hay pasajeros abordados.</p>
        )}
      </div>

      <div className="passengers-section overbooked">
        <h3>
          <span className="status-icon">❌</span>
          Pasajeros en Overbooking ({overbookedPassengers.length})
        </h3>
        
        {overbookedPassengers.length > 0 ? (
          <div className="reservation-groups">
            {Object.entries(groupedByReservation.overbooked).map(([resId, passengers]) => 
              renderReservationGroup(passengers, resId, 'overbooked')
            )}
          </div>
        ) : (
          <p className="empty-list">No hay pasajeros en overbooking.</p>
        )}
      </div>
      
      <div className="legend">
        <h4>Leyenda de prioridades</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: getCategoryColor('Black')}}></span>
            <span>Black (Máxima prioridad)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: getCategoryColor('Platinum')}}></span>
            <span>Platinum</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: getCategoryColor('Gold')}}></span>
            <span>Gold</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: getCategoryColor('Normal')}}></span>
            <span>Normal</span>
          </div>
          <div className="legend-item">
            <span className="tag connection">Conexión</span>
            <span>Tiene vuelo de conexión</span>
          </div>
          <div className="legend-item">
            <span className="tag baggage">Equipaje</span>
            <span>Tiene equipaje facturado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerList;