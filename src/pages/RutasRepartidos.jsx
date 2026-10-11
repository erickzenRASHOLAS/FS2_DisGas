import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { actualizarEstadoPedido, obtenerPedidos, obtenerUsuarioActual, registrarPagoEfectivo } from '../services/datosMock';

const formatoPeso = (monto) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(monto ?? 0));

export default function RutasRepartidor() {
  const [usuario] = useState(() => obtenerUsuarioActual());
  const [pedidos, setPedidos] = useState([]);
  const [mensaje, setMensaje] = useState('');

  const cargar = () => {
    const todos = obtenerPedidos();
    setPedidos(usuario ? todos.filter((pedido) => String(pedido.repartidorId) === String(usuario.id)) : []);
  };
  useEffect(() => { cargar(); }, [usuario?.id]);

  const marcarEnRuta = (pedido) => {
    const resultado = actualizarEstadoPedido(pedido.id, 'En Ruta');
    setMensaje(resultado.mensaje);
    cargar();
  };

  const marcarEntregado = (pedido) => {
    if (!window.confirm(`¿Confirmas que el pedido ${pedido.id} fue entregado a ${pedido.cliente}?`)) return;
    const estado = actualizarEstadoPedido(pedido.id, 'Entregado');
    if (!estado.exito) { setMensaje(estado.mensaje); return; }
    if (!pedido.pagoRegistrado) {
      const confirmaPago = window.confirm(`¿Confirmas también el cobro en efectivo por ${formatoPeso(pedido.total)}?`);
      if (confirmaPago) {
        const pago = registrarPagoEfectivo(pedido.id);
        setMensaje(pago.mensaje);
      } else {
        setMensaje('Entrega marcada. El cobro queda pendiente para regularizarlo con administración.');
      }
    } else setMensaje('Entrega marcada como realizada. El pago ya estaba registrado.');
    cargar();
  };

  if (!usuario) return <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-black text-blue-950">Vista del repartidor</h1><p className="mt-2 text-slate-600">Inicia sesión con una cuenta de repartidor para consultar tus entregas asignadas.</p><Link to="/login" className="mt-5 inline-flex rounded-xl bg-blue-950 px-5 py-3 font-bold text-white">Iniciar sesión</Link></section>;
  if (usuario.rol !== 'Repartidor') return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><h1 className="text-xl font-bold text-amber-900">Acceso de demostración</h1><p className="mt-2 text-amber-800">La cuenta actual no tiene el rol Repartidor. Cierra sesión e ingresa con una cuenta de reparto.</p></section>;

  const activos = pedidos.filter((p) => p.estado !== 'Entregado');
  const entregados = pedidos.filter((p) => p.estado === 'Entregado');

  return (
    <section className="space-y-6">
      <div><p className="text-sm font-bold uppercase tracking-widest text-amber-600">Reparto</p><h1 className="mt-1 text-3xl font-black text-blue-950">Mis entregas</h1><p className="mt-2 text-slate-600">Hola, {usuario.nombre}. Aquí aparecen solo los pedidos asignados a tu usuario.</p></div>
      {mensaje && <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-900">{mensaje}</div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Entregas pendientes</p><p className="mt-1 text-3xl font-black text-blue-950">{activos.length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Completadas</p><p className="mt-1 text-3xl font-black text-green-700">{entregados.length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Con pago registrado</p><p className="mt-1 text-3xl font-black text-amber-600">{pedidos.filter((p) => p.pagoRegistrado).length}</p></div></div>
      <div className="space-y-4">
        {pedidos.map((pedido) => <article key={pedido.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{pedido.id} · {pedido.fecha}</p><h2 className="mt-1 text-xl font-extrabold text-blue-950">{pedido.cliente}</h2><p className="mt-1 text-slate-600">{pedido.producto}</p></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${pedido.estado === 'Entregado' ? 'bg-green-100 text-green-800' : pedido.estado === 'En Ruta' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{pedido.estado}</span></div>
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2"><div><p className="font-bold text-slate-700">Dirección</p><p className="mt-1 text-slate-600">{pedido.direccion}</p></div><div><p className="font-bold text-slate-700">Contacto</p><p className="mt-1 text-slate-600">{pedido.telefono}</p></div><div><p className="font-bold text-slate-700">Total a cobrar</p><p className="mt-1 text-lg font-black text-blue-950">{formatoPeso(pedido.total)}</p></div><div><p className="font-bold text-slate-700">Pago</p><p className="mt-1 text-slate-600">{pedido.pagoRegistrado ? 'Registrado' : 'Pendiente'}</p></div></div>
          {pedido.estado !== 'Entregado' && <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">{pedido.estado !== 'En Ruta' && <button onClick={() => marcarEnRuta(pedido)} className="rounded-xl border border-blue-950 px-5 py-3 font-bold text-blue-950 hover:bg-blue-50">Marcar en ruta</button>}<button onClick={() => marcarEntregado(pedido)} className="rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800">Confirmar entrega</button></div>}
        </article>)}
        {pedidos.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="text-lg font-bold text-slate-800">No tienes pedidos asignados</p><p className="mt-2 text-slate-500">La operadora debe asignarte pedidos desde el panel de despacho.</p></div>}
      </div>
    </section>
  );
}
