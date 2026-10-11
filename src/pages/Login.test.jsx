import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import Login from './Login.jsx'

function UbicacionActual() {
    const location = useLocation()
    return <p data-testid="ruta-actual">{location.pathname}</p>
}

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

beforeEach(() => localStorage.clear())

describe('Login', () => {
    it('renderiza campos etiquetados y las credenciales de demostración', () => {
        renderLogin()
        expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
        expect(screen.getByText(/cuentas de demostración/i)).toBeInTheDocument()
    })

    it('muestra un mensaje al ingresar credenciales incorrectas', async () => {
        const user = userEvent.setup()
        renderLogin()
        await user.type(screen.getByLabelText(/correo electrónico/i), 'noexiste@example.com')
        await user.type(screen.getByLabelText(/contraseña/i), 'incorrecta')
        await user.click(screen.getByRole('button', { name: /ingresar/i }))
        expect(screen.getByRole('alert')).toHaveTextContent(/correo o contraseña incorrectos/i)
    })

    it('inicia sesión con un cliente y navega a Mis pedidos', async () => {
        const user = userEvent.setup()
        renderLogin()
        await user.type(screen.getByLabelText(/correo electrónico/i), 'juan.perez@email.com')
        await user.type(screen.getByLabelText(/contraseña/i), '123456')
        await user.click(screen.getByRole('button', { name: /ingresar/i }))
        expect(screen.getByTestId('ruta-actual')).toHaveTextContent('/mis-pedidos')
        expect(JSON.parse(localStorage.getItem('usuarioActual')).id).toBe(1)
    })

    it('rechaza el envío con campos vacíos si se dispara el evento submit', () => {
        renderLogin()
        fireEvent.submit(screen.getByLabelText(/correo electrónico/i).closest('form'))
        expect(screen.getByRole('alert')).toHaveTextContent(/ingresa tu correo y contraseña/i)
    })
})
