import { beforeEach, describe, expect, it } from 'vitest'
import {
    asignarRepartidor,
    actualizarEstadoPedido,
    actualizarUsuario,
    autenticarUsuario,
    cambiarEstadoUsuario,
    cerrarSesion,
    crearPedido,
    eliminarUsuario,
    guardarInventario,
    iniciarSesion,
    obtenerInventario,
    obtenerPedidos,
    obtenerPedidosPorCliente,
    obtenerPedidosPorEstado,
    obtenerRepartidores,
    obtenerUsuarioActual,
    obtenerUsuarios,
    registrarPagoEfectivo,
    registrarUsuario,
} from './datosMock.js'

beforeEach(() => localStorage.clear())

describe('lectura de la fuente de datos simulada', () => {
    it('inicializa y devuelve usuarios de demostración', () => {
        expect(obtenerUsuarios().length).toBeGreaterThan(0)
        expect(obtenerUsuarios().some((user) => user.correo === 'juan.perez@email.com')).toBe(true)
    })

    it('devuelve los repartidores activos', () => {
        expect(obtenerRepartidores().every((user) => user.rol === 'Repartidor' && user.estado !== 'Inactivo')).toBe(true)
    })

    it('filtra pedidos por cliente y acepta IDs numéricos o textuales', () => {
        expect(obtenerPedidosPorCliente(1).length).toBeGreaterThan(0)
        expect(obtenerPedidosPorCliente('1').map((p) => p.id)).toEqual(obtenerPedidosPorCliente(1).map((p) => p.id))
    })

    it('filtra pedidos por estado', () => {
        expect(obtenerPedidosPorEstado('Pendiente').every((p) => p.estado === 'Pendiente')).toBe(true)
    })

    it('normaliza campos que falten en pedidos guardados antiguos', () => {
        localStorage.setItem('gasVolcan.pedidos.v1', JSON.stringify([{ id: 'OLD-1', clienteId: 1, estado: 'Pendiente' }]))
        expect(obtenerPedidos()[0]).toMatchObject({ repartidorId: null, repartidor: '', pagoRegistrado: false })
    })
})

describe('operaciones de pedidos', () => {
    it('crea un pedido pendiente y lo persiste', () => {
        const created = crearPedido({ clienteId: 1, cliente: 'Juan Pérez', tipoGas: '11kg', cantidad: 1, total: 21500 })
        expect(created).toMatchObject({ estado: 'Pendiente', repartidorId: null, pagoRegistrado: false, total: 21500 })
        expect(obtenerPedidos().some((p) => p.id === created.id)).toBe(true)
    })

    it('asigna un repartidor válido al pedido', () => {
        const result = asignarRepartidor('ORD-202', 3)
        expect(result.exito).toBe(true)
        expect(obtenerPedidos().find((p) => p.id === 'ORD-202')).toMatchObject({ repartidorId: 3, repartidor: 'Carlos Repartidor' })
    })

    it('rechaza la asignación cuando no existe el pedido o el repartidor no es válido', () => {
        expect(asignarRepartidor('NO-EXISTE', 3).exito).toBe(false)
        expect(asignarRepartidor('ORD-202', 1).exito).toBe(false)
    })

    it('actualiza el estado de un pedido existente', () => {
        expect(actualizarEstadoPedido('ORD-202', 'En Ruta').exito).toBe(true)
        expect(obtenerPedidos().find((p) => p.id === 'ORD-202').estado).toBe('En Ruta')
    })

    it('informa cuando se intenta actualizar un pedido inexistente', () => {
        expect(actualizarEstadoPedido('NO-EXISTE', 'Entregado').exito).toBe(false)
    })

    it('registra un pago en efectivo una sola vez', () => {
        expect(registrarPagoEfectivo('ORD-202').exito).toBe(true)
        const pedido = obtenerPedidos().find((p) => p.id === 'ORD-202')
        expect(pedido).toMatchObject({ pagoRegistrado: true, metodoPago: 'Efectivo', montoPagado: 43000 })
        expect(registrarPagoEfectivo('ORD-202').mensaje).toMatch(/ya estaba registrado/i)
    })

    it('no registra un pago para un pedido inexistente', () => {
        expect(registrarPagoEfectivo('NO-EXISTE').exito).toBe(false)
    })
})

