import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerUsuarioActual, crearPedido } from '../services/datosMock';

// Catálogo de productos disponibles
const CATALOGO_PRODUCTOS = [
    { id: 'gas-5', nombre: 'Cilindro 5 kg', categoria: 'Gas', precio: 10800 },
    { id: 'gas-11', nombre: 'Cilindro 11 kg', categoria: 'Gas', precio: 21500 },
    { id: 'gas-15', nombre: 'Cilindro 15 kg', categoria: 'Gas', precio: 27900 },
];

const Pedido = () => {
    const navigate = useNavigate();

    // Datos de despacho
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');

    // Selección actual de producto
    const [productoSeleccionadoId, setProductoSeleccionadoId] = useState('');
    const [cantidadItem, setCantidadItem] = useState(1);

    // Lista de productos añadidos al pedido
    const [itemsPedido, setItemsPedido] = useState([]);
    const [error, setError] = useState('');

    // Precargar datos del usuario en sesión
    useEffect(() => {
        const usuario = obtenerUsuarioActual();
        if (usuario) {
            if (usuario.nombre) setNombre(usuario.nombre);
            if (usuario.telefono) setTelefono(usuario.telefono.replace('+56 9 ', '').replace('+569', ''));
            if (usuario.direccion) setDireccion(usuario.direccion);
        }
    }, []);

    // Agregar producto seleccionado a la lista del pedido
    const agregarAlPedido = () => {
        if (!productoSeleccionadoId) {
            setError('Selecciona un producto del catálogo.');
            return;
        }

        const prodEncontrado = CATALOGO_PRODUCTOS.find(p => p.id === productoSeleccionadoId);
        if (!prodEncontrado) return;

        // Si el producto ya existe en la lista, acumular la cantidad
        const existeIndex = itemsPedido.findIndex(item => item.id === prodEncontrado.id);
        if (existeIndex >= 0) {
            const copiaItems = [...itemsPedido];
            copiaItems[existeIndex].cantidad += cantidadItem;
            setItemsPedido(copiaItems);
        } else {
            setItemsPedido([
                ...itemsPedido,
                {
                    id: prodEncontrado.id,
                    nombre: prodEncontrado.nombre,
                    precio: prodEncontrado.precio,
                    cantidad: cantidadItem
                }
            ]);
        }

        // Reiniciar campos de selección
        setProductoSeleccionadoId('');
        setCantidadItem(1);
        setError('');
    };

    // Quitar producto de la lista
    const eliminarItem = (id) => {
        setItemsPedido(itemsPedido.filter(item => item.id !== id));
    };

    // Cambiar cantidad directamente en la tabla
    const cambiarCantidadTabla = (id, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;
        setItemsPedido(itemsPedido.map(item =>
            item.id === id ? { ...item, cantidad: nuevaCantidad } : item
        ));
    };

    // Calcular monto total a pagar
    const totalPedido = itemsPedido.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!nombre.trim() || !telefono.trim() || !direccion.trim()) {
            setError('Por favor, ingresa los datos completos de despacho.');
            return;
        }

        if (itemsPedido.length === 0) {
            setError('Debes agregar al menos un producto a tu lista de pedido.');
            return;
        }

        setError('');

        const usuarioActual = obtenerUsuarioActual();
        if (!usuarioActual) {
            setError('Debes iniciar sesión antes de crear un pedido.');
            navigate('/login');
            return;
        }

        // Resumen formateado para compatibilidad con paneles de Operadora y Repartidor
        const resumenProductos = itemsPedido.map(i => `${i.cantidad}x ${i.nombre}`).join(', ');

        const nuevoPedidoData = {
            clienteId: usuarioActual.id,
            cliente: nombre,
            telefono: `+56 9 ${telefono}`,
            direccion: direccion,
            producto: resumenProductos,
            items: itemsPedido,
            total: totalPedido,
            tipoGas: itemsPedido.some(i => i.id.startsWith('gas')) ? 'Varios' : 'Accesorios'
        };

        crearPedido(nuevoPedidoData);
        alert('¡Pedido realizado con éxito!');
        navigate('/mis-pedidos');
    };

    return (
        <main className="flex-grow flex items-center justify-center p-4 sm:p-8 my-6">
            <section className="bg-white w-full max-w-3xl rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-blue-950 mb-2">Crear Pedido</h1>
                    <p className="text-slate-600">Selecciona cilindros o accesorios y gestiona tu despacho a domicilio en Chillán.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8" noValidate>

                    {/* DATOS DE DESPACHO */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                        <h2 className="font-bold text-blue-950 text-lg flex items-center gap-2">
                            <i className="ph ph-user text-xl"></i> Datos de Entrega
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ej: Juan Pérez"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-yellow-400 outline-none text-slate-900 bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Teléfono Móvil</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold text-sm">+56 9</span>
                                    <input
                                        type="tel"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        placeholder="1234 5678"
                                        className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-yellow-400 outline-none text-slate-900 bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Dirección de Despacho</label>
                            <input
                                type="text"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                placeholder="Ej: Av. Brasil 456, Depto 12"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-yellow-400 outline-none text-slate-900 bg-white"
                            />
                        </div>
                    </div>

                    {/* SELECCIÓN DE PRODUCTOS Y ACCESORIOS */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                        <h2 className="font-bold text-blue-950 text-lg flex items-center gap-2">
                            <i className="ph ph-shopping-bag-open text-xl"></i> Selección de Catálogo
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                            <div className="sm:col-span-7">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Producto / Accesorio</label>
                                <select
                                    value={productoSeleccionadoId}
                                    onChange={(e) => setProductoSeleccionadoId(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-yellow-400 outline-none bg-white text-slate-900 font-medium"
                                >
                                    <option value="">Selecciona un ítem...</option>
                                    <optgroup label="Cilindros de Gas">
                                        {CATALOGO_PRODUCTOS.filter(p => p.categoria === 'Gas').map(prod => (
                                            <option key={prod.id} value={prod.id}>
                                                {prod.nombre} - ${prod.precio.toLocaleString('es-CL')}
                                            </option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Conectores y Accesorios">
                                        {CATALOGO_PRODUCTOS.filter(p => p.categoria === 'Accesorios').map(prod => (
                                            <option key={prod.id} value={prod.id}>
                                                {prod.nombre} - ${prod.precio.toLocaleString('es-CL')}
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Cantidad</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={cantidadItem}
                                    onChange={(e) => setCantidadItem(Number(e.target.value))}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-yellow-400 outline-none text-center text-slate-900 bg-white font-bold"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <button
                                    type="button"
                                    onClick={agregarAlPedido}
                                    className="w-full bg-blue-950 hover:bg-blue-900 text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                >
                                    <i className="ph ph-plus-circle text-lg"></i> Agregar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* DETALLE DEL PEDIDO (TABLA DE ÍTEMS) */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-4 bg-slate-100 border-b border-slate-200">
                            <h3 className="font-bold text-slate-800 text-md">Productos Agregados</h3>
                        </div>

                        {itemsPedido.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <i className="ph ph-shopping-cart text-4xl mb-2 text-slate-300 block"></i>
                                Tu lista de pedido está vacía. Elige un producto de arriba y haz clic en "Agregar".
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                        <th className="p-3">Producto</th>
                                        <th className="p-3 text-center">Precio Unit.</th>
                                        <th className="p-3 text-center">Cantidad</th>
                                        <th className="p-3 text-right">Subtotal</th>
                                        <th className="p-3 text-center">Quitar</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                    {itemsPedido.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition">
                                            <td className="p-3 font-semibold text-slate-800">{item.nombre}</td>
                                            <td className="p-3 text-center text-slate-600">${item.precio.toLocaleString('es-CL')}</td>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="20"
                                                    value={item.cantidad}
                                                    onChange={(e) => cambiarCantidadTabla(item.id, Number(e.target.value))}
                                                    className="w-14 px-2 py-1 border border-slate-300 rounded-lg text-center font-bold text-slate-800"
                                                />
                                            </td>
                                            <td className="p-3 text-right font-bold text-slate-900">
                                                ${(item.precio * item.cantidad).toLocaleString('es-CL')}
                                            </td>
                                            <td className="p-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarItem(item.id)}
                                                    className="text-red-500 hover:text-red-700 transition p-1 cursor-pointer"
                                                    title="Eliminar ítem"
                                                >
                                                    <i className="ph ph-trash text-lg"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot>
                                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                                        <td colSpan="3" className="p-4 text-right font-black text-slate-800 text-base">Total a Pagar:</td>
                                        <td className="p-4 text-right font-black text-blue-950 text-xl">
                                            ${totalPedido.toLocaleString('es-CL')}
                                        </td>
                                        <td></td>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* MENSAJE DE ERROR */}
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm font-semibold p-4 rounded-xl flex items-center gap-2 border border-red-200">
                            <i className="ph ph-warning-circle text-xl"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* BOTÓN CONFIRMAR */}
                    <button
                        type="submit"
                        disabled={itemsPedido.length === 0}
                        className={`w-full py-4 rounded-full font-extrabold text-lg transition shadow-md flex justify-center items-center gap-2 cursor-pointer ${
                            itemsPedido.length > 0
                                ? 'bg-yellow-400 hover:bg-yellow-500 text-blue-950'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        Confirmar Pedido (${totalPedido.toLocaleString('es-CL')}) <i className="ph ph-check-circle text-xl"></i>
                    </button>
                </form>
            </section>
        </main>
    );
};

export default Pedido;