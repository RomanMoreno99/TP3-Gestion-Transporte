import passport from "passport";

export const authMiddleware = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error en la autenticación." });
    }

    if (!user) {
      return res.status(401).json({ mensaje: "Token inválido o ausente." });
    }

    req.user = user;
    next();
  })(req, res, next);
};