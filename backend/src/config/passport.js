import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import pool from "./db.js";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("Falta configurar JWT_SECRET en el archivo .env");
}

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    },
    async (payload, done) => {
      try {
        const [usuarios] = await pool.query(
          "SELECT id, nombre, email FROM usuarios WHERE id = ?",
          [payload.id]
        );

        if (usuarios.length === 0) {
          return done(null, false);
        }

        return done(null, usuarios[0]);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;