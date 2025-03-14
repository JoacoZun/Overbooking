import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
import bodyParser from 'body-parser';
import cors from 'cors';

// Configuración de dotenv
dotenv.config();

// Desestructuración de Pool desde el paquete pg
const { Pool } = pkg;

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Configuración de PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


// Función para priorizar pasajeros en caso de overbooking
const prioritizePassengers = (passengers, capacity) => {
  return passengers
    .sort((a, b) => {
      const categoryPriority = { Black: 4, Platinum: 3, Gold: 2, Normal: 1 };

      if (categoryPriority[b.flightCategory] !== categoryPriority[a.flightCategory]) {
        return categoryPriority[b.flightCategory] - categoryPriority[a.flightCategory];
      }

      if (b.hasConnections !== a.hasConnections) {
        return b.hasConnections - a.hasConnections;
      }

      if (b.hasCheckedBaggage !== a.hasCheckedBaggage) {
        return b.hasCheckedBaggage - a.hasCheckedBaggage;
      }

      return a.age - b.age;
    })
    .map((p, index) => ({ ...p, boarded: index < capacity }));
};

// Endpoint para registrar un vuelo y manejar overbooking
app.post("/api/flights", async (req, res) => {
  try {
    const { capacity, flightCode, passengers } = req.body;

    if (!capacity || !flightCode || !passengers || !Array.isArray(passengers)) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const prioritizedPassengers = prioritizePassengers(passengers, capacity);
    const boardedPassengers = prioritizedPassengers.filter((p) => p.boarded);
    const overbookedPassengers = prioritizedPassengers.filter((p) => !p.boarded);

    const client = await pool.connect();
    await client.query("BEGIN");

    // Insertar el vuelo
    const flightResult = await client.query(
      "INSERT INTO flights (flight_code, capacity) VALUES ($1, $2) RETURNING id",
      [flightCode, capacity]
    );
    const flightId = flightResult.rows[0].id;

    // Insertar los pasajeros
    for (const passenger of prioritizedPassengers) {
      await client.query(
        `INSERT INTO passengers 
        (id, name, has_connections, age, flight_category, reservation_id, has_checked_baggage, flight_id, boarded) 
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) 
        ON CONFLICT (id) DO NOTHING`,
        [
          passenger.id,
          passenger.name,
          Boolean(passenger.hasConnections),
          passenger.age,
          passenger.flightCategory,
          passenger.reservationId,
          Boolean(passenger.hasCheckedBaggage),
          flightId,
          passenger.boarded,
        ]
      );
    }

    await client.query("COMMIT");
    client.release();

    // Respuesta correcta con status 201
    res.status(201).json({
      flightId,
      flightCode,
      capacity,
      boardedPassengers,    // Pasajeros asignados al vuelo
      overbookedPassengers, // Pasajeros en overbooking
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: "Error en el servidor", details: error.message });
  }
});

// Endpoint para obtener pasajeros afectados por overbooking
app.get("/api/flights/overbooked-passengers", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT p.id, p.name, p.age, p.flight_category, p.reservation_id, 
      p.has_connections, p.has_checked_baggage, f.flight_code, f.capacity 
      FROM passengers p 
      JOIN flights f ON p.flight_id = f.id 
      WHERE p.boarded = false`
    );
    client.release();

    if (result.rows.length === 0) {
      return res.json({ capacity: 0, passengers: [] });
    }

    res.json({
      capacity: result.rows[0].capacity, // La capacidad del vuelo
      passengers: result.rows, // Lista de pasajeros en overbooking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});
// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
