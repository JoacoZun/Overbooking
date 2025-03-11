const API_URL = "http://localhost:3000/api/flights";

export const registerFlight = async (flightData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(flightData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Error en la solicitud");
  }

  return response.json();
};

export const getOverbookedPassengers = async () => {
  const response = await fetch(`${API_URL}/overbooked-passengers`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Error en la solicitud");
  }

  return response.json();
};
