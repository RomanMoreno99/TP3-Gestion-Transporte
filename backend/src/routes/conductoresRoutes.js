import { Router } from "express";
import { body, param } from "express-validator";
import {
  listarConductores,
  obtenerConductor,
  crearConductor,
  actualizarConductor,
  eliminarConductor,
} from "../controllers/conductoresController.js";
import { requiereAutenticacion } from "../middlewares/auth.js";

const router = Router();

router.use(requiereAutenticacion);

router.get("/", listarConductores);

router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("ID inválido")],
  obtenerConductor
);

router.post(
  "/",
  [
    body("nombre").notEmpty().withMessage("El nombre es obligatorio."),
    body("apellido").notEmpty().withMessage("El apellido es obligatorio."),
    body("documento").notEmpty().withMessage("El documento es obligatorio."),
    body("numero_licencia").notEmpty().withMessage("La licencia es obligatoria."),
    body("fecha_alta_licencia").isISO8601().withMessage("Fecha de alta inválida."),
    body("fecha_vencimiento_licencia").isISO8601().withMessage("Fecha de vencimiento inválida."),
  ],
  crearConductor
);

router.put(
  "/:id",
  [
    param("id").isInt({ min: 1 }).withMessage("ID inválido"),
    body("nombre").optional().notEmpty(),
    body("apellido").optional().notEmpty(),
    body("documento").optional().notEmpty(),
    body("numero_licencia").optional().notEmpty(),
    body("fecha_alta_licencia").optional().isISO8601(),
    body("fecha_vencimiento_licencia").optional().isISO8601(),
  ],
  actualizarConductor
);

router.delete(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("ID inválido")],
  eliminarConductor
);

export default router;