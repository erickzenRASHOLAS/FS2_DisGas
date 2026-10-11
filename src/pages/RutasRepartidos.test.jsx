import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import RutasRepartidor from './RutasRepartidos.jsx'
import { iniciarComo } from '../test/sesion.js'
import {
  asignarRepartidor,
  iniciarSesion,
  obtenerPedidos,
  registrarPagoEfectivo,
  registrarUsuario,
} from '../services/datosMock.js'

function renderRutas() {
  return render(
    <MemoryRouter>
      <RutasRepartidor />
    </MemoryRouter>,
  )
}

const tarjeta = (idPedido) => screen.getByText(new RegExp(idPedido)).closest('article')
const pedido = (id) => obtenerPedidos().find((p) => p.id === id)

describe('RutasRepartidos · acceso', () => {
  it('pide iniciar sesión cuando no hay usuario activo', () => {
    renderRutas()
    expect(screen.getByRole('heading', { name: /vista del repartidor/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login')
  })

  it('avisa cuando la cuenta no tiene rol Repartidor', () => {
    iniciarComo('cliente')
    renderRutas()
    expect(screen.getByRole('heading', { name: /acceso de demostración/i })).toBeInTheDocument()
  })
})

describe('RutasRepartidos · entregas asignadas', () => {
  it('muestra solo los pedidos asignados al repartidor y sus contadores', () => {
    iniciarComo('repartidor')
    renderRutas()
    expect(screen.getByRole('heading', { name: 'Mis entregas' })).toBeInTheDocument()
    expect(screen.getByText(/ORD-201/)).toBeInTheDocument()
    expect(screen.getByText(/ORD-200/)).toBeInTheDocument()
    expect(screen.queryByText(/ORD-202/)).not.toBeInTheDocument()

    expect(screen.getByText('Entregas pendientes').nextElementSibling).toHaveTextContent('1')
    expect(screen.getByText('Completadas').nextElementSibling).toHaveTextContent('1')
    expect(screen.getByText('Con pago registrado').nextElementSibling).toHaveTextContent('1')
  })

  it('informa cuando el repartidor no tiene pedidos asignados', () => {
    registrarUsuario({ nombre: 'Repartidor Nuevo', correo: 'rep2@volcan.cl', password: '123456', rol: 'Repartidor' })
    iniciarSesion('rep2@volcan.cl', '123456')
    renderRutas()
    expect(screen.getByText('No tienes pedidos asignados')).toBeInTheDocument()
  })

  it('marca un pedido pendiente como En Ruta', () => {
    asignarRepartidor('ORD-202', 3)
    iniciarComo('repartidor')
    renderRutas()
    fireEvent.click(screen.getByRole('button', { name: 'Marcar en ruta' }))

    expect(screen.getByRole('status')).toHaveTextContent('Estado actualizado.')
    expect(pedido('ORD-202').estado).toBe('En Ruta')
    expect(within(tarjeta('ORD-202')).getByText('En Ruta')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Marcar en ruta' })).not.toBeInTheDocument()
  })
})

describe('RutasRepartidos · confirmar entrega', () => {
  it('registra la entrega y el cobro en efectivo cuando se confirman ambos', () => {
    const confirmar = vi.fn(() => true)
    vi.stubGlobal('confirm', confirmar)
    iniciarComo('repartidor')
    renderRutas()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar entrega' }))

    expect(confirmar).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('status')).toHaveTextContent('Pago en efectivo registrado en la demostración.')
    expect(pedido('ORD-201')).toMatchObject({ estado: 'Entregado', pagoRegistrado: true, montoPagado: 27900 })
  })

  it('deja el cobro pendiente cuando solo se confirma la entrega', () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValueOnce(true).mockReturnValueOnce(false))
    iniciarComo('repartidor')
    renderRutas()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar entrega' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Entrega marcada. El cobro queda pendiente para regularizarlo con administración.',
    )
    expect(pedido('ORD-201')).toMatchObject({ estado: 'Entregado', pagoRegistrado: false })
  })

  it('no cambia nada si el repartidor cancela la confirmación', () => {
    vi.stubGlobal('confirm', vi.fn(() => false))
    iniciarComo('repartidor')
    renderRutas()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar entrega' }))
    expect(pedido('ORD-201').estado).toBe('En Ruta')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('no vuelve a pedir el cobro si el pago ya estaba registrado', () => {
    const confirmar = vi.fn(() => true)
    vi.stubGlobal('confirm', confirmar)
    registrarPagoEfectivo('ORD-201')
    iniciarComo('repartidor')
    renderRutas()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar entrega' }))

    expect(confirmar).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Entrega marcada como realizada. El pago ya estaba registrado.',
    )
    expect(pedido('ORD-201').estado).toBe('Entregado')
  })
})
