import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Ordenes from './Ordenes.jsx'
import { BOLETA, error, simularApi } from '../test/fakeApi.js'
import { iniciarComo } from '../test/sesion.js'

describe('Ordenes', () => {
    it('el VENDEDOR ve la lista y el detalle de las órdenes', async () => {
        iniciarComo('VENDEDOR')
        simularApi({ 'GET /v1/boletas': [BOLETA] })
        const user = userEvent.setup()
        render(<Ordenes />)
        expect(await screen.findByText('#10')).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: /ver detalle/i }))
        expect(screen.getByText(/detalle de la orden #10/i)).toBeInTheDocument()
    })

    it.each(['VENDEDOR', 'ADMINISTRADOR'])('el %s avanza el estado con PUT /v1/boletas/{id}/estado', async (rol) => {
        iniciarComo(rol)
        const llamadas = simularApi({ 'GET /v1/boletas': [BOLETA], 'PUT /v1/boletas/10/estado': { ...BOLETA, estado: 'EN_RUTA' } })
        const user = userEvent.setup()
        render(<Ordenes />)
        await user.click(await screen.findByRole('button', { name: /enviar a ruta/i }))
        await waitFor(() => expect(llamadas.find((l) => l.metodo === 'PUT').body).toEqual({ estado: 'EN_RUTA' }))
    })

    it.each(['VENDEDOR', 'ADMINISTRADOR'])('el %s puede cancelar una orden', async (rol) => {
        iniciarComo(rol)
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        const llamadas = simularApi({ 'GET /v1/boletas': [BOLETA], 'PUT /v1/boletas/10/cancelar': { ...BOLETA, estado: 'CANCELADO' } })
        const user = userEvent.setup()
        render(<Ordenes />)
        await user.click(await screen.findByRole('button', { name: /^cancelar$/i }))
        await waitFor(() => expect(llamadas.some((l) => l.ruta === '/v1/boletas/10/cancelar')).toBe(true))
    })

    it('filtra por estado', async () => {
        iniciarComo('VENDEDOR')
        simularApi({ 'GET /v1/boletas': [BOLETA, { ...BOLETA, id: 11, estado: 'ENTREGADO' }] })
        const user = userEvent.setup()
        render(<Ordenes />)
        await screen.findByText('#11')
        await user.click(screen.getByRole('button', { name: 'Entregadas' }))
        expect(screen.queryByText('#10')).not.toBeInTheDocument()
        expect(screen.getByText('#11')).toBeInTheDocument()
    })

    it('muestra el error del backend (409)', async () => {
        iniciarComo('ADMINISTRADOR')
        simularApi({ 'GET /v1/boletas': [BOLETA], 'PUT /v1/boletas/10/estado': error(409, 'No se puede pasar de PENDIENTE a ENTREGADO') })
        const user = userEvent.setup()
        render(<Ordenes />)
        await user.click(await screen.findByRole('button', { name: /enviar a ruta/i }))
        expect(await screen.findByRole('alert')).toHaveTextContent(/no se puede pasar/i)
    })
})
