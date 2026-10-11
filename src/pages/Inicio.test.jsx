import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Inicio from './Inicio.jsx'
import UbicacionActual from '../test/UbicacionActual.jsx'

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

function renderInicio() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="*" element={<UbicacionActual />} />
      </Routes>
    </MemoryRouter>,
  )
}

const campoCelular = () => screen.getByLabelText('¿Cuál es tu celular?')
const selectorCilindro = () => screen.getByLabelText('Tipo de Cilindro')
const continuar = () => fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

describe('Inicio · contenido', () => {
  it('muestra el formulario de pedido rápido, las secciones y el pie de página', () => {
    renderInicio()
    expect(screen.getByRole('heading', { name: /pide tu cilindro aquí/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /nuestros formatos de gas licuado/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /sobre distribuidora el volcán/i })).toBeInTheDocument()
    expect(screen.getByText(/todos los derechos reservados/i)).toBeInTheDocument()
  })

  it('ofrece los formatos de cilindro disponibles', () => {
    renderInicio()
    const opciones = within(selectorCilindro()).getAllByRole('option')
    expect(opciones.map((opcion) => opcion.value)).toEqual(['', '5kg', '11kg', '15kg'])
  })
})

describe('Inicio · validación del formulario', () => {
  it('muestra ambos errores si se envía vacío', () => {
    renderInicio()
    continuar()
    expect(screen.getByText('Ingresa un número de celular válido.')).toBeInTheDocument()
    expect(screen.getByText('Selecciona el formato de cilindro.')).toBeInTheDocument()
  })

  it('rechaza un celular de menos de 8 dígitos pero acepta el cilindro elegido', () => {
    renderInicio()
    fireEvent.change(campoCelular(), { target: { value: '123' } })
    fireEvent.change(selectorCilindro(), { target: { value: '11kg' } })
    continuar()
    expect(screen.getByText('Ingresa un número de celular válido.')).toBeInTheDocument()
    expect(screen.queryByText('Selecciona el formato de cilindro.')).not.toBeInTheDocument()
  })

  it('pide el cilindro cuando solo se ingresó un celular válido', () => {
    renderInicio()
    fireEvent.change(campoCelular(), { target: { value: '12345678' } })
    continuar()
    expect(screen.queryByText('Ingresa un número de celular válido.')).not.toBeInTheDocument()
    expect(screen.getByText('Selecciona el formato de cilindro.')).toBeInTheDocument()
  })

  it('con datos válidos registra el inicio del pedido y navega a /pedido', () => {
    renderInicio()
    fireEvent.change(campoCelular(), { target: { value: '12345678' } })
    fireEvent.change(selectorCilindro(), { target: { value: '11kg' } })
    continuar()
    expect(console.log).toHaveBeenCalledWith('Pedido iniciado:', { celular: '12345678', cilindro: '11kg' })
    expect(screen.getByTestId('ruta-actual')).toHaveTextContent('/pedido')
  })
})

describe('Inicio · menú móvil', () => {
  it('el botón alterna la visibilidad del menú móvil', () => {
    renderInicio()
    // El contenedor del menú móvil es el padre directo de sus enlaces.
    // Si migras a Bootstrap, actualiza las clases (por ejemplo d-none / d-block).
    const menu = screen.getByRole('link', { name: /sucursal virtual \(login\)/i }).parentElement
    expect(menu).toHaveClass('hidden')

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    expect(menu).toHaveClass('block')
    expect(menu).not.toHaveClass('hidden')

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    expect(menu).toHaveClass('hidden')
  })
})
