import express from "express";
import cors from "cors";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import vehiculosRoutes from "./routes/vehiculosRoutes.js";
import conductoresRoutes from "./routes/conductoresRoutes.js";
import viajesRoutes from "./routes/viajesRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.json({ mensaje: "API de gestión de transporte" });
});

app.use("/api/auth", authRoutes);
app.use("/api/vehiculos", vehiculosRoutes);
app.use("/api/conductores", conductoresRoutes);
app.use("/api/viajes", viajesRoutes);

app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no encontrada." });
});

export default app;
