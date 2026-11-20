import { beforeEach, describe, expect, it } from 'vitest'
import { simularApi, error } from '../test/fakeApi.js'
import { iniciarComo, jwtFalso, USUARIOS } from '../test/sesion.js'
import { ApiError, mensajeDeError } from './api.js'
import { authApi, boletasApi, productosApi } from './servicios.js'
import { guardarSesion, obtenerSesion, obtenerToken, obtenerUsuarioActual } from './sesion.js'

beforeEach(() => localStorage.clear())

describe('authApi.login', () => {
  it('guarda token, refreshToken y usuario, y la sesión sobrevive a una "recarga"', async () => {
    simularApi({ 'POST /v1/auth/login': { token: 'ACC1', refreshToken: jwtFalso(), usuario: USUARIOS.CLIENTE } })
    const usuario = await authApi.login(' juan.perez@email.com ', '123456')
    expect(usuario.rol).toBe('CLIENTE')
    expect(obtenerToken()).toBe('ACC1')
    expect(obtenerUsuarioActual().correo).toBe('juan.perez@email.com')   // se relee de localStorage
  })

  it('con credenciales malas lanza ApiError 401 y no guarda sesión', async () => {
    simularApi({ 'POST /v1/auth/login': error(401, 'Correo o contraseña incorrectos') })
    await expect(authApi.login('a@a.cl', 'mal')).rejects.toMatchObject({ status: 401, message: /incorrectos/i })
    expect(obtenerSesion()).toBeNull()
  })
})

describe('peticiones autenticadas', () => {
  it('envía Authorization: Bearer en rutas privadas y no en las públicas', async () => {
    iniciarComo('CLIENTE')
    const llamadas = simularApi({ 'GET /v1/boletas': [], 'GET /v1/productos': [] })
    await boletasApi.listar()
    await productosApi.listar()
    expect(llamadas[0].auth).toBe('Bearer token-de-prueba')
    expect(llamadas[1].auth).toBeUndefined()
  })

  it('renueva el token una sola vez cuando varias peticiones reciben 401', async () => {
    iniciarComo('CLIENTE')
    let acceso = 'otro'
    const llamadas = simularApi({
      'POST /v1/auth/refresh': () => { acceso = 'NUEVO'; return { token: 'NUEVO', refreshToken: jwtFalso(), usuario: USUARIOS.CLIENTE } },
      'GET /v1/boletas': ({ auth }) => (auth === `Bearer ${acceso}` ? [{ id: 1 }] : error(401, 'vencido')),
    })
    const r = await Promise.all([boletasApi.listar(), boletasApi.listar(), boletasApi.listar()])
    expect(r).toHaveLength(3)
    expect(llamadas.filter((l) => l.ruta === '/v1/auth/refresh')).toHaveLength(1)
    expect(obtenerToken()).toBe('NUEVO')
  })

  it('si no se puede renovar, cierra la sesión', async () => {
    iniciarComo('CLIENTE')
    simularApi({ 'GET /v1/boletas': error(401, 'vencido'), 'POST /v1/auth/refresh': error(401, 'refresh inválido') })
    await expect(boletasApi.listar()).rejects.toMatchObject({ status: 401, message: /expir/i })
    expect(obtenerSesion()).toBeNull()
  })

  it('una sesión con refreshToken vencido se considera cerrada', () => {
    guardarSesion({ token: 't', refreshToken: jwtFalso(-10), usuario: USUARIOS.CLIENTE })
    expect(obtenerUsuarioActual()).toBeNull()
    expect(obtenerSesion()).toBeNull()
  })
})

describe('errores', () => {
  it('muestra el mensaje y la lista de validaciones del backend', async () => {
    iniciarComo('ADMINISTRADOR')
    simularApi({ 'POST /v1/productos': error(400, 'Datos invalidos', ['precio: El precio es obligatorio']) })
    const e = await productosApi.crear({}).catch((x) => x)
    expect(e).toBeInstanceOf(ApiError)
    expect(mensajeDeError(e)).toMatch(/precio: El precio es obligatorio/)
  })

  it('responde con un mensaje claro si el backend está apagado', async () => {
    const { vi } = await import('vitest')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(authApi.login('a@a.cl', 'x')).rejects.toMatchObject({ status: 0, message: /No se pudo conectar/ })
  })
})
