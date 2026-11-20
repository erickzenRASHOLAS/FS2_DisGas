import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import MisPedidos from './MisPedidos.jsx'
import { BOLETA, error, simularApi } from '../test/fakeApi.js'
import { iniciarComo } from '../test/sesion.js'

const renderPagina = () => render(<MemoryRouter><MisPedidos /></MemoryRouter>)

describe('MisPedidos', () => {
    it('sin sesión invita a iniciar sesión', () => {
        renderPagina()
        expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
    })

    it('lista las boletas que devuelve GET /v1/boletas', async () => {
        iniciarComo('CLIENTE')
        simularApi({ 'GET /v1/boletas': [BOLETA] })
        renderPagina()
        expect(await screen.findByText('#10')).toBeInTheDocument()
        expect(screen.getByText('2x Cilindro 5 kg')).toBeInTheDocument()
        expect(screen.getByText('Pendiente')).toBeInTheDocument()
    })

    it('muestra el estado vacío', async () => {
        iniciarComo('CLIENTE')
        simularApi({ 'GET /v1/boletas': [] })
        renderPagina()
        expect(await screen.findByText(/todavía no tienes pedidos/i)).toBeInTheDocument()
    })

    it('permite cancelar un pedido pendiente (PUT /v1/boletas/{id}/cancelar)', async () => {
        iniciarComo('CLIENTE')
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        const llamadas = simularApi({ 'GET /v1/boletas': [BOLETA], 'PUT /v1/boletas/10/cancelar': { ...BOLETA, estado: 'CANCELADO' } })
        const user = userEvent.setup()
        renderPagina()
        await user.click(await screen.findByRole('button', { name: /^cancelar$/i }))
        await waitFor(() => expect(llamadas.some((l) => l.metodo === 'PUT' && l.ruta === '/v1/boletas/10/cancelar')).toBe(true))
        expect(await screen.findByRole('status')).toHaveTextContent(/pedido #10 cancelado/i)
    })

    it('muestra el error del backend', async () => {
        iniciarComo('CLIENTE')
        simularApi({ 'GET /v1/boletas': error(500, 'Falla interna') })
        renderPagina()
        expect(await screen.findByRole('alert')).toHaveTextContent(/falla interna/i)
    })
})
