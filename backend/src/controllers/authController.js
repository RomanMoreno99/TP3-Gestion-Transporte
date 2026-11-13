import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import pool from "../config/db.js";

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "4h";

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { nombre, email, password } = req.body;

  try {
    const [existing] = await pool.query("SELECT id FROM usuarios WHERE email = ?", [email]);

    if (existing.length > 0) {
      return res.status(409).json({ mensaje: "Ya existe un usuario con ese email." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, passwordHash]
    );

    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente.",
      token,
      usuario: {
        id: result.insertId,
        nombre,
        email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error al registrar usuario." });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, email, password FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ mensaje: "Credenciales inválidas." });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ mensaje: "Credenciales inválidas." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      mensaje: "Login exitoso.",
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error al iniciar sesión." });
  }
};