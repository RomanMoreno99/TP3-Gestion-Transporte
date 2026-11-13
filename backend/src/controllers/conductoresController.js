import { validationResult } from "express-validator";
import pool from "../config/db.js";

export const listarConductores = async (req, res) => {
  try {
    const [conductores] = await pool.query("SELECT * FROM conductores ORDER BY id DESC");
    res.status(200).json(conductores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al listar conductores." });
  }
};

export const obtenerConductor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { id } = req.params;

  try {
    const [rows] = await pool.query("SELECT * FROM conductores WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado." });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error al buscar conductor." });
  }
};

export const crearConductor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const {
    nombre,
    apellido,
    documento,
    numero_licencia,
    fecha_alta_licencia,
    fecha_vencimiento_licencia,
  } = req.body;

  try {
    const [yaExiste] = await pool.query(
      "SELECT id FROM conductores WHERE documento = ? OR numero_licencia = ?",
      [documento, numero_licencia]
    );

    if (yaExiste.length > 0) {
      return res.status(409).json({ mensaje: "El documento o la licencia ya existen." });
    }

    const [result] = await pool.query(
      `INSERT INTO conductores
       (nombre, apellido, documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia]
    );

    return res.status(201).json({
      mensaje: "Conductor creado correctamente.",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error al crear conductor." });
  }
};

export const actualizarConductor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { id } = req.params;
  const campos = req.body;

  try {
    const [conductor] = await pool.query("SELECT id FROM conductores WHERE id = ?", [id]);

    if (conductor.length === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado." });
    }

    const columnas = Object.keys(campos);
    const valores = Object.values(campos);

    if (columnas.length === 0) {
      return res.status(400).json({ mensaje: "No se enviaron campos para actualizar." });
    }

    const sql = `UPDATE conductores SET ${columnas.map((campo) => `${campo} = ?`).join(", ")} WHERE id = ?`;
    valores.push(id);

    await pool.query(sql, valores);

    return res.status(200).json({ mensaje: "Conductor actualizado correctamente." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error al actualizar conductor." });
  }
};

export const eliminarConductor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM conductores WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado." });
    }

    return res.status(200).json({ mensaje: "Conductor eliminado correctamente." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error al eliminar conductor." });
  }
};