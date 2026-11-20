import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import EditarPerfil from './EditarPerfil.jsx'
import UbicacionActual from '../test/UbicacionActual.jsx'
import { error, simularApi } from '../test/fakeApi.js'
import { iniciarComo, USUARIOS } from '../test/sesion.js'
import { obtenerUsuarioActual } from '../services/sesion.js'

const renderPagina = () => render(
    <MemoryRouter initialEntries={['/editar-perfil']}>
        <Routes><Route path="/editar-perfil" element={<EditarPerfil />} /><Route path="*" element={<UbicacionActual />} /></Routes>
    </MemoryRouter>,
)

describe('EditarPerfil', () => {
    it('sin sesión pide iniciar sesión', () => {
        renderPagina()
        expect(screen.getByText(/debes iniciar sesión/i)).toBeInTheDocument()
    })

    it('el correo es de solo lectura', () => {
        iniciarComo('CLIENTE')
        renderPagina()
        expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute('readonly')
    })

    it('guarda con PUT /v1/perfil (sin correo) y actualiza la sesión', async () => {
        iniciarComo('CLIENTE')
        const llamadas = simularApi({ 'PUT /v1/perfil': { ...USUARIOS.CLIENTE, nombre: 'Juan P. Soto' } })
        const user = userEvent.setup()
        renderPagina()
        const nombre = screen.getByLabelText(/nombre completo/i)
        await user.clear(nombre); await user.type(nombre, 'Juan P. Soto')
        await user.click(screen.getByRole('button', { name: /guardar cambios/i }))
        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/actualizados correctamente/i))
        expect(llamadas[0].body).toEqual({ nombre: 'Juan P. Soto', telefono: '+56 9 1234 5678', direccion: 'Av. Brasil 456, Chillán' })
        expect(obtenerUsuarioActual().nombre).toBe('Juan P. Soto')
    })

    it('muestra los errores de validación del backend', async () => {
        iniciarComo('CLIENTE')
        simularApi({ 'PUT /v1/perfil': error(400, 'Datos invalidos', ['nombre: El nombre es obligatorio']) })
        const user = userEvent.setup()
        renderPagina()
        await user.click(screen.getByRole('button', { name: /guardar cambios/i }))
        expect(await screen.findByRole('status')).toHaveTextContent(/nombre: el nombre es obligatorio/i)
    })
})
