import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Navbar from './Navbar.jsx'
import UbicacionActual from '../test/UbicacionActual.jsx'
import { iniciarComo } from '../test/sesion.js'

function renderNavbar(ruta = '/') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Navbar />
      <UbicacionActual />
    </MemoryRouter>,
  )
}

describe('Navbar · enlaces según el rol', () => {
  it('sin sesión solo ofrece la marca y el acceso Ingresar', () => {
    renderNavbar()
    expect(screen.getByRole('link', { name: /gas el volcán/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('link', { name: /mis pedidos/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /cerrar sesión/i })).not.toBeInTheDocument()
  })

  it('el cliente ve sus enlaces y no ve los de administración', () => {
    iniciarComo('cliente')
    renderNavbar()
    expect(screen.getByRole('link', { name: 'Pedir cilindro' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mis pedidos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mi perfil' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Inventario' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Despacho' })).not.toBeInTheDocument()
  })

  it('la operadora ve el despacho pero no el inventario', () => {
    iniciarComo('operadora')
    renderNavbar()
    expect(screen.getByRole('link', { name: 'Despacho' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mi perfil' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Inventario' })).not.toBeInTheDocument()
  })

  it('el repartidor ve su vista y no puede pedir cilindros', () => {
    iniciarComo('repartidor')
    renderNavbar()
    expect(screen.getByRole('link', { name: 'Repartidor' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Pedir cilindro' })).not.toBeInTheDocument()
  })

  it('el administrador ve inventario, usuarios y despacho', () => {
    iniciarComo('administrador')
    renderNavbar()
    expect(screen.getByRole('link', { name: 'Inventario' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Usuarios' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Despacho' })).toBeInTheDocument()
  })
})

describe('Navbar · sesión y menú móvil', () => {
  it('cerrar sesión borra el usuario actual y navega al login', async () => {
    const user = userEvent.setup()
    iniciarComo('cliente')
    renderNavbar('/mis-pedidos')
    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }))
    expect(localStorage.getItem('usuarioActual')).toBeNull()
    expect(screen.getByTestId('ruta-actual')).toHaveTextContent('/login')
    expect(screen.getByRole('link', { name: 'Ingresar' })).toBeInTheDocument()
  })

  it('el botón de menú abre y cierra el menú móvil', async () => {
    const user = userEvent.setup()
    renderNavbar()
    const abrir = screen.getByRole('button', { name: 'Abrir menú' })
    expect(abrir).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'Inicio' })).not.toBeInTheDocument()

    await user.click(abrir)
    const cerrar = screen.getByRole('button', { name: 'Cerrar menú' })
    expect(cerrar).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument()

    await user.click(cerrar)
    expect(screen.queryByRole('link', { name: 'Inicio' })).not.toBeInTheDocument()
  })

  it('elegir un enlace del menú móvil navega y cierra el menú', async () => {
    const user = userEvent.setup()
    iniciarComo('cliente')
    renderNavbar()
    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    const enlaces = screen.getAllByRole('link', { name: 'Mis pedidos' })
    expect(enlaces).toHaveLength(2) // versión escritorio + versión móvil
    await user.click(enlaces[1])
    expect(screen.getByTestId('ruta-actual')).toHaveTextContent('/mis-pedidos')
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument()
  })

  it('cerrar sesión desde el menú móvil también limpia la sesión', async () => {
    const user = userEvent.setup()
    iniciarComo('cliente')
    renderNavbar()
    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    const botones = screen.getAllByRole('button', { name: /cerrar sesión/i })
    await user.click(botones[1])
    expect(localStorage.getItem('usuarioActual')).toBeNull()
    expect(screen.getByTestId('ruta-actual')).toHaveTextContent('/login')
  })
})
