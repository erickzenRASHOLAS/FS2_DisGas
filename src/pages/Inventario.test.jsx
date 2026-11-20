import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Inventario from './Inventario.jsx'
import { CATEGORIAS, error, PRODUCTOS, simularApi } from '../test/fakeApi.js'
import { iniciarComo } from '../test/sesion.js'

const rutas = (extra = {}) => ({ 'GET /v1/productos/todos': PRODUCTOS, 'GET /v1/categorias': CATEGORIAS, ...extra })

describe('Inventario', () => {
    it('lista los productos del backend con el resumen de stock', async () => {
        iniciarComo('ADMINISTRADOR')
        simularApi(rutas())
        render(<Inventario />)
        expect(await screen.findByText('Cilindro 5 kg')).toBeInTheDocument()
        expect(screen.getByText('Stock bajo o crítico')).toBeInTheDocument()
        expect(screen.getAllByText('Reponer').length).toBeGreaterThan(0)   // cilindro de 15 kg (5 <= 8) y regulador (0 <= 10)
    })

    it('el VENDEDOR solo puede ver el detalle: sin crear, editar ni eliminar', async () => {
        iniciarComo('VENDEDOR')
        simularApi(rutas())
        const user = userEvent.setup()
        render(<Inventario />)
        await screen.findByText('Cilindro 5 kg')
        expect(screen.queryByRole('button', { name: /nuevo producto/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /^editar /i })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /^eliminar /i })).not.toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: /ver detalle de cilindro 5 kg/i }))
        expect(within(screen.getByLabelText(/detalle del producto/i)).getByText('Gas licuado 5 kg')).toBeInTheDocument()
    })

    it('el ADMINISTRADOR edita el stock con PUT /v1/productos/{id}', async () => {
        iniciarComo('ADMINISTRADOR')
        const llamadas = simularApi(rutas({ 'PUT /v1/productos/1': { ...PRODUCTOS[0], stock: 20 } }))
        const user = userEvent.setup()
        render(<Inventario />)
        await user.click(await screen.findByRole('button', { name: /editar cilindro 5 kg/i }))
        const stock = screen.getByLabelText(/stock disponible/i)
        await user.clear(stock); await user.type(stock, '20')
        await user.click(screen.getByRole('button', { name: /guardar producto/i }))
        await waitFor(() => expect(llamadas.find((l) => l.metodo === 'PUT')).toBeTruthy())
        const put = llamadas.find((l) => l.metodo === 'PUT')
        expect(put.body).toMatchObject({ stock: 20, precio: 10800, categoria: { id: 1 } })
        expect(await screen.findByRole('status')).toHaveTextContent(/producto actualizado/i)
    })

    it('crea un producto con POST /v1/productos', async () => {
        iniciarComo('ADMINISTRADOR')
        const llamadas = simularApi(rutas({ 'POST /v1/productos': { status: 201, body: PRODUCTOS[0] } }))
        const user = userEvent.setup()
        render(<Inventario />)
        await user.click(await screen.findByRole('button', { name: /nuevo producto/i }))
        await user.type(screen.getByLabelText(/^nombre$/i), 'Cilindro 45 kg')
        await user.selectOptions(screen.getByLabelText(/categoría/i), '1')
        await user.type(screen.getByLabelText(/precio/i), '90000')
        await user.type(screen.getByLabelText(/stock disponible/i), '10')
        await user.type(screen.getByLabelText(/stock mínimo/i), '2')
        await user.click(screen.getByRole('button', { name: /guardar producto/i }))
        await waitFor(() => expect(llamadas.some((l) => l.metodo === 'POST')).toBe(true))
        expect(llamadas.find((l) => l.metodo === 'POST').body).toMatchObject({ nombre: 'Cilindro 45 kg', precio: 90000, stock: 10, stockMinimo: 2, categoria: { id: 1 } })
    })

    it('valida números negativos sin llamar al backend', async () => {
        iniciarComo('ADMINISTRADOR')
        const llamadas = simularApi(rutas())
        const user = userEvent.setup()
        render(<Inventario />)
        await user.click(await screen.findByRole('button', { name: /editar cilindro 5 kg/i }))
        const stock = screen.getByLabelText(/stock disponible/i)
        await user.clear(stock); await user.type(stock, '-1')
        await user.click(screen.getByRole('button', { name: /guardar producto/i }))
        expect(await screen.findByRole('alert')).toHaveTextContent(/números enteros/i)
        expect(llamadas.some((l) => l.metodo === 'PUT')).toBe(false)
    })

    it('muestra el 409 si el producto ya está en boletas', async () => {
        iniciarComo('ADMINISTRADOR')
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        simularApi(rutas({ 'DELETE /v1/productos/1': error(409, 'El producto aparece en boletas') }))
        const user = userEvent.setup()
        render(<Inventario />)
        await user.click(await screen.findByRole('button', { name: /eliminar cilindro 5 kg/i }))
        expect(await screen.findByRole('alert')).toHaveTextContent(/aparece en boletas/i)
    })
})
