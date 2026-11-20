/*
 * Cliente HTTP único del frontend (IE3.2.2: integración front <-> back por REST).
 *
 * - Todas las llamadas al backend pasan por aquí (usa fetch).
 * - Agrega solo el header Authorization: Bearer <token>.
 * - Si el backend responde 401 (token de acceso vencido), pide un token nuevo con el
 *   refreshToken (POST /v1/auth/refresh) y repite la petición UNA vez.
 * - Si tampoco se puede renovar, cierra la sesión y avisa con un ApiError 401.
 * - Los errores del backend ({status, mensaje, errores}) se convierten en ApiError.
 */
import { cerrarSesion, guardarSesion, obtenerRefreshToken, obtenerSesion, obtenerToken } from './sesion.js';

export const API_URL = (import.meta.env?.VITE_API_URL ?? 'http://localhost:8080').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(status, mensaje, errores = []) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.errores = errores;
  }
}

async function leerCuerpo(respuesta) {
  if (respuesta.status === 204) return null;
  const texto = await respuesta.text();
  if (!texto) return null;
  try { return JSON.parse(texto); } catch { return texto; }
}

async function enviar(ruta, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    return await fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.');
  }
}

// Si varias peticiones fallan a la vez, se renueva una sola vez y todas esperan ese resultado.
let renovacionEnCurso = null;

async function renovarToken() {
  if (!renovacionEnCurso) {
    renovacionEnCurso = (async () => {
      const refreshToken = obtenerRefreshToken();
      if (!refreshToken) return false;
      const respuesta = await enviar('/v1/auth/refresh', { method: 'POST', body: { refreshToken } });
      if (!respuesta.ok) return false;
      const datos = await leerCuerpo(respuesta);
      guardarSesion({ token: datos.token, refreshToken: datos.refreshToken, usuario: datos.usuario });
      return true;
    })().finally(() => { renovacionEnCurso = null; });
  }
  return renovacionEnCurso;
}

function aError(respuesta, cuerpo) {
  const mensaje = (cuerpo && typeof cuerpo === 'object' && cuerpo.mensaje) || `Error ${respuesta.status} del servidor.`;
  const errores = (cuerpo && typeof cuerpo === 'object' && cuerpo.errores) || [];
  return new ApiError(respuesta.status, mensaje, errores);
}

/**
 * @param {string} ruta  Ej: '/v1/productos'
 * @param {{method?: string, body?: unknown, auth?: boolean}} opciones  auth=false para rutas públicas
 */
export async function peticion(ruta, { method = 'GET', body, auth = true } = {}) {
  const tokenUsado = auth ? obtenerToken() : null;
  let respuesta = await enviar(ruta, { method, body, token: tokenUsado });

  if (respuesta.status === 401 && auth && obtenerSesion()) {
    // Si otra petición ya renovó el token mientras esta viajaba, basta con reintentar con el nuevo.
    const yaRenovado = obtenerToken() !== tokenUsado;
    if (!yaRenovado && !(await renovarToken())) {
      cerrarSesion();
      throw new ApiError(401, 'Tu sesión expiró. Inicia sesión nuevamente.');
    }
    respuesta = await enviar(ruta, { method, body, token: obtenerToken() });
  }

  const cuerpo = await leerCuerpo(respuesta);
  if (!respuesta.ok) throw aError(respuesta, cuerpo);
  return cuerpo;
}

export const api = {
  get: (ruta, opciones) => peticion(ruta, { ...opciones, method: 'GET' }),
  post: (ruta, body, opciones) => peticion(ruta, { ...opciones, method: 'POST', body }),
  put: (ruta, body, opciones) => peticion(ruta, { ...opciones, method: 'PUT', body }),
  delete: (ruta, opciones) => peticion(ruta, { ...opciones, method: 'DELETE' }),
};

/** Texto listo para mostrar al usuario a partir de cualquier error. */
export function mensajeDeError(error, porDefecto = 'Ocurrió un error inesperado.') {
  if (error instanceof ApiError) {
    return error.errores?.length ? `${error.message}: ${error.errores.join('; ')}` : error.message;
  }
  return porDefecto;
}
