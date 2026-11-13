import passport from "passport";

export function requiereAutenticacion(req, res, next) {
  passport.authenticate("jwt", { session: false }, (error, usuario) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al verificar el token." });
    }

    if (!usuario) {
      return res.status(401).json({ mensaje: "Token ausente o inválido." });
    }

    req.user = usuario;
    return next();
  })(req, res, next);
}