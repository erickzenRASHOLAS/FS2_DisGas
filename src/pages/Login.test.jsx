import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Login from './Login.jsx'
import UbicacionActual from '../test/UbicacionActual.jsx'
import { error, simularApi } from '../test/fakeApi.js'
import { jwtFalso, USUARIOS } from '../test/sesion.js'
import { obtenerUsuarioActual } from '../services/sesion.js'

function renderLogin() {
    return render(
        <MemoryRouter initialEntries={['/login']}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<UbicacionActual />} />
            </Routes>
        </MemoryRouter>,
    )
}

const respuestaLogin = (usuario) => ({ token: 'ACC', refreshToken: jwtFalso(), usuario })

describe('Login', () => {
    it('renderiza campos etiquetados y las credenciales de demostración', () => {
        renderLogin()
        expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
        expect(screen.getByText(/cuentas de demostración/i)).toBeInTheDocument()
    })

    it('muestra el mensaje del backend con credenciales incorrectas', async () => {
        simularApi({ 'POST /v1/auth/login': error(401, 'Correo o contraseña incorrectos') })
        const user = userEvent.setup()
        renderLogin()
        await user.type(screen.getByLabelText(/correo electrónico/i), 'noexiste@example.com')
        await user.type(screen.getByLabelText(/contraseña/i), 'incorrecta')
        await user.click(screen.getByRole('button', { name: /ingresar/i }))
        expect(await screen.findByRole('alert')).toHaveTextContent(/correo o contraseña incorrectos/i)
        expect(obtenerUsuarioActual()).toBeNull()
    })

    it.each([
        ['CLIENTE', '/mis-pedidos'],
        ['VENDEDOR', '/ordenes'],
        ['ADMINISTRADOR', '/admin'],
    ])('con rol %s guarda la sesión y navega a %s', async (rol, ruta) => {
        simularApi({ 'POST /v1/auth/login': respuestaLogin(USUARIOS[rol]) })
        const user = userEvent.setup()
        renderLogin()
        await user.type(screen.getByLabelText(/correo electrónico/i), USUARIOS[rol].correo)
        await user.type(screen.getByLabelText(/contraseña/i), '123456')
        await user.click(screen.getByRole('button', { name: /ingresar/i }))
        await waitFor(() => expect(screen.getByTestId('ruta-actual')).toHaveTextContent(ruta))
        expect(obtenerUsuarioActual().rol).toBe(rol)
    })

    it('informa si el backend no está disponible', async () => {
        const { vi } = await import('vitest')
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
        const user = userEvent.setup()
        renderLogin()
        await user.type(screen.getByLabelText(/correo electrónico/i), 'a@a.cl')
        await user.type(screen.getByLabelText(/contraseña/i), 'x')
        await user.click(screen.getByRole('button', { name: /ingresar/i }))
        expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo conectar/i)
    })

    it('rechaza el envío con campos vacíos', () => {
        renderLogin()
        fireEvent.submit(screen.getByLabelText(/correo electrónico/i).closest('form'))
        expect(screen.getByRole('alert')).toHaveTextContent(/ingresa tu correo y contraseña/i)
    })
})
