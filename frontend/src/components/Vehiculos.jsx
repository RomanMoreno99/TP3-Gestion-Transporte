import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

const imagenes = [
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85",
];

export default function Vehiculos({ token, avisar }) {
  const [lista, setLista] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    setError("");

    try {
      const datos = await apiRequest("/vehiculos", { token });
      setLista(Array.isArray(datos) ? datos : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, [token]);

  function abrirNuevo() {
    setEditando(null);
    setMostrarFormulario(true);
  }

  function abrirEdicion(vehiculo) {
    setEditando(vehiculo);
    setMostrarFormulario(true);
  }

  async function guardar(event) {
    event.preventDefault();
    setError("");
    setGuardando(true);

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
      avisar(editando ? "Vehículo actualizado." : "Vehículo agregado.");
      await cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
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
    <section className="vehicles-page">
      <div className="section-title">
        <div>
          <p className="eyebrow">TU FLOTA / VEHÍCULOS</p>
          <h1>En movimiento.</h1>
          <p className="muted">
            Todos tus vehículos, organizados en un solo lugar.
          </p>
        </div>

        <button className="button primary-button" onClick={abrirNuevo}>
          <span aria-hidden="true">＋</span> Agregar vehículo
        </button>
      </div>

      <div className="fleet-summary">
        <div>
          <span className="summary-label">VEHÍCULOS EN FLOTA</span>
          <strong>{String(lista.length).padStart(2, "0")}</strong>
        </div>
        <span className="summary-decoration" aria-hidden="true">↗</span>
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}

      {mostrarFormulario && (
        <form className="panel vehicle-form" onSubmit={guardar}>
          <div className="form-title-row">
            <div>
              <p className="eyebrow">{editando ? "ACTUALIZACIÓN" : "NUEVO REGISTRO"}</p>
              <h2>{editando ? "Editar vehículo" : "Sumar a la flota"}</h2>
            </div>
            <button
              type="button"
              className="close-button"
              onClick={() => setMostrarFormulario(false)}
              aria-label="Cerrar formulario"
            >
              ×
            </button>
          </div>

          <div className="form-grid">
            <label>
              Marca
              <input name="marca" required maxLength="80" defaultValue={editando?.marca || ""} />
            </label>
            <label>
              Modelo
              <input name="modelo" required maxLength="80" defaultValue={editando?.modelo || ""} />
            </label>
            <label>
              Patente
              <input name="patente" required maxLength="20" defaultValue={editando?.patente || ""} />
            </label>
            <label>
              Año
              <input
                name="anio"
                type="number"
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                defaultValue={editando?.anio || ""}
              />
            </label>
            <label>
              Capacidad de carga (kg)
              <input
                name="capacidad_carga"
                type="number"
                required
                min="0"
                step="0.01"
                defaultValue={editando?.capacidad_carga || ""}
              />
            </label>
          </div>

          <div className="button-row">
            <button
              type="button"
              className="button secondary-button"
              onClick={() => setMostrarFormulario(false)}
            >
              Cancelar
            </button>
            <button className="button primary-button" disabled={guardando}>
              {guardando ? "Guardando…" : editando ? "Guardar cambios" : "Crear vehículo"}
            </button>
          </div>
        </form>
      )}

      <div className="vehicles-heading">
        <h2>Tu selección</h2>
        <span>{lista.length} {lista.length === 1 ? "vehículo" : "vehículos"}</span>
      </div>

      {cargando ? (
        <div className="empty-state">Cargando vehículos…</div>
      ) : lista.length === 0 ? (
        <div className="empty-state">
          <span className="empty-symbol" aria-hidden="true">↗</span>
          <h3>La ruta empieza acá</h3>
          <p>Agregá tu primer vehículo para empezar a organizar la flota.</p>
          <button className="button primary-button" onClick={abrirNuevo}>
            Agregar vehículo
          </button>
        </div>
      ) : (
        <div className="vehicle-grid">
          {lista.map((vehiculo, index) => (
            <article className="vehicle-card" key={vehiculo.id}>
              <div className="vehicle-photo">
                <img
                  src={imagenes[index % imagenes.length]}
                  alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.visibility = "hidden";
                  }}
                />
                <span className="vehicle-number">
                  UNIDAD {String(index + 1).padStart(2, "0")}
                </span>
                <span className="vehicle-year">{vehiculo.anio}</span>
              </div>

              <div className="vehicle-card-content">
                <div className="vehicle-title-row">
                  <div>
                    <p className="eyebrow">{vehiculo.marca}</p>
                    <h3>{vehiculo.modelo}</h3>
                  </div>
                  <span className="vehicle-arrow" aria-hidden="true">↗</span>
                </div>

                <div className="vehicle-details">
                  <div>
                    <span>PATENTE</span>
                    <strong>{vehiculo.patente}</strong>
                  </div>
                  <div>
                    <span>CAPACIDAD</span>
                    <strong>
                      {Number(vehiculo.capacidad_carga).toLocaleString("es-AR")} kg
                    </strong>
                  </div>
                </div>

                <div className="vehicle-actions">
                  <button onClick={() => abrirEdicion(vehiculo)}>Editar</button>
                  <button className="danger-action" onClick={() => eliminar(vehiculo)}>
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}