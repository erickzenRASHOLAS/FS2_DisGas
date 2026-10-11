import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import Operadora from './Operadora.jsx'

beforeEach(() => localStorage.clear())

describe('Panel de despacho', () => {
    it('muestra pedidos iniciales y sus estados', async () => {
        render(<Operadora />)
        expect(await screen.findByRole('heading', { name: /panel de despacho/i })).toBeInTheDocument()
        expect(screen.getByText('ORD-202')).toBeInTheDocument()
        expect(screen.getByText('Pedidos registrados')).toBeInTheDocument()
    })

    it('asigna un repartidor a un pedido y persiste la asignación', async () => {
        render(<Operadora />)
        const row = (await screen.findByText('ORD-202')).closest('tr')
        fireEvent.change(within(row).getByLabelText(/repartidor para ord-202/i), { target: { value: '3' } })
        fireEvent.click(within(row).getByRole('button', { name: /asignar/i }))
        expect(await screen.findByRole('status')).toHaveTextContent(/repartidor asignado correctamente/i)
        const saved = JSON.parse(localStorage.getItem('gasVolcan.pedidos.v1'))
        expect(saved.find((p) => p.id === 'ORD-202').repartidorId).toBe(3)
    })

    it('valida que se seleccione un repartidor antes de asignar', async () => {
        render(<Operadora />)
        const row = (await screen.findByText('ORD-202')).closest('tr')
        fireEvent.click(within(row).getByRole('button', { name: /asignar/i }))
        expect(await screen.findByRole('status')).toHaveTextContent(/selecciona un repartidor/i)
    })

    it('actualiza el estado de un pedido seleccionado', async () => {
        render(<Operadora />)
        const stateSelect = await screen.findByRole('combobox', { name: /estado del pedido ord-202/i })
        fireEvent.change(stateSelect, { target: { value: 'En Ruta' } })
        expect(await screen.findByRole('status')).toHaveTextContent(/estado actualizado/i)
        const saved = JSON.parse(localStorage.getItem('gasVolcan.pedidos.v1'))
        expect(saved.find((p) => p.id === 'ORD-202').estado).toBe('En Ruta')
    })
})
