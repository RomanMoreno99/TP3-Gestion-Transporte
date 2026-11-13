const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("No se pudo conectar con el backend. Verificá que esté iniciado.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errores = data.errores?.map((error) => error.msg).filter(Boolean);
    throw new Error(errores?.join(" ") || data.mensaje || `Error HTTP ${response.status}`);
  }

  return data;
}