import { vi } from 'vitest'

/**
 * Reemplaza fetch por un backend simulado.
 *   simularApi({ 'GET /v1/productos': [ ... ], 'POST /v1/boletas': { status: 201, body: {...} } })
 * Cada valor puede ser: los datos (responde 200), { status, body }, o una función (req) => lo anterior.
 * Devuelve la lista de llamadas hechas ({ metodo, ruta, body, auth }) para poder comprobarlas.
 */
export function simularApi(rutas = {}) {
  const llamadas = []
  const fetchFalso = vi.fn(async (url, opciones = {}) => {
    const ruta = String(url).replace(/^https?:\/\/[^/]+/, '')
    const metodo = opciones.method ?? 'GET'
    const body = opciones.body ? JSON.parse(opciones.body) : undefined
    const auth = opciones.headers?.Authorization
    llamadas.push({ metodo, ruta, body, auth })
    let respuesta = rutas[`${metodo} ${ruta}`]
    if (typeof respuesta === 'function') respuesta = respuesta({ metodo, ruta, body, auth })
    if (respuesta === undefined) respuesta = { status: 404, body: { status: 404, mensaje: `Sin simular: ${metodo} ${ruta}` } }
    const { status = 200, body: cuerpo } = respuesta && typeof respuesta === 'object' && 'status' in respuesta ? respuesta : { status: 200, body: respuesta }
    return new Response(status === 204 || cuerpo === undefined ? null : JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } })
  })
  vi.stubGlobal('fetch', fetchFalso)
  return llamadas
}

export const error = (status, mensaje, errores) => ({ status, body: { status, mensaje, ...(errores ? { errores } : {}) } })

export const CATEGORIAS = [{ id: 1, nombre: 'Gas' }, { id: 2, nombre: 'Accesorios' }]
export const PRODUCTOS = [
  { id: 1, nombre: 'Cilindro 5 kg', descripcion: 'Gas licuado 5 kg', precio: 10800, stock: 32, stockMinimo: 8, activo: true, categoria: CATEGORIAS[0] },
  { id: 2, nombre: 'Cilindro 15 kg', descripcion: 'Gas licuado 15 kg', precio: 27900, stock: 5, stockMinimo: 8, activo: true, categoria: CATEGORIAS[0] },
  { id: 3, nombre: 'Regulador de gas', descripcion: 'Regulador', precio: 12500, stock: 0, stockMinimo: 10, activo: true, categoria: CATEGORIAS[1] },
]
export const BOLETA = {
  id: 10, fecha: '2026-11-17T10:00:00', direccion: 'Av. Brasil 456, Chillán', estado: 'PENDIENTE', total: 21600,
  usuario: { id: 3, nombre: 'Juan Pérez', correo: 'juan.perez@email.com', telefono: '+56 9 1234 5678' },
  detalles: [{ id: 1, cantidad: 2, precioUnitario: 10800, subtotal: 21600, producto: PRODUCTOS[0] }],
}
