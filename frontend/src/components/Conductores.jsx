import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

const inicial = {
  marca: "",
  modelo: "",
  patente: "",
  anio: "",
  capacidad_carga: "",
};

export default function Vehiculos({ token, avisar }) {
  const [lista, setLista] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  async function cargar() {
    setCargando(true);
    setError("");

    try {
      const datos = await apiRequest("/vehiculos", { token });
      setLista(datos);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, [token]);

  function nuevoVehiculo() {
    setEditando(null);
    setMostrarFormulario(true);
  }

  function editarVehiculo(vehiculo) {
    setEditando(vehiculo);
    setMostrarFormulario(true);
  }

  async function guardar(event) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const datos = {
      marca: String(form.get("marca")).trim(),
      modelo: String(form.get("modelo")).trim(),
      patente: String(form.get("patente")).trim().toUpperCase(),
      anio: Number(form.get("anio")),
      capacidad_carga: Number(form.get("capacidad_carga")),
    };

    try {
      await apiRequest(editando ? `/vehiculos/${editando.id}` : "/vehiculos", {
        method: editando ? "PUT" : "POST",
        body: datos,
        token,
      });

      setMostrarFormulario(false);
      setEditando(null);
      avisar(editando ? "Vehículo actualizado." : "Vehículo creado.");
      await cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  async function eliminar(vehiculo) {
    if (!window.confirm(`¿Eliminar el vehículo ${vehiculo.patente}?`)) return;

    setError("");

    try {
      await apiRequest(`/vehiculos/${vehiculo.id}`, {
        method: "DELETE",
        token,
      });

      avisar("Vehículo eliminado.");
      await cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section>
      <div className="section-title">
        <div>
          <p className="eyebrow">FLOTA</p>
          <h1>Vehículos</h1>
          <p className="muted">Registrá y administrá los vehículos de la empresa.</p>
        </div>
        <button className="button primary-button" onClick={nuevoVehiculo}>
          + Agregar vehículo
        </button>
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}

      {mostrarFormulario && (
        <form className="panel form-panel" onSubmit={guardar}>
          <h2>{editando ? "Editar vehículo" : "Nuevo vehículo"}</h2>

          <div className="form-grid">
            <label>Marca<input name="marca" required maxLength="80" defaultValue={editando?.marca || ""} /></label>
            <label>Modelo<input name="modelo" required maxLength="80" defaultValue={editando?.modelo || ""} /></label>
            <label>Patente<input name="patente" required maxLength="20" defaultValue={editando?.patente || ""} /></label>
            <label>Año<input name="anio" type="number" required min="1900" max={new Date().getFullYear() + 1} defaultValue={editando?.anio || ""} /></label>
            <label>Capacidad de carga (kg)<input name="capacidad_carga" type="number" required min="0" step="0.01" defaultValue={editando?.capacidad_carga || ""} /></label>
          </div>

          <div className="button-row">
            <button type="button" className="button secondary-button" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
            <button className="button primary-button">{editando ? "Guardar cambios" : "Crear vehículo"}</button>
          </div>
        </form>
      )}

      <div className="panel table-panel">
        <h2>Vehículos registrados <span className="count">{lista.length}</span></h2>

        {cargando ? (
          <p className="muted">Cargando vehículos…</p>
        ) : lista.length === 0 ? (
          <p className="muted">Todavía no hay vehículos registrados.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Marca y modelo</th><th>Patente</th><th>Año</th><th>Capacidad</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {lista.map((v) => (
                  <tr key={v.id}>
                    <td>{v.marca} {v.modelo}</td>
                    <td>{v.patente}</td>
                    <td>{v.anio}</td>
                    <td>{Number(v.capacidad_carga).toLocaleString("es-AR")} kg</td>
                    <td className="actions">
                      <button onClick={() => editarVehiculo(v)}>Editar</button>
                      <button className="danger" onClick={() => eliminar(v)}>Eliminar</button>
                    </td>
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