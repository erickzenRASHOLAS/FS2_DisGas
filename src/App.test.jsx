import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App.jsx'
import { iniciarComo } from './test/sesion.js'
import { BOLETA, CATEGORIAS, PRODUCTOS, simularApi } from './test/fakeApi.js'

function renderApp(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
}

// Backend simulado con lo mínimo que piden las pantallas
const api = () => simularApi({
  'GET /v1/productos': PRODUCTOS, 'GET /v1/productos/todos': PRODUCTOS, 'GET /v1/categorias': CATEGORIAS,
  'GET /v1/boletas': [BOLETA], 'GET /v1/usuarios': [], 'GET /v1/perfil': () => ({ status: 200, body: JSON.parse(localStorage.getItem('disgas.sesion')).usuario }),
})

describe('App · rutas públicas', () => {
  it('muestra la portada en /', () => {
    renderApp('/')
    expect(screen.getByRole('heading', { name: /pide tu cilindro aquí/i })).toBeInTheDocument()
  })

  it('muestra el login en /login', () => {
    renderApp('/login')
    expect(screen.getByRole('heading', { name: /sucursal virtual/i })).toBeInTheDocument()
  })

  it('muestra el registro en /registro', () => {
    renderApp('/registro')
    expect(screen.getByRole('heading', { name: /crea tu cuenta/i })).toBeInTheDocument()
  })

  it('muestra la página 404 para una ruta inexistente', () => {
    renderApp('/ruta-que-no-existe')
    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument()
  })
})

describe('App · protección de rutas por rol (RequireRole)', () => {
  it('redirige al login cuando no hay sesión', () => {
    renderApp('/pedido')
    expect(screen.getByRole('heading', { name: /sucursal virtual/i })).toBeInTheDocument()
  })

  it('permite al cliente entrar a /pedido', async () => {
    api(); iniciarComo('CLIENTE')
    renderApp('/pedido')
    expect(await screen.findByRole('heading', { name: /crear pedido/i })).toBeInTheDocument()
  })

  it('redirige al cliente a Mis pedidos si intenta entrar a /admin', async () => {
    api(); iniciarComo('CLIENTE')
    renderApp('/admin')
    expect(await screen.findByRole('heading', { name: /mis pedidos/i })).toBeInTheDocument()
  })

  it('redirige al cliente si intenta entrar a /inventario', async () => {
    api(); iniciarComo('CLIENTE')
    renderApp('/inventario')
    expect(await screen.findByRole('heading', { name: /mis pedidos/i })).toBeInTheDocument()
  })

  it('el vendedor puede ver /ordenes e /inventario pero no /admin ni /pedido', async () => {
    api(); iniciarComo('VENDEDOR')
    const a = renderApp('/ordenes')
    expect(await screen.findByRole('heading', { name: /^órdenes$/i })).toBeInTheDocument()
    a.unmount()
    const b = renderApp('/inventario')
    expect(await screen.findByRole('heading', { name: /inventario de productos/i })).toBeInTheDocument()
    b.unmount()
    const c = renderApp('/admin')
    expect(await screen.findByRole('heading', { name: /^órdenes$/i })).toBeInTheDocument()
    c.unmount()
    renderApp('/pedido')
    expect(await screen.findByRole('heading', { name: /^órdenes$/i })).toBeInTheDocument()
  })

  it('el administrador entra a /admin', async () => {
    api(); iniciarComo('ADMINISTRADOR')
    renderApp('/admin')
    expect(await screen.findByRole('heading', { name: /gestión de usuarios/i })).toBeInTheDocument()
  })

  it('al recargar con una sesión guardada sigue dentro (persistencia)', async () => {
    api(); iniciarComo('ADMINISTRADOR')
    renderApp('/inventario')   // equivale a presionar F5 en /inventario
    expect(await screen.findByRole('heading', { name: /inventario de productos/i })).toBeInTheDocument()
  })
})
