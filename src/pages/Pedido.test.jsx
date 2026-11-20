import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Pedido from './Pedido.jsx'
import UbicacionActual from '../test/UbicacionActual.jsx'
import { BOLETA, error, PRODUCTOS, simularApi } from '../test/fakeApi.js'
import { iniciarComo } from '../test/sesion.js'

function renderPedido() {
    return render(
        <MemoryRouter initialEntries={['/pedido']}>
            <Routes>
                <Route path="/pedido" element={<Pedido />} />
                <Route path="*" element={<UbicacionActual />} />
            </Routes>
        </MemoryRouter>,
    )
}

const elegir = async (user, valor, cantidad = 1) => {
    await user.selectOptions(await screen.findByLabelText(/producto \/ accesorio/i), String(valor))
    const campo = screen.getByLabelText(/^cantidad$/i)
    await user.clear(campo); await user.type(campo, String(cantidad))
    await user.click(screen.getByRole('button', { name: /agregar/i }))
}

describe('Pedido', () => {
    it('carga el catálogo desde GET /v1/productos y precarga los datos del usuario', async () => {
        iniciarComo('CLIENTE')
        simularApi({ 'GET /v1/productos': PRODUCTOS })
        renderPedido()
        expect(await screen.findByRole('option', { name: /cilindro 5 kg/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('Juan Pérez')
        expect(screen.getByLabelText(/dirección de despacho/i)).toHaveValue('Av. Brasil 456, Chillán')
        expect(screen.getByRole('option', { name: /regulador de gas.*sin stock/i })).toBeDisabled()
    })

    it('calcula el total y envía solo productoId y cantidad en POST /v1/boletas', async () => {
        iniciarComo('CLIENTE')
        const llamadas = simularApi({ 'GET /v1/productos': PRODUCTOS, 'POST /v1/boletas': { status: 201, body: BOLETA } })
        const user = userEvent.setup()
        renderPedido()
        await elegir(user, 1, 2)
        expect(screen.getByRole('button', { name: /confirmar pedido/i })).toHaveTextContent('21.600')
        await user.click(screen.getByRole('button', { name: /confirmar pedido/i }))
        await waitFor(() => expect(screen.getByTestId('ruta-actual')).toHaveTextContent('/mis-pedidos'))
        const envio = llamadas.find((l) => l.metodo === 'POST')
        expect(envio.body).toEqual({ direccion: 'Av. Brasil 456, Chillán', items: [{ productoId: 1, cantidad: 2 }] })
        expect(envio.auth).toMatch(/^Bearer /)
    })

    it('no deja pedir más unidades que el stock', async () => {
        iniciarComo('CLIENTE')
        simularApi({ 'GET /v1/productos': PRODUCTOS })
        const user = userEvent.setup()
        renderPedido()
        await elegir(user, 2, 9)   // quedan 5
        expect(screen.getByText(/solo quedan 5 unidades/i)).toBeInTheDocument()
    })

    it('exige al menos un producto', async () => {
        iniciarComo('CLIENTE')
        simularApi({ 'GET /v1/productos': PRODUCTOS })
        const user = userEvent.setup()
        renderPedido()
        await screen.findByRole('option', { name: /cilindro 5 kg/i })
        await user.click(screen.getByRole('button', { name: /confirmar pedido/i }))
        expect(screen.queryByTestId('ruta-actual')).not.toBeInTheDocument()
    })

    it('muestra el 409 de stock insuficiente que devuelve el backend', async () => {
        iniciarComo('CLIENTE')
        simularApi({ 'GET /v1/productos': PRODUCTOS, 'POST /v1/boletas': error(409, 'Stock insuficiente de Cilindro 5 kg (disponible: 1)') })
        const user = userEvent.setup()
        renderPedido()
        await elegir(user, 1, 2)
        await user.click(screen.getByRole('button', { name: /confirmar pedido/i }))
        expect(await screen.findByText(/stock insuficiente de cilindro 5 kg/i)).toBeInTheDocument()
    })
})
