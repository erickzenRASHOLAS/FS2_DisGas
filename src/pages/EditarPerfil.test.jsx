import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import EditarPerfil from './EditarPerfil.jsx'
import UbicacionActual from '../test/UbicacionActual.jsx'
import { iniciarComo } from '../test/sesion.js'
import { obtenerUsuarioActual, obtenerUsuarios } from '../services/datosMock.js'

afterEach(() => vi.useRealTimers())

function renderEditarPerfil() {
  return render(
    <MemoryRouter initialEntries={['/editar-perfil']}>
      <Routes>
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        <Route path="*" element={<UbicacionActual />} />
      </Routes>
    </MemoryRouter>,
  )
}

const guardar = () => fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

describe('EditarPerfil', () => {
  it('pide iniciar sesión cuando no hay usuario activo', () => {
    renderEditarPerfil()
    expect(screen.getByText('Debes iniciar sesión para editar el perfil.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login')
  })

  it('precarga el formulario con los datos del usuario', () => {
    iniciarComo('cliente')
    renderEditarPerfil()
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Juan Pérez')
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('juan.perez@email.com')
    expect(screen.getByLabelText('Teléfono')).toHaveValue('+56 9 1234 5678')
    expect(screen.getByLabelText('Dirección')).toHaveValue('Av. Brasil 456, Depto 12, Chillán')
    expect(screen.getByRole('link', { name: /cancelar/i })).toHaveAttribute('href', '/perfil')
  })

  it('guarda los cambios, actualiza la sesión y vuelve al perfil', () => {
    vi.useFakeTimers()
    iniciarComo('cliente')
    renderEditarPerfil()
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Juan Editado' } })
    guardar()

    expect(screen.getByRole('status')).toHaveTextContent('Datos actualizados correctamente.')
    expect(obtenerUsuarios().find((usuario) => usuario.id === 1).nombre).toBe('Juan Editado')
    expect(obtenerUsuarioActual().nombre).toBe('Juan Editado')

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(screen.getByTestId('ruta-actual')).toHaveTextContent('/perfil')
  })

  it('muestra el error si el correo pertenece a otro usuario', () => {
    iniciarComo('cliente')
    renderEditarPerfil()
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'maria.gonzalez@email.com' } })
    guardar()
    expect(screen.getByRole('status')).toHaveTextContent('Ese correo ya pertenece a otro usuario.')
    expect(obtenerUsuarios().find((usuario) => usuario.id === 1).correo).toBe('juan.perez@email.com')
  })
})
