import { Router } from "express";
import { body, param } from "express-validator";
import {
  listarViajes,
  crearViaje,
  obtenerViajesPorVehiculo,
  obtenerViajesPorConductor,
  totalKilometrosPorVehiculo,
  totalKilometrosPorConductor,
} from "../controllers/viajesController.js";
import { requiereAutenticacion } from "../middlewares/auth.js";

const router = Router();

router.use(requiereAutenticacion);

router.get("/", listarViajes);

router.get("/vehiculo/:id", [param("id").isInt({ min: 1 })], obtenerViajesPorVehiculo);

router.get("/conductor/:id", [param("id").isInt({ min: 1 })], obtenerViajesPorConductor);

router.get("/total/vehiculo/:id", [param("id").isInt({ min: 1 })], totalKilometrosPorVehiculo);

router.get("/total/conductor/:id", [param("id").isInt({ min: 1 })], totalKilometrosPorConductor);

router.post(
  "/",
  [
    body("vehiculo_id").isInt({ min: 1 }).withMessage("Vehículo obligatorio."),
    body("conductor_id").isInt({ min: 1 }).withMessage("Conductor obligatorio."),
    body("fecha_salida").isISO8601().withMessage("Fecha de salida inválida."),
    body("fecha_llegada").optional().isISO8601().withMessage("Fecha de llegada inválida."),
    body("origen").notEmpty().withMessage("El origen es obligatorio."),
    body("destino").notEmpty().withMessage("El destino es obligatorio."),
    body("kilometros").isFloat({ min: 0 }).withMessage("Kilómetros inválidos."),
    body("observaciones").optional(),
  ],
  crearViaje
);

export default router;