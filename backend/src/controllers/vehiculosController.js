import { validationResult } from "express-validator";
import pool from "../config/db.js";

export const listarVehiculos = async (req, res) => {
  try {
    const [vehiculos] = await pool.query("SELECT * FROM vehiculos ORDER BY id DESC");
    return res.status(200).json(vehiculos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error al listar vehículos." });
  }
};

export const obtenerVehiculo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { id } = req.params;

  try {
    const [rows] = await pool.query("SELECT * FROM vehiculos WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado." });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error al buscar vehículo." });
  }
};

export const crearVehiculo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { marca, modelo, patente, anio, capacidad_carga } = req.body;

  try {
    const [existing] = await pool.query("SELECT id FROM vehiculos WHERE patente = ?", [patente]);

    if (existing.length > 0) {
      return res.status(409).json({ mensaje: "La patente ya existe." });
    }

    const [result] = await pool.query(
      "INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?, ?, ?, ?, ?)",
      [marca, modelo, patente, anio, capacidad_carga]
    );

    return res.status(201).json({
      mensaje: "Vehículo creado correctamente.",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensaje: "La patente ya existe." });
    }
    return res.status(500).json({ mensaje: "Error al crear vehículo." });
  }
};

export const actualizarVehiculo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { id } = req.params;
  const campos = req.body && typeof req.body === "object" && !Array.isArray(req.body)
    ? req.body
    : null;
  const camposPermitidos = ["marca", "modelo", "patente", "anio", "capacidad_carga"];

  if (!campos) {
    return res.status(400).json({ mensaje: "El cuerpo debe ser un objeto JSON." });
  }

  const columnas = Object.keys(campos);
  const camposInvalidos = columnas.filter((campo) => !camposPermitidos.includes(campo));

  if (camposInvalidos.length > 0) {
    return res.status(400).json({ mensaje: "Se enviaron campos no permitidos.", campos: camposInvalidos });
  }

  if (columnas.length === 0) {
    return res.status(400).json({ mensaje: "No se enviaron campos para actualizar." });
  }

  try {
    const [vehiculo] = await pool.query("SELECT id FROM vehiculos WHERE id = ?", [id]);

    if (vehiculo.length === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado." });
    }

    const valores = columnas.map((campo) => campos[campo]);
    const sql = `UPDATE vehiculos SET ${columnas.map((campo) => `${campo} = ?`).join(", ")} WHERE id = ?`;
    await pool.query(sql, [...valores, id]);

    return res.status(200).json({ mensaje: "Vehículo actualizado correctamente." });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensaje: "La patente ya existe." });
    }
    return res.status(500).json({ mensaje: "Error al actualizar vehículo." });
  }
};

export const eliminarVehiculo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM vehiculos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado." });
    }

    return res.status(200).json({ mensaje: "Vehículo eliminado correctamente." });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({ mensaje: "No se puede eliminar el vehículo porque tiene viajes asociados." });
    }
    return res.status(500).json({ mensaje: "Error al eliminar vehículo." });
  }
};
