import express from "express";
import cors from "cors";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(passport.initialize());

app.get("/", (req, res) => {
  res.json({ mensaje: "API de gestión de transporte" });
});

app.use("/api/auth", authRoutes);

export default app;