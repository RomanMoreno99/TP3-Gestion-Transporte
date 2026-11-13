import { Router } from "express";
import { body } from "express-validator";
import { register, login } from "../controllers/authController.js";

const router = Router();

router.post(
  "/register",
  [
    body("nombre").notEmpty().withMessage("El nombre es obligatorio."),
    body("email").isEmail().withMessage("Debe ingresar un email válido."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres."),
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Debe ingresar un email válido."),
    body("password").notEmpty().withMessage("La contraseña es obligatoria."),
  ],
  login
);

export default router;