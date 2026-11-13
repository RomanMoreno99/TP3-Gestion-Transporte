import { useState } from "react";
import { apiRequest } from "../services/api.js";

export default function Login({ onLogin }) {
  const [modo, setModo] = useState("login");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviarFormulario(event) {
    event.preventDefault();
    setError("");
    setCargando(true);

    const form = new FormData(event.currentTarget);
    const datos = {
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    };

    if (modo === "register") {
      datos.nombre = String(form.get("nombre")).trim();
    }

    try {
      const respuesta = await apiRequest(`/auth/${modo}`, {
        method: "POST",
        body: datos,
      });

      onLogin(respuesta);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCargando(false);
    }
  }

  const esRegistro = modo === "register";

  return (
    <main className="login-page">
      <section className="panel login-panel">
        <p className="eyebrow">GESTIÓN DE TRANSPORTE</p>
        <h1>{esRegistro ? "Crear cuenta" : "Iniciar sesión"}</h1>
        <p className="muted">
          {esRegistro
            ? "Registrate para comenzar a gestionar tu flota."
            : "Ingresá para continuar con la gestión."}
        </p>

        {error && <p className="error-message" role="alert">{error}</p>}

        <form className="form" onSubmit={enviarFormulario}>
          {esRegistro && (
            <label>
              Nombre
              <input
                name="nombre"
                type="text"
                required
                maxLength="100"
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Email
            <input
              name="email"
              type="email"
              required
              maxLength="150"
              autoComplete="email"
            />
          </label>

          <label>
            Contraseña
            <input
              name="password"
              type="password"
              required
              minLength="6"
              autoComplete={esRegistro ? "new-password" : "current-password"}
            />
          </label>

          <button className="button primary-button" disabled={cargando}>
            {cargando ? "Procesando…" : esRegistro ? "Crear cuenta" : "Ingresar"}
          </button>
        </form>

        <p className="switch-mode">
          {esRegistro ? "¿Ya tenés cuenta?" : "¿No tenés cuenta?"}{" "}
          <button
            type="button"
            onClick={() => {
              setError("");
              setModo(esRegistro ? "login" : "register");
            }}
          >
            {esRegistro ? "Iniciar sesión" : "Registrate"}
          </button>
        </p>
      </section>
    </main>
  );
}