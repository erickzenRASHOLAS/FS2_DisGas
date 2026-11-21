import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Perfil from './Perfil.jsx'
import { simularApi } from '../test/fakeApi.js'
import { iniciarComo, USUARIOS } from '../test/sesion.js'

const renderPerfil = () => render(<MemoryRouter><Perfil /></MemoryRouter>)

describe('Perfil', () => {
    it('sin sesión invita a iniciar sesión', () => {
        renderPerfil()
        expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
    })

    it('muestra los datos y el rol del usuario con sesión', async () => {
        iniciarComo('CLIENTE')
        simularApi({ 'GET /v1/perfil': USUARIOS.CLIENTE })
        renderPerfil()
        expect(await screen.findAllByText('Juan Pérez')).not.toHaveLength(0)
        expect(screen.getByText('juan.perez@email.com')).toBeInTheDocument()
        expect(screen.getByText('Cliente')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /modificar datos/i })).toHaveAttribute('href', '/editar-perfil')
    })
})
