import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import MisPedidos from './MisPedidos.jsx'
import { iniciarComo } from '../test/sesion.js'
import { iniciarSesion, registrarUsuario } from '../services/datosMock.js'

const formatoPeso = (monto) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(monto)

function renderMisPedidos() {
  return render(
    <MemoryRouter>
      <MisPedidos />
    </MemoryRouter>,
  )
}

describe('MisPedidos', () => {
  it('pide iniciar sesión cuando no hay usuario activo', () => {
    renderMisPedidos()
    expect(screen.getByText('Inicia sesión para revisar tu historial.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login')
  })

  it('lista solo los pedidos del cliente con su estado y pago', () => {
    iniciarComo('cliente')
    renderMisPedidos()
    expect(screen.getByRole('heading', { name: 'Mis pedidos' })).toBeInTheDocument()
    expect(screen.getByText(/juan pérez/i)).toBeInTheDocument()

    const pendiente = screen.getByText('ORD-202').closest('tr')
    expect(within(pendiente).getAllByText('Pendiente')).toHaveLength(2) // estado + pago
    expect(pendiente).toHaveTextContent(formatoPeso(43000))

    const entregado = screen.getByText('ORD-200').closest('tr')
    expect(within(entregado).getByText('Entregado')).toBeInTheDocument()
    expect(within(entregado).getByText('Pagado')).toBeInTheDocument()

    // Los pedidos de otros clientes no aparecen
    expect(screen.queryByText('ORD-201')).not.toBeInTheDocument()
    expect(screen.queryByText('ORD-203')).not.toBeInTheDocument()
  })

  it('muestra un mensaje cuando el cliente todavía no tiene pedidos', () => {
    registrarUsuario({ nombre: 'Cliente Nuevo', correo: 'nuevo@example.com', password: 'abcdef' })
    iniciarSesion('nuevo@example.com', 'abcdef')
    renderMisPedidos()
    expect(screen.getByText('Todavía no tienes pedidos')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /crear pedido/i })).toHaveAttribute('href', '/pedido')
  })

  it('ofrece el acceso para crear un nuevo pedido', () => {
    iniciarComo('cliente')
    renderMisPedidos()
    expect(screen.getByRole('link', { name: /nuevo pedido/i })).toHaveAttribute('href', '/pedido')
  })
})
