import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Pedido from './Pedido.jsx'
import UbicacionActual from '../test/UbicacionActual.jsx'
import { iniciarComo } from '../test/sesion.js'
import { obtenerPedidos } from '../services/datosMock.js'

const peso = (monto) => monto.toLocaleString('es-CL')

let alerta

beforeEach(() => {
  alerta = vi.fn()
  vi.stubGlobal('alert', alerta)
})

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

const campoNombre = () => screen.getByPlaceholderText('Ej: Juan Pérez')
const campoTelefono = () => screen.getByPlaceholderText('1234 5678')
const campoDireccion = () => screen.getByPlaceholderText('Ej: Av. Brasil 456, Depto 12')
const selectorProducto = () => screen.getByRole('combobox')
const botonAgregar = () => screen.getByRole('button', { name: /agregar/i })
const botonConfirmar = () => screen.getByRole('button', { name: /confirmar pedido/i })

function agregarProducto(id, cantidad = 1) {
  fireEvent.change(selectorProducto(), { target: { value: id } })
  if (cantidad !== 1) {
    // El primer campo numérico es la cantidad del selector de catálogo
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: String(cantidad) } })
  }
  fireEvent.click(botonAgregar())
}

describe('Pedido · renderizado y datos de sesión', () => {
  it('precarga los datos del cliente con sesión activa', () => {
    iniciarComo('cliente')
    renderPedido()
    expect(screen.getByRole('heading', { name: /crear pedido/i })).toBeInTheDocument()
    expect(campoNombre()).toHaveValue('Juan Pérez')
    expect(campoTelefono()).toHaveValue('1234 5678')
    expect(campoDireccion()).toHaveValue('Av. Brasil 456, Depto 12, Chillán')
  })

  it('deja los campos vacíos y la lista sin productos cuando no hay sesión', () => {
    renderPedido()
    expect(campoNombre()).toHaveValue('')
    expect(screen.getByText(/tu lista de pedido está vacía/i)).toBeInTheDocument()
    expect(botonConfirmar()).toBeDisabled()
  })

  it('ofrece los tres cilindros del catálogo', () => {
    renderPedido()
    expect(screen.getByRole('option', { name: /cilindro 5 kg/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /cilindro 11 kg/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /cilindro 15 kg/i })).toBeInTheDocument()
  })
})

describe('Pedido · lista de productos', () => {
  it('exige elegir un producto antes de agregar', () => {
    renderPedido()
    fireEvent.click(botonAgregar())
    expect(screen.getByText('Selecciona un producto del catálogo.')).toBeInTheDocument()
  })

  it('agrega productos, calcula subtotales y habilita la confirmación', () => {
    renderPedido()
    agregarProducto('gas-5')
    agregarProducto('gas-11')
    expect(screen.getByText('Cilindro 5 kg')).toBeInTheDocument()
    expect(screen.getByText('Cilindro 11 kg')).toBeInTheDocument()
    expect(screen.getByText('Total a Pagar:')).toBeInTheDocument()
    expect(botonConfirmar()).toBeEnabled()
    expect(botonConfirmar()).toHaveTextContent(`$${peso(10800 + 21500)}`)
  })

  it('acumula la cantidad cuando se agrega el mismo producto dos veces', () => {
    renderPedido()
    agregarProducto('gas-5')
    agregarProducto('gas-5')
    expect(screen.getAllByText('Cilindro 5 kg')).toHaveLength(1)
    expect(botonConfirmar()).toHaveTextContent(`$${peso(10800 * 2)}`)
  })

  it('respeta la cantidad elegida antes de agregar', () => {
    renderPedido()
    agregarProducto('gas-15', 3)
    expect(botonConfirmar()).toHaveTextContent(`$${peso(27900 * 3)}`)
  })

  it('permite cambiar la cantidad en la tabla e ignora valores menores que 1', () => {
    renderPedido()
    agregarProducto('gas-5')
    const cantidadTabla = () => screen.getAllByRole('spinbutton')[1]

    fireEvent.change(cantidadTabla(), { target: { value: '3' } })
    expect(cantidadTabla()).toHaveValue(3)
    expect(botonConfirmar()).toHaveTextContent(`$${peso(10800 * 3)}`)

    fireEvent.change(cantidadTabla(), { target: { value: '0' } })
    expect(cantidadTabla()).toHaveValue(3)
  })

  it('quita un producto de la lista', () => {
    renderPedido()
    agregarProducto('gas-5')
    fireEvent.click(screen.getByTitle('Eliminar ítem'))
    expect(screen.getByText(/tu lista de pedido está vacía/i)).toBeInTheDocument()
    expect(botonConfirmar()).toBeDisabled()
  })
})

describe('Pedido · confirmación', () => {
  it('rechaza el envío si faltan los datos de despacho', () => {
    renderPedido()
    agregarProducto('gas-5')
    fireEvent.click(botonConfirmar())
    expect(screen.getByText('Por favor, ingresa los datos completos de despacho.')).toBeInTheDocument()
  })

  it('rechaza el envío si no hay productos en la lista', () => {
    iniciarComo('cliente')
    renderPedido()
    fireEvent.submit(botonConfirmar().closest('form'))
    expect(screen.getByText('Debes agregar al menos un producto a tu lista de pedido.')).toBeInTheDocument()
  })

  it('envía al login cuando los datos están completos pero no hay sesión', () => {
    renderPedido()
    fireEvent.change(campoNombre(), { target: { value: 'Visita' } })
    fireEvent.change(campoTelefono(), { target: { value: '12345678' } })
    fireEvent.change(campoDireccion(), { target: { value: 'Calle 1' } })
    agregarProducto('gas-5')
    fireEvent.click(botonConfirmar())
    expect(screen.getByTestId('ruta-actual')).toHaveTextContent('/login')
    expect(obtenerPedidos().some((pedido) => pedido.cliente === 'Visita')).toBe(false)
  })

  it('crea el pedido, avisa al cliente y navega a Mis pedidos', () => {
    iniciarComo('cliente')
    renderPedido()
    agregarProducto('gas-5')
    agregarProducto('gas-11')
    fireEvent.click(botonConfirmar())

    expect(alerta).toHaveBeenCalledWith('¡Pedido realizado con éxito!')
    expect(screen.getByTestId('ruta-actual')).toHaveTextContent('/mis-pedidos')
    expect(obtenerPedidos()[0]).toMatchObject({
      clienteId: 1,
      cliente: 'Juan Pérez',
      telefono: '+56 9 1234 5678',
      producto: '1x Cilindro 5 kg, 1x Cilindro 11 kg',
      total: 32300,
      tipoGas: 'Varios',
      estado: 'Pendiente',
    })
  })
})
