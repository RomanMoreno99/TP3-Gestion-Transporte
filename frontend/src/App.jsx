import { useState } from "react";
import Login from "./components/Login.jsx";
import Vehiculos from "./components/Vehiculos.jsx";
import Conductores from "./components/Conductores.jsx";
import Viajes from "./components/Viajes.jsx";

function leerSesion() {
  try {
    return {
      token: localStorage.getItem("token"),
      usuario: JSON.parse(localStorage.getItem("usuario") || "null"),
    };
  } catch {
    return { token: null, usuario: null };
  }
}

export default function App() {
  const [sesion, setSesion] = useState(leerSesion);
  const [pestana, setPestana] = useState("vehiculos");
  const [aviso, setAviso] = useState("");

  function iniciarSesion(datos) {
    localStorage.setItem("token", datos.token);
    localStorage.setItem("usuario", JSON.stringify(datos.usuario));
    setSesion({ token: datos.token, usuario: datos.usuario });
    setPestana("vehiculos");
  }

  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setSesion({ token: null, usuario: null });
    setAviso("");
  }

  if (!sesion.token) {
    return <Login onLogin={iniciarSesion} />;
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#inicio">Transporte<span>.</span></a>
        <div className="account">
          <span>{sesion.usuario?.nombre || sesion.usuario?.email}</span>
          <button className="button secondary-button" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </header>

      {aviso && (
        <div className="success-message" role="status">
          {aviso}
          <button onClick={() => setAviso("")} aria-label="Cerrar aviso">×</button>
        </div>
      )}

      <main className="layout">
        <nav className="tabs" aria-label="Secciones">
          <button className={pestana === "vehiculos" ? "tab active" : "tab"} onClick={() => setPestana("vehiculos")}>Vehículos</button>
          <button className={pestana === "conductores" ? "tab active" : "tab"} onClick={() => setPestana("conductores")}>Conductores</button>
          <button className={pestana === "viajes" ? "tab active" : "tab"} onClick={() => setPestana("viajes")}>Viajes</button>
        </nav>

        {pestana === "vehiculos" && <Vehiculos token={sesion.token} avisar={setAviso} />}
        {pestana === "conductores" && <Conductores token={sesion.token} avisar={setAviso} />}
        {pestana === "viajes" && <Viajes token={sesion.token} avisar={setAviso} />}
      </main>
    </div>
  );
}