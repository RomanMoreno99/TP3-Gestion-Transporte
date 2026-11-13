import { validationResult } from "express-validator";
import pool from "../config/db.js";

export const listarViajes = async (req, res) => {
  try {
    const [viajes] = await pool.query(`
      SELECT v.*, ve.marca, ve.modelo, ve.patente, c.nombre, c.apellido
      FROM viajes v
      INNER JOIN vehiculos ve ON ve.id = v.vehiculo_id
      INNER JOIN conductores c ON c.id = v.conductor_id
      ORDER BY v.id DESC
    `);

    res.status(200).json(viajes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al listar viajes." });
  }
};

export const crearViaje = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const {
    vehiculo_id,
    conductor_id,
    fecha_salida,
    fecha_llegada,
    origen,
    destino,
    kilometros,
    observaciones,
  } = req.body;

  try {
    const [vehiculo] = await pool.query("SELECT id FROM vehiculos WHERE id = ?", [vehiculo_id]);
    if (vehiculo.length === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado." });
    }

    const [conductor] = await pool.query("SELECT id FROM conductores WHERE id = ?", [conductor_id]);
    if (conductor.length === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado." });
    }

    const [result] = await pool.query(
      `INSERT INTO viajes
       (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada || null,
        origen,
        destino,
        kilometros,
        observaciones || null,
      ]
    );

    return res.status(201).json({
      mensaje: "Viaje registrado correctamente.",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error al crear viaje." });
  }
};

export const obtenerViajesPorVehiculo = async (req, res) => {
  const { id } = req.params;

  try {
    const [viajes] = await pool.query(
      `SELECT * FROM viajes WHERE vehiculo_id = ? ORDER BY fecha_salida DESC`,
      [id]
    );

    return res.status(200).json(viajes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error al listar viajes por vehículo." });
  }
};

export const obtenerViajesPorConductor = async (req, res) => {
  const { id } = req.params;

  try {
    const [viajes] = await pool.query(
      `SELECT * FROM viajes WHERE conductor_id = ? ORDER BY fecha_salida DESC`,
      [id]
    );

    return res.status(200).json(viajes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error al listar viajes por conductor." });
  }
};

export const totalKilometrosPorVehiculo = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(kilometros), 0) AS total_km
       FROM viajes
       WHERE vehiculo_id = ?`,
      [id]
    );

    return res.status(200).json({ vehiculo_id: Number(id), total_km: Number(rows[0].total_km) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error al calcular total por vehículo." });
  }
};

export const totalKilometrosPorConductor = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(kilometros), 0) AS total_km
       FROM viajes
       WHERE conductor_id = ?`,
      [id]
    );

    return res.status(200).json({ conductor_id: Number(id), total_km: Number(rows[0].total_km) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error al calcular total por conductor." });
  }
};