import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Registro from './Registro.jsx'
import UbicacionActual from '../test/UbicacionActual.jsx'
import { iniciarSesion, obtenerUsuarios } from '../services/datosMock.js'

afterEach(() => vi.useRealTimers())

function renderRegistro() {
  return render(
    <MemoryRouter initialEntries={['/registro']}>
      <Routes>
        <Route path="/registro" element={<Registro />} />
        <Route path="*" element={<UbicacionActual />} />
      </Routes>
    </MemoryRouter>,
  )
}

function llenar({
  nombre = 'Pedro Soto',
  correo = 'pedro@example.com',
  direccion = 'Los Robles 45',
  telefono = '+56911112222',
  pass1 = 'secreto1',
  pass2 = 'secreto1',
} = {}) {
  fireEvent.change(screen.getByLabelText('Nombre Completo'), { target: { value: nombre } })
  fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { value: correo } })
  fireEvent.change(screen.getByLabelText('Dirección de entrega (Chillán)'), { target: { value: direccion } })
  fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: telefono } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: pass1 } })
  fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), { target: { value: pass2 } })
}

const enviar = () => fireEvent.click(screen.getByRole('button', { name: /registrarme/i }))

describe('Registro', () => {
  it('renderiza el formulario y el enlace para iniciar sesión', () => {
    renderRegistro()
    expect(screen.getByRole('heading', { name: /crea tu cuenta/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre Completo')).toHaveValue('')
    expect(screen.getByRole('link', { name: /inicia sesión/i })).toHaveAttribute('href', '/login')
  })

  it('actualiza el estado del formulario mientras el usuario escribe', () => {
    renderRegistro()
    fireEvent.change(screen.getByLabelText('Nombre Completo'), { target: { value: 'Ana' } })
    expect(screen.getByLabelText('Nombre Completo')).toHaveValue('Ana')
  })

  it('exige completar todos los campos', () => {
    renderRegistro()
    enviar()
    expect(screen.getByText('Todos los campos son obligatorios.')).toBeInTheDocument()
  })

  it('rechaza contraseñas de menos de 6 caracteres', () => {
    renderRegistro()
    llenar({ pass1: '123', pass2: '123' })
    enviar()
    expect(screen.getByText('La contraseña debe tener al menos 6 caracteres.')).toBeInTheDocument()
  })

  it('rechaza contraseñas que no coinciden', () => {
    renderRegistro()
    llenar({ pass2: 'otraClave1' })
    enviar()
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument()
  })

  it('rechaza un correo que ya está registrado', () => {
    renderRegistro()
    llenar({ correo: 'juan.perez@email.com' })
    enviar()
    expect(screen.getByText('El correo electrónico ya se encuentra registrado.')).toBeInTheDocument()
  })

  it('crea la cuenta de cliente y redirige al login después de 2 segundos', () => {
    vi.useFakeTimers()
    renderRegistro()
    llenar()
    enviar()

    expect(screen.getByText(/cuenta creada con éxito/i)).toBeInTheDocument()
    const creado = obtenerUsuarios().find((usuario) => usuario.correo === 'pedro@example.com')
    expect(creado).toMatchObject({ nombre: 'Pedro Soto', rol: 'Cliente', estado: 'Activo' })
    expect(iniciarSesion('pedro@example.com', 'secreto1').exito).toBe(true)

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByTestId('ruta-actual')).toHaveTextContent('/login')
  })
})
