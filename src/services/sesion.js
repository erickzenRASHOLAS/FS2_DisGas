/*
 * Gestión de sesión del frontend (IE3.3.2).
 *
 * Qué se guarda y dónde:
 *   localStorage["disgas.sesion"] = { token, refreshToken, usuario }
 *   - token        : JWT de acceso (60 min). Va en cada petición: Authorization: Bearer <token>
 *   - refreshToken : JWT de renovación (7 días). Solo se usa en POST /v1/auth/refresh
 *   - usuario      : datos públicos del usuario (nombre, correo, rol...). NUNCA la contraseña.
 *
 * Como localStorage sobrevive a las recargas, la sesión se mantiene al presionar F5.
 * Si el refreshToken ya venció, la sesión se considera cerrada y se borra.
 */
const CLAVE = 'disgas.sesion';
export const EVENTO_SESION = 'disgas:sesion';

/** Lee el payload de un JWT (solo para saber cuándo vence; la firma la verifica el backend). */
export function leerPayload(jwt) {
  try {
    const parte = String(jwt).split('.')[1];
    const base64 = parte.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** true si el JWT ya venció (con 5 segundos de margen). Si no se puede leer, se considera vencido. */
export function tokenVencido(jwt) {
  const payload = leerPayload(jwt);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now() + 5000;
}

function notificar() {
  try { window.dispatchEvent(new Event(EVENTO_SESION)); } catch { /* sin window */ }
}

/** Texto crudo guardado (lo usa useSesion para detectar cambios). */
export function sesionCruda() {
  try { return window.localStorage.getItem(CLAVE); } catch { return null; }
}

export function obtenerSesion() {
  const crudo = sesionCruda();
  if (!crudo) return null;
  try {
    const sesion = JSON.parse(crudo);
    if (!sesion?.token || !sesion?.refreshToken || !sesion?.usuario) return null;
    return sesion;
  } catch {
    return null;
  }
}

export function guardarSesion({ token, refreshToken, usuario }) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify({ token, refreshToken, usuario }));
  } catch (error) {
    console.error('No fue posible guardar la sesión.', error);
  }
  notificar();
}

/** Actualiza solo los datos del usuario (ej: después de editar el perfil). */
export function actualizarUsuarioSesion(usuario) {
  const sesion = obtenerSesion();
  if (sesion) guardarSesion({ ...sesion, usuario });
}

export function cerrarSesion() {
  try { window.localStorage.removeItem(CLAVE); } catch { /* nada */ }
  notificar();
}

export const obtenerToken = () => obtenerSesion()?.token ?? null;
export const obtenerRefreshToken = () => obtenerSesion()?.refreshToken ?? null;

/** Usuario con sesión válida, o null. Si el refresh token venció, limpia la sesión. */
export function obtenerUsuarioActual() {
  const sesion = obtenerSesion();
  if (!sesion) return null;
  if (tokenVencido(sesion.refreshToken)) {
    cerrarSesion();
    return null;
  }
  return sesion.usuario;
}

export const tieneRol = (usuario, ...roles) => Boolean(usuario) && roles.includes(usuario.rol);

export const ETIQUETA_ROL = { ADMINISTRADOR: 'Administrador', VENDEDOR: 'Vendedor', CLIENTE: 'Cliente' };
export const etiquetaRol = (rol) => ETIQUETA_ROL[rol] ?? rol ?? '';
