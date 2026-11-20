import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Registro from './Registro.jsx'
import { error, simularApi } from '../test/fakeApi.js'

async function completar(user, { pass2 = 'secreto1' } = {}) {
    await user.type(screen.getByLabelText(/nombre completo/i), 'María González')
    await user.type(screen.getByLabelText(/correo electrónico/i), 'maria@email.com')
    await user.type(screen.getByLabelText(/dirección de entrega/i), 'Los Pinos 123')
    await user.type(screen.getByLabelText(/^teléfono/i), '+56912345678')
    await user.type(screen.getByLabelText(/^contraseña$/i), 'secreto1')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), pass2)
    await user.click(screen.getByRole('button', { name: /registrarme/i }))
}

const renderRegistro = () => render(<MemoryRouter><Registro /></MemoryRouter>)

describe('Registro', () => {
    it('muestra el título y el formulario', () => {
        renderRegistro()
        expect(screen.getByRole('heading', { name: /crea tu cuenta/i })).toBeInTheDocument()
    })

    it('valida campos vacíos y contraseñas distintas sin llamar al backend', async () => {
        const llamadas = simularApi()
        const user = userEvent.setup()
        renderRegistro()
        await user.click(screen.getByRole('button', { name: /registrarme/i }))
        expect(screen.getByText(/todos los campos son obligatorios/i)).toBeInTheDocument()
        await completar(user, { pass2: 'otra-clave' })
        expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
        expect(llamadas).toHaveLength(0)
    })

    it('envía POST /v1/auth/registro sin rol y muestra el éxito', async () => {
        const llamadas = simularApi({ 'POST /v1/auth/registro': { status: 201, body: { id: 9, rol: 'CLIENTE' } } })
        const user = userEvent.setup()
        renderRegistro()
        await completar(user)
        expect(await screen.findByText(/cuenta creada con éxito/i)).toBeInTheDocument()
        expect(llamadas[0].body).toEqual({ nombre: 'María González', correo: 'maria@email.com', telefono: '+56912345678', direccion: 'Los Pinos 123', password: 'secreto1' })
        expect(llamadas[0].body.rol).toBeUndefined()
    })

    it('muestra el 409 cuando el correo ya existe', async () => {
        simularApi({ 'POST /v1/auth/registro': error(409, 'El correo ya esta registrado') })
        const user = userEvent.setup()
        renderRegistro()
        await completar(user)
        expect(await screen.findByText(/el correo ya esta registrado/i)).toBeInTheDocument()
    })
})
