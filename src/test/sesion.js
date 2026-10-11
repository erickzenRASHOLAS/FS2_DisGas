import { iniciarSesion } from '../services/datosMock.js'

// Cuentas de demostración definidas en datosMock.js
const CUENTAS = {
  cliente: ['juan.perez@email.com', '123456'],
  repartidor: ['carlos.repartidor@volcan.cl', '123456'],
  operadora: ['ana.operadora@volcan.cl', '123456'],
  administrador: ['admin@volcan.cl', 'admin123'],
}

/** Inicia sesión como uno de los roles de demostración (cliente, repartidor, operadora, administrador). */
export function iniciarComo(rol) {
  return iniciarSesion(...CUENTAS[rol])
}