describe('operaciones de inventario', () => {
    it('carga el inventario inicial', () => {
        expect(obtenerInventario().map((item) => item.capacidad)).toEqual(['5 kg', '11 kg', '15 kg'])
    })

    it('guarda stock entero y lo mantiene como número', () => {
        const inventario = obtenerInventario().map((item) => ({ ...item, stock: item.id === 'gas-5' ? '20' : item.stock }))
        expect(guardarInventario(inventario).exito).toBe(true)
        expect(obtenerInventario().find((item) => item.id === 'gas-5').stock).toBe(20)
    })

    it.each(['-1', '1.5', ''])('rechaza stock inválido: %s', (stock) => {
        const inventario = obtenerInventario().map((item, index) => index === 0 ? { ...item, stock } : item)
        expect(guardarInventario(inventario).exito).toBe(false)
    })
})

describe('CRUD de usuarios y autenticación', () => {
    it('crea un usuario y normaliza el correo', () => {
        expect(registrarUsuario({ nombre: ' Test ', correo: ' TEST@EXAMPLE.COM ', password: 'secreto' })).toBe(true)
        expect(obtenerUsuarios().some((u) => u.correo === 'test@example.com' && u.nombre === 'Test')).toBe(true)
    })

    it('rechaza correo vacío o duplicado', () => {
        expect(registrarUsuario({ correo: ' ' })).toBe(false)
        expect(registrarUsuario({ correo: 'JUAN.PEREZ@EMAIL.COM' })).toBe(false)
    })

    it('actualiza un usuario existente', () => {
        expect(actualizarUsuario(1, { nombre: 'Juan actualizado' }).exito).toBe(true)
        expect(obtenerUsuarios().find((u) => u.id === 1).nombre).toBe('Juan actualizado')
    })

    it('rechaza actualizar usuario inexistente o correo duplicado', () => {
        expect(actualizarUsuario(999, { nombre: 'X' }).exito).toBe(false)
        expect(actualizarUsuario(1, { correo: 'maria.gonzalez@email.com' }).exito).toBe(false)
    })

    it('cambia el estado entre Activo e Inactivo', () => {
        expect(cambiarEstadoUsuario(2).exito).toBe(true)
        expect(obtenerUsuarios().find((u) => u.id === 2).estado).toBe('Inactivo')
        cambiarEstadoUsuario(2)
        expect(obtenerUsuarios().find((u) => u.id === 2).estado).toBe('Activo')
    })

    it('elimina otro usuario y bloquea la eliminación de la cuenta activa', () => {
        iniciarSesion('juan.perez@email.com', '123456')
        expect(eliminarUsuario(1).exito).toBe(false)
        expect(eliminarUsuario(2).exito).toBe(true)
        expect(obtenerUsuarios().some((u) => u.id === 2)).toBe(false)
    })

    it('autentica correo sin distinguir mayúsculas y minúsculas', () => {
        expect(autenticarUsuario(' JUAN.PEREZ@EMAIL.COM ', '123456')?.id).toBe(1)
        expect(autenticarUsuario('juan.perez@email.com', 'incorrecta')).toBeNull()
    })

    it('rechaza autenticar una cuenta inactiva', () => {
        const users = obtenerUsuarios().map((u) => u.id === 1 ? { ...u, estado: 'Inactivo' } : u)
        localStorage.setItem('gasVolcan.usuarios.v1', JSON.stringify(users))
        expect(autenticarUsuario('juan.perez@email.com', '123456')).toBeNull()
    })

    it('inicia sesión sin exponer la contraseña y puede cerrar sesión', () => {
        const result = iniciarSesion('juan.perez@email.com', '123456')
        expect(result.exito).toBe(true)
        expect(result.usuario).not.toHaveProperty('pass')
        expect(obtenerUsuarioActual().id).toBe(1)
        cerrarSesion()
        expect(obtenerUsuarioActual()).toBeNull()
    })

    it('rechaza credenciales incorrectas', () => {
        expect(iniciarSesion('desconocido@example.com', 'mal').exito).toBe(false)
    })
})
