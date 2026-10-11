import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AdminUsuarios from './AdminUsuario.jsx'
import { iniciarComo } from '../test/sesion.js'
import { obtenerRepartidores, obtenerUsuarios } from '../services/datosMock.js'

function llenarFormulario({
  nombre = 'Luis Torres',
  correo = 'luis@example.com',
  telefono = '+56 9 1111 2222',
  direccion = 'Calle Falsa 123',
  pass = 'secreto1',
  rol = 'Cliente',
} = {}) {
  fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: nombre } })
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: correo } })
  fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: telefono } })
  fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: direccion } })
  fireEvent.change(screen.getByLabelText('Contraseña temporal'), { target: { value: pass } })
  fireEvent.change(screen.getByLabelText('Rol'), { target: { value: rol } })
}

const crear = () => fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }))
const filaDe = (nombre) => screen.getByText(nombre).closest('tr')

describe('AdminUsuario · listado', () => {
  it('muestra los usuarios registrados con su rol y estado', () => {
    render(<AdminUsuarios />)
    expect(screen.getByRole('heading', { name: /gestión de usuarios/i })).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(1 + 5) // encabezado + 5 usuarios de demostración
    expect(within(filaDe('Carlos Repartidor')).getByText('Repartidor')).toBeInTheDocument()
    expect(within(filaDe('Admin Volcán')).getByText('Administrador')).toBeInTheDocument()
  })
})

describe('AdminUsuario · crear usuario', () => {
  it('crea un usuario válido y lo muestra en la tabla', () => {
    render(<AdminUsuarios />)
    llenarFormulario({ rol: 'Repartidor' })
    crear()

    expect(screen.getByRole('status')).toHaveTextContent('Usuario creado y guardado en este navegador de demostración.')
    expect(screen.getAllByRole('row')).toHaveLength(1 + 6)
    expect(within(filaDe('Luis Torres')).getByText('Repartidor')).toBeInTheDocument()
    expect(obtenerUsuarios()).toHaveLength(6)
    expect(obtenerRepartidores().some((usuario) => usuario.correo === 'luis@example.com')).toBe(true)
    // el formulario se limpia después de crear
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('')
  })

  it('valida los campos obligatorios y la longitud de la contraseña', () => {
    render(<AdminUsuarios />)
    llenarFormulario({ pass: '123' })
    fireEvent.submit(screen.getByRole('button', { name: 'Crear usuario' }).closest('form'))
    expect(screen.getByRole('status')).toHaveTextContent(
      'Completa todos los campos y usa una contraseña de al menos 6 caracteres.',
    )
    expect(obtenerUsuarios()).toHaveLength(5)
  })

  it('informa cuando el correo ya está registrado', () => {
    render(<AdminUsuarios />)
    llenarFormulario({ correo: 'juan.perez@email.com' })
    crear()
    expect(screen.getByRole('status')).toHaveTextContent(
      'No se pudo crear el usuario. Comprueba que el correo no esté registrado.',
    )
    expect(obtenerUsuarios()).toHaveLength(5)
  })
})

describe('AdminUsuario · estado y eliminación', () => {
  it('desactiva y vuelve a activar un usuario', () => {
    render(<AdminUsuarios />)
    fireEvent.click(within(filaDe('María González')).getByRole('button', { name: 'Desactivar' }))
    expect(screen.getByRole('status')).toHaveTextContent('Estado de usuario actualizado.')
    expect(within(filaDe('María González')).getByText('Inactivo')).toBeInTheDocument()

    fireEvent.click(within(filaDe('María González')).getByRole('button', { name: 'Activar' }))
    expect(within(filaDe('María González')).getByText('Activo')).toBeInTheDocument()
  })

  it('elimina un usuario cuando se confirma la acción', () => {
    const confirmar = vi.fn(() => true)
    vi.stubGlobal('confirm', confirmar)
    render(<AdminUsuarios />)
    fireEvent.click(within(filaDe('María González')).getByRole('button', { name: 'Eliminar' }))

    expect(confirmar).toHaveBeenCalledWith('¿Eliminar la cuenta de María González?')
    expect(screen.getByRole('status')).toHaveTextContent('Usuario eliminado.')
    expect(screen.queryByText('María González')).not.toBeInTheDocument()
    expect(obtenerUsuarios()).toHaveLength(4)
  })

  it('conserva al usuario cuando se cancela la confirmación', () => {
    vi.stubGlobal('confirm', vi.fn(() => false))
    render(<AdminUsuarios />)
    fireEvent.click(within(filaDe('María González')).getByRole('button', { name: 'Eliminar' }))
    expect(screen.getByText('María González')).toBeInTheDocument()
    expect(obtenerUsuarios()).toHaveLength(5)
  })

  it('no permite eliminar la propia cuenta', () => {
    vi.stubGlobal('confirm', vi.fn(() => true))
    iniciarComo('administrador')
    render(<AdminUsuarios />)
    fireEvent.click(within(filaDe('Admin Volcán')).getByRole('button', { name: 'Eliminar' }))
    expect(screen.getByRole('status')).toHaveTextContent('No puedes eliminar tu propia cuenta desde esta pantalla.')
    expect(screen.getByText('Admin Volcán')).toBeInTheDocument()
  })
})
