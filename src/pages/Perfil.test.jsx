import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Perfil from './Perfil.jsx'
import { iniciarComo } from '../test/sesion.js'

function renderPerfil() {
  return render(
    <MemoryRouter>
      <Perfil />
    </MemoryRouter>,
  )
}

describe('Perfil', () => {
  it('pide iniciar sesión cuando no hay usuario activo', () => {
    renderPerfil()
    expect(screen.getByText('Inicia sesión para revisar tus datos personales.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login')
  })

  it('muestra los datos del usuario con sesión activa', () => {
    iniciarComo('cliente')
    renderPerfil()
    expect(screen.getByRole('heading', { name: 'Juan Pérez' })).toBeInTheDocument()
    expect(screen.getByText('Cliente')).toBeInTheDocument()
    expect(screen.getByText('juan.perez@email.com')).toBeInTheDocument()
    expect(screen.getByText('+56 9 1234 5678')).toBeInTheDocument()
    expect(screen.getByText('Av. Brasil 456, Depto 12, Chillán')).toBeInTheDocument()
  })

  it('enlaza a la edición del perfil', () => {
    iniciarComo('administrador')
    renderPerfil()
    expect(screen.getByRole('heading', { name: 'Admin Volcán' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /modificar datos/i })).toHaveAttribute('href', '/editar-perfil')
  })
})
