import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Navbar from './Navbar.jsx'
import UbicacionActual from '../test/UbicacionActual.jsx'
import { iniciarComo } from '../test/sesion.js'
import { obtenerSesion } from '../services/sesion.js'

function renderNavbar() {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <Navbar />
            <Routes><Route path="*" element={<UbicacionActual />} /></Routes>
        </MemoryRouter>,
    )
}

const enlaces = () => screen.queryAllByRole('link').map((a) => a.textContent)

describe('Navbar · menú según el rol', () => {
    it('sin sesión solo ofrece Ingresar', () => {
        renderNavbar()
        expect(screen.getAllByRole('link', { name: /ingresar/i }).length).toBeGreaterThan(0)
        expect(enlaces()).not.toContain('Inventario')
        expect(enlaces()).not.toContain('Mis pedidos')
    })

    it('el CLIENTE ve solo la tienda', () => {
        iniciarComo('CLIENTE')
        renderNavbar()
        expect(enlaces()).toEqual(expect.arrayContaining(['Pedir cilindro', 'Mis pedidos', 'Mi perfil']))
        expect(enlaces()).not.toContain('Inventario')
        expect(enlaces()).not.toContain('Órdenes')
        expect(enlaces()).not.toContain('Usuarios')
    })

    it('el VENDEDOR ve solo Órdenes e Inventario', () => {
        iniciarComo('VENDEDOR')
        renderNavbar()
        expect(enlaces()).toEqual(expect.arrayContaining(['Órdenes', 'Inventario']))
        for (const prohibido of ['Pedir cilindro', 'Mis pedidos', 'Usuarios', 'Mi perfil']) expect(enlaces()).not.toContain(prohibido)
    })

    it('el ADMINISTRADOR ve todo', () => {
        iniciarComo('ADMINISTRADOR')
        renderNavbar()
        expect(enlaces()).toEqual(expect.arrayContaining(['Órdenes', 'Inventario', 'Usuarios', 'Pedir cilindro', 'Mi perfil']))
    })

    it('Cerrar sesión borra la sesión y lleva al login', async () => {
        iniciarComo('CLIENTE')
        const user = userEvent.setup()
        renderNavbar()
        await user.click(screen.getAllByRole('button', { name: /cerrar sesión/i })[0])
        expect(obtenerSesion()).toBeNull()
        expect(screen.getByTestId('ruta-actual')).toHaveTextContent('/login')
    })
})
