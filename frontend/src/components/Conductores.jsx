import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

function fechaParaInput(fecha) {
  return fecha ? String(fecha).slice(0, 10) : "";
}

function mostrarFecha(fecha) {
  const valor = fechaParaInput(fecha);
  return valor ? valor.split("-").reverse().join("/") : "—";
}

export default function Conductores({ token, avisar }) {
  const [lista, setLista] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  async function cargar() {
    setCargando(true);
    setError("");

    try {
      const datos = await apiRequest("/conductores", { token });
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

  function nuevoConductor() {
    setEditando(null);
    setMostrarFormulario(true);
  }

  function editarConductor(conductor) {
    setEditando(conductor);
    setMostrarFormulario(true);
  }

  async function guardar(event) {
    event.preventDefault();
    setError("");
    setGuardando(true);

    const form = new FormData(event.currentTarget);
    const datos = {
      nombre: String(form.get("nombre")).trim(),
      apellido: String(form.get("apellido")).trim(),
      documento: String(form.get("documento")).trim(),
      numero_licencia: String(form.get("numero_licencia")).trim(),
      fecha_alta_licencia: form.get("fecha_alta_licencia"),
      fecha_vencimiento_licencia: form.get("fecha_vencimiento_licencia"),
    };

    try {
      await apiRequest(
        editando ? `/conductores/${editando.id}` : "/conductores",
        {
          method: editando ? "PUT" : "POST",
          body: datos,
          token,
        }
      );

      setMostrarFormulario(false);
      setEditando(null);
      avisar(editando ? "Conductor actualizado." : "Conductor creado.");
      await cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarConductor(conductor) {
    if (!window.confirm(`¿Eliminar a ${conductor.nombre} ${conductor.apellido}?`)) {
      return;
    }

    setError("");

    try {
      await apiRequest(`/conductores/${conductor.id}`, {
        method: "DELETE",
        token,
      });

      avisar("Conductor eliminado.");
      await cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section>
      <div className="section-title">
        <div>
          <p className="eyebrow">PERSONAL</p>
          <h1>Conductores</h1>
          <p className="muted">Registrá y administrá los conductores de la empresa.</p>
        </div>

        <button className="button primary-button" onClick={nuevoConductor}>
          + Agregar conductor
        </button>
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}

      {mostrarFormulario && (
        <form className="panel form-panel" onSubmit={guardar}>
          <h2>{editando ? "Editar conductor" : "Nuevo conductor"}</h2>

          <div className="form-grid">
            <label>
              Nombre
              <input
                name="nombre"
                required
                defaultValue={editando?.nombre || ""}
              />
            </label>

            <label>
              Apellido
              <input
                name="apellido"
                required
                defaultValue={editando?.apellido || ""}
              />
            </label>

            <label>
              Documento
              <input
                name="documento"
                required
                defaultValue={editando?.documento || ""}
              />
            </label>

            <label>
              Número de licencia
              <input
                name="numero_licencia"
                required
                defaultValue={editando?.numero_licencia || ""}
              />
            </label>

            <label>
              Fecha de alta de licencia
              <input
                name="fecha_alta_licencia"
                type="date"
                required
                defaultValue={fechaParaInput(editando?.fecha_alta_licencia)}
              />
            </label>

            <label>
              Vencimiento de licencia
              <input
                name="fecha_vencimiento_licencia"
                type="date"
                required
                defaultValue={fechaParaInput(editando?.fecha_vencimiento_licencia)}
              />
            </label>
          </div>

          <div className="button-row">
            <button
              type="button"
              className="button secondary-button"
              onClick={() => {
                setMostrarFormulario(false);
                setEditando(null);
              }}
            >
              Cancelar
            </button>

            <button className="button primary-button" disabled={guardando}>
              {guardando
                ? "Guardando…"
                : editando
                  ? "Guardar cambios"
                  : "Crear conductor"}
            </button>
          </div>
        </form>
      )}

      <div className="panel table-panel">
        <h2>
          Conductores registrados <span className="count">{lista.length}</span>
        </h2>

        {cargando ? (
          <p className="muted">Cargando conductores…</p>
        ) : lista.length === 0 ? (
          <p className="muted">Todavía no hay conductores registrados.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nombre y apellido</th>
                  <th>Documento</th>
                  <th>Número de licencia</th>
                  <th>Vencimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((conductor) => (
                  <tr key={conductor.id}>
                    <td>{conductor.nombre} {conductor.apellido}</td>
                    <td>{conductor.documento}</td>
                    <td>{conductor.numero_licencia}</td>
                    <td>{mostrarFecha(conductor.fecha_vencimiento_licencia)}</td>
                    <td className="actions">
                      <button onClick={() => editarConductor(conductor)}>
                        Editar
                      </button>
                      <button
                        className="danger"
                        onClick={() => eliminarConductor(conductor)}
                      >
                        Eliminar
                      </button>
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