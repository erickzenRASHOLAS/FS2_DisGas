import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Layout from './Layout.jsx'
import { iniciarComo } from '../test/sesion.js'

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<p>Contenido de la vista hija</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('Layout', () => {
  it('renderiza la barra de navegación, la vista hija y el pie de página', () => {
    renderLayout()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveTextContent('Contenido de la vista hija')
    expect(screen.getByText(/todos los derechos reservados/i)).toBeInTheDocument()
  })

  it('refleja la sesión activa en el menú de navegación', () => {
    iniciarComo('administrador')
    renderLayout()
    expect(screen.getByRole('link', { name: 'Inventario' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument()
  })
})
