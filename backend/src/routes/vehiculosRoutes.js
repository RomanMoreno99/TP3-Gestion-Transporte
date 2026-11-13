import { Router } from "express";
import { body, param } from "express-validator";
import {
  listarVehiculos,
  obtenerVehiculo,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo,
} from "../controllers/vehiculosController.js";
import { requiereAutenticacion } from "../middlewares/auth.js";

const router = Router();

router.use(requiereAutenticacion);

router.get("/", listarVehiculos);

router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("ID inválido")],
  obtenerVehiculo
);

router.post(
  "/",
  [
    body("marca").notEmpty().withMessage("La marca es obligatoria."),
    body("modelo").notEmpty().withMessage("El modelo es obligatorio."),
    body("patente").notEmpty().withMessage("La patente es obligatoria."),
    body("anio").isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    body("capacidad_carga").isFloat({ min: 0 }).withMessage("Capacidad inválida."),
  ],
  crearVehiculo
);

router.put(
  "/:id",
  [
    param("id").isInt({ min: 1 }).withMessage("ID inválido"),
    body("marca").optional().notEmpty().withMessage("La marca es obligatoria."),
    body("modelo").optional().notEmpty().withMessage("El modelo es obligatorio."),
    body("patente").optional().notEmpty().withMessage("La patente es obligatoria."),
    body("anio").optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    body("capacidad_carga").optional().isFloat({ min: 0 }),
  ],
  actualizarVehiculo
);

router.delete(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("ID inválido")],
  eliminarVehiculo
);

export default router;