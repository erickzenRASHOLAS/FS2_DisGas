import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AdminUsuarios from './AdminUsuario.jsx'
import { error, simularApi } from '../test/fakeApi.js'
import { iniciarComo, USUARIOS } from '../test/sesion.js'

const LISTA = [USUARIOS.ADMINISTRADOR, USUARIOS.VENDEDOR, USUARIOS.CLIENTE]

describe('AdminUsuarios', () => {
    it('lista los usuarios de GET /v1/usuarios y bloquea las acciones sobre la propia cuenta', async () => {
        iniciarComo('ADMINISTRADOR')
        simularApi({ 'GET /v1/usuarios': LISTA })
        render(<AdminUsuarios />)
        expect(await screen.findByText('Ana Vendedora')).toBeInTheDocument()
        expect(screen.getByLabelText(/rol de admin volcán/i)).toBeDisabled()
        expect(screen.getByLabelText(/rol de ana vendedora/i)).toBeEnabled()
    })

    it('crea un usuario con rol y contraseña (POST /v1/usuarios)', async () => {
        iniciarComo('ADMINISTRADOR')
        const llamadas = simularApi({ 'GET /v1/usuarios': LISTA, 'POST /v1/usuarios': { status: 201, body: { id: 9 } } })
        const user = userEvent.setup()
        render(<AdminUsuarios />)
        await screen.findByText('Ana Vendedora')
        await user.type(screen.getByLabelText(/nombre completo/i), 'Pedro Soto')
        await user.type(screen.getByLabelText(/correo electrónico/i), 'pedro@volcan.cl')
        await user.type(screen.getByLabelText(/^teléfono/i), '+56 9 1111 2222')
        await user.type(screen.getByLabelText(/^dirección/i), 'Chillán')
        await user.type(screen.getByLabelText(/contraseña temporal/i), 'secreto1')
        await user.selectOptions(screen.getByLabelText(/^rol$/i), 'VENDEDOR')
        await user.click(screen.getByRole('button', { name: /crear usuario/i }))
        await waitFor(() => expect(llamadas.some((l) => l.metodo === 'POST')).toBe(true))
        expect(llamadas.find((l) => l.metodo === 'POST').body).toMatchObject({ correo: 'pedro@volcan.cl', rol: 'VENDEDOR', activo: true })
    })

    it('cambia el rol con PUT /v1/usuarios/{id} sin enviar contraseña', async () => {
        iniciarComo('ADMINISTRADOR')
        const llamadas = simularApi({ 'GET /v1/usuarios': LISTA, 'PUT /v1/usuarios/3': USUARIOS.CLIENTE })
        const user = userEvent.setup()
        render(<AdminUsuarios />)
        await user.selectOptions(await screen.findByLabelText(/rol de juan pérez/i), 'VENDEDOR')
        await waitFor(() => expect(llamadas.some((l) => l.metodo === 'PUT')).toBe(true))
        const body = llamadas.find((l) => l.metodo === 'PUT').body
        expect(body.rol).toBe('VENDEDOR')
        expect(body.password).toBeUndefined()
    })

    it('desactiva un usuario', async () => {
        iniciarComo('ADMINISTRADOR')
        const llamadas = simularApi({ 'GET /v1/usuarios': LISTA, 'PUT /v1/usuarios/2': USUARIOS.VENDEDOR })
        const user = userEvent.setup()
        render(<AdminUsuarios />)
        const fila = (await screen.findByText('Ana Vendedora')).closest('tr')
        await user.click(fila.querySelector('button'))
        await waitFor(() => expect(llamadas.find((l) => l.metodo === 'PUT')?.body.activo).toBe(false))
    })

    it('elimina un usuario y muestra el 409 del backend', async () => {
        iniciarComo('ADMINISTRADOR')
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        simularApi({ 'GET /v1/usuarios': LISTA, 'DELETE /v1/usuarios/3': error(409, 'El usuario tiene boletas') })
        const user = userEvent.setup()
        render(<AdminUsuarios />)
        const fila = (await screen.findByText('Juan Pérez')).closest('tr')
        await user.click(fila.querySelectorAll('button')[1])
        expect(await screen.findByRole('alert')).toHaveTextContent(/tiene boletas/i)
    })
})
