import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import Inventario from './Inventario.jsx'

beforeEach(() => localStorage.clear())

describe('Inventario', () => {
    it('muestra las capacidades, stock y resumen del inventario', async () => {
        render(<Inventario />)
        expect(await screen.findByRole('heading', { name: /inventario de cilindros/i })).toBeInTheDocument()
        expect(screen.getByText('Cilindro de gas 5 kg')).toBeInTheDocument()
        expect(screen.getByText('Tipos de cilindro')).toBeInTheDocument()
    })

    it('permite editar y guardar el stock', async () => {
        render(<Inventario />)
        const input = await screen.findByLabelText(/stock de cilindro de gas 5 kg/i)
        fireEvent.change(input, { target: { value: '20' } })
        fireEvent.click(screen.getByRole('button', { name: /guardar inventario/i }))
        expect(await screen.findByRole('status')).toHaveTextContent(/inventario guardado/i)
        const saved = JSON.parse(localStorage.getItem('gasVolcan.inventario.v1'))
        expect(saved.find((item) => item.id === 'gas-5').stock).toBe(20)
    })

    it('muestra error cuando el stock es inválido', async () => {
        render(<Inventario />)
        const input = await screen.findByLabelText(/stock de cilindro de gas 5 kg/i)
        fireEvent.change(input, { target: { value: '-1' } })
        fireEvent.click(screen.getByRole('button', { name: /guardar inventario/i }))
        expect(await screen.findByRole('status')).toHaveTextContent(/stock debe ser un número entero/i)
    })
})
