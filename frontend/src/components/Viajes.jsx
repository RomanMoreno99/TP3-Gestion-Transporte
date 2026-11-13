import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

const hoyLocal = () => {
  const fecha = new Date();
  fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
  return fecha.toISOString().slice(0, 16);
};

export default function Viajes({ token, avisar }) {
  const [viajes, setViajes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [idFiltro, setIdFiltro] = useState("");
  const [totalKm, setTotalKm] = useState(null);
  const [error, setError] = useState("");

  async function cargarDatos() {
    setError("");

    try {
      const [listaViajes, listaVehiculos, listaConductores] = await Promise.all([
        apiRequest("/viajes", { token }),
        apiRequest("/vehiculos", { token }),
        apiRequest("/conductores", { token }),
      ]);

      setViajes(listaViajes);
      setVehiculos(listaVehiculos);
      setConductores(listaConductores);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, [token]);

  async function registrar(event) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const fechaLlegada = form.get("fecha_llegada");

    const datos = {
      vehiculo_id: Number(form.get("vehiculo_id")),
      conductor_id: Number(form.get("conductor_id")),
      fecha_salida: form.get("fecha_salida"),
      fecha_llegada: fechaLlegada || null,
      origen: String(form.get("origen")).trim(),
      destino: String(form.get("destino")).trim(),
      kilometros: Number(form.get("kilometros")),
      observaciones: String(form.get("observaciones")).trim(),
    };

    try {
      await apiRequest("/viajes", { method: "POST", body: datos, token });
      event.currentTarget.reset();
      avisar("Viaje registrado.");
      await cargarDatos();
    } catch (e) {
      setError(e.message);
    }
  }

  async function consultarHistorial(event) {
    event.preventDefault();
    setError("");
    setTotalKm(null);

    if (filtro === "todos") {
      await cargarDatos();
      return;
    }

    if (!idFiltro) {
      setError("Elegí un vehículo o conductor para consultar.");
      return;
    }

    try {
      const tipo = filtro === "vehiculo" ? "vehiculo" : "conductor";
      const [historial, total] = await Promise.all([
        apiRequest(`/viajes/${tipo}/${idFiltro}`, { token }),
        apiRequest(`/viajes/total/${tipo}/${idFiltro}`, { token }),
      ]);

      setViajes(historial);
      setTotalKm(total.total_km);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section>
      <div className="section-title">
        <div>
          <p className="eyebrow">RECORRIDOS</p>
          <h1>Viajes</h1>
          <p className="muted">Registrá recorridos y consultá los kilómetros realizados.</p>
        </div>
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}

      <form className="panel form-panel" onSubmit={registrar}>
        <h2>Registrar viaje</h2>

        <div className="form-grid">
          <label>Vehículo
            <select name="vehiculo_id" required defaultValue="">
              <option value="" disabled>Seleccioná un vehículo</option>
              {vehiculos.map((v) => <option key={v.id} value={v.id}>{v.marca} {v.modelo} — {v.patente}</option>)}
            </select>
          </label>

          <label>Conductor
            <select name="conductor_id" required defaultValue="">
              <option value="" disabled>Seleccioná un conductor</option>
              {conductores.map((c) => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
            </select>
          </label>

          <label>Fecha de salida<input name="fecha_salida" type="datetime-local" required defaultValue={hoyLocal()} /></label>
          <label>Fecha de llegada<input name="fecha_llegada" type="datetime-local" /></label>
          <label>Origen<input name="origen" required maxLength="150" /></label>
          <label>Destino<input name="destino" required maxLength="150" /></label>
          <label>Kilómetros<input name="kilometros" type="number" required min="0" step="0.01" /></label>
          <label>Observaciones<input name="observaciones" /></label>
        </div>

        <div className="button-row">
          <button className="button primary-button">Guardar viaje</button>
        </div>
      </form>

      <form className="panel filter-panel" onSubmit={consultarHistorial}>
        <h2>Historial y kilómetros</h2>

        <div className="filter-row">
          <label>Consultar por
            <select value={filtro} onChange={(e) => { setFiltro(e.target.value); setIdFiltro(""); setTotalKm(null); }}>
              <option value="todos">Todos los viajes</option>
              <option value="vehiculo">Vehículo</option>
              <option value="conductor">Conductor</option>
            </select>
          </label>

          {filtro === "vehiculo" && (
            <label>Vehículo
              <select value={idFiltro} onChange={(e) => setIdFiltro(e.target.value)}>
                <option value="">Seleccioná un vehículo</option>
                {vehiculos.map((v) => <option key={v.id} value={v.id}>{v.marca} {v.modelo} — {v.patente}</option>)}
              </select>
            </label>
          )}

          {filtro === "conductor" && (
            <label>Conductor
              <select value={idFiltro} onChange={(e) => setIdFiltro(e.target.value)}>
                <option value="">Seleccioná un conductor</option>
                {conductores.map((c) => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
              </select>
            </label>
          )}

          <button className="button secondary-button">Consultar</button>
        </div>

        {totalKm !== null && <p className="total-km">Kilómetros totales: <strong>{Number(totalKm).toLocaleString("es-AR")} km</strong></p>}
      </form>

      <div className="panel table-panel">
        <h2>Viajes <span className="count">{viajes.length}</span></h2>

        {viajes.length === 0 ? (
          <p className="muted">Todavía no hay viajes para mostrar.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Salida</th><th>Origen</th><th>Destino</th><th>Vehículo</th><th>Conductor</th><th>Km</th></tr>
              </thead>
              <tbody>
                {viajes.map((v) => (
                  <tr key={v.id}>
                    <td>{String(v.fecha_salida).replace("T", " ").slice(0, 16)}</td>
                    <td>{v.origen}</td>
                    <td>{v.destino}</td>
                    <td>{v.patente || `ID ${v.vehiculo_id}`}</td>
                    <td>{v.nombre ? `${v.nombre} ${v.apellido}` : `ID ${v.conductor_id}`}</td>
                    <td>{Number(v.kilometros).toLocaleString("es-AR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}