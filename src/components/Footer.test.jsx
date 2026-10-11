import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Footer from './Footer.jsx'

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  )
}

describe('Footer', () => {
  it('muestra el nombre de la empresa y los datos de contacto', () => {
    renderFooter()
    expect(screen.getByRole('heading', { name: /gas el volcán/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /contacto/i })).toBeInTheDocument()
    expect(screen.getByText(/Av\. O'Higgins 1234, Chillán/)).toBeInTheDocument()
    expect(screen.getByText('+56 9 1234 5678')).toBeInTheDocument()
  })

  it('incluye los accesos rápidos con sus rutas', () => {
    renderFooter()
    expect(screen.getByRole('link', { name: /pide tu cilindro/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /panel operadora/i })).toHaveAttribute('href', '/operadora')
    expect(screen.getByRole('link', { name: /administración/i })).toHaveAttribute('href', '/admin')
    expect(screen.getByRole('link', { name: /acceso trabajadores/i })).toHaveAttribute('href', '/login')
  })

  it('calcula el año actual en el copyright', () => {
    renderFooter()
    const anio = String(new Date().getFullYear())
    expect(screen.getByText(/todos los derechos reservados/i)).toHaveTextContent(anio)
  })
})
