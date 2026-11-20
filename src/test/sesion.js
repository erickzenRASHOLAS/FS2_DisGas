import { guardarSesion } from '../services/sesion.js'

/** JWT falso (solo el payload importa en el frontend: la fecha de vencimiento). */
export function jwtFalso(segundosDeVida = 3600) {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + segundosDeVida }))
  return `cabecera.${payload}.firma`
}

// Usuarios con la misma forma que devuelve el backend (rol en MAYÚSCULAS)
export const USUARIOS = {
  CLIENTE: { id: 3, nombre: 'Juan Pérez', correo: 'juan.perez@email.com', telefono: '+56 9 1234 5678', direccion: 'Av. Brasil 456, Chillán', rol: 'CLIENTE', activo: true },
  VENDEDOR: { id: 2, nombre: 'Ana Vendedora', correo: 'ana.vendedora@volcan.cl', telefono: '+56 9 3333 2222', direccion: 'Oficina Central', rol: 'VENDEDOR', activo: true },
  ADMINISTRADOR: { id: 1, nombre: 'Admin Volcán', correo: 'admin@volcan.cl', telefono: '+56 9 9999 8888', direccion: 'Oficina Central', rol: 'ADMINISTRADOR', activo: true },
}

/** Deja una sesión iniciada en localStorage como si el login ya hubiera ocurrido. */
export function iniciarComo(rol) {
  const usuario = USUARIOS[rol.toUpperCase()]
  guardarSesion({ token: 'token-de-prueba', refreshToken: jwtFalso(), usuario })
  return usuario
}
