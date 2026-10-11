import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App.jsx'
import { iniciarComo } from './test/sesion.js'

function renderApp(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
}

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
    expect(screen.getByRole('link', { name: /volver al inicio/i })).toHaveAttribute('href', '/')
  })
})

describe('App · protección de rutas por rol (RequireRole)', () => {
  it('redirige al login cuando no hay sesión', () => {
    renderApp('/pedido')
    expect(screen.getByRole('heading', { name: /sucursal virtual/i })).toBeInTheDocument()
  })

  it('permite al cliente entrar a /pedido', () => {
    iniciarComo('cliente')
    renderApp('/pedido')
    expect(screen.getByRole('heading', { name: /crear pedido/i })).toBeInTheDocument()
  })

  it('redirige al cliente a Mis pedidos si intenta entrar a /admin', () => {
    iniciarComo('cliente')
    renderApp('/admin')
    expect(screen.getByRole('heading', { name: /mis pedidos/i })).toBeInTheDocument()
  })

  it('redirige al repartidor a su vista si intenta entrar a /inventario', () => {
    iniciarComo('repartidor')
    renderApp('/inventario')
    expect(screen.getByRole('heading', { name: /mis entregas/i })).toBeInTheDocument()
  })

  it('redirige a la operadora a su panel si intenta entrar a Mis pedidos', () => {
    iniciarComo('operadora')
    renderApp('/mis-pedidos')
    expect(screen.getByRole('heading', { name: /panel de despacho/i })).toBeInTheDocument()
  })

  it('permite al administrador entrar a usuarios, inventario y despacho', () => {
    iniciarComo('administrador')
    const usuarios = renderApp('/admin')
    expect(screen.getByRole('heading', { name: /gestión de usuarios/i })).toBeInTheDocument()
    usuarios.unmount()

    const inventario = renderApp('/inventario')
    expect(screen.getByRole('heading', { name: /inventario de cilindros/i })).toBeInTheDocument()
    inventario.unmount()

    renderApp('/operadora')
    expect(screen.getByRole('heading', { name: /panel de despacho/i })).toBeInTheDocument()
  })
})
