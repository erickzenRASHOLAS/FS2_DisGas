import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerPedidosPorCliente, obtenerUsuarioActual } from '../services/datosMock';

const formatoPeso = (monto) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(monto ?? 0));

export default function MisPedidos() {
  const [usuario] = useState(() => obtenerUsuarioActual());
  const [pedidos, setPedidos] = useState([]);
  useEffect(() => { if (usuario) setPedidos(obtenerPedidosPorCliente(usuario.id)); }, [usuario?.id]);

  if (!usuario) return <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-black text-blue-950">Mis pedidos</h1><p className="mt-2 text-slate-600">Inicia sesión para revisar tu historial.</p><Link to="/login" className="mt-5 inline-flex rounded-xl bg-blue-950 px-5 py-3 font-bold text-white">Iniciar sesión</Link></section>;

  return <section className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-widest text-amber-600">Sucursal virtual</p><h1 className="mt-1 text-3xl font-black text-blue-950">Mis pedidos</h1><p className="mt-2 text-slate-600">Consulta el historial y el estado actualizado de tus solicitudes, {usuario.nombre}.</p></div><Link to="/pedido" className="inline-flex justify-center rounded-xl bg-yellow-400 px-5 py-3 font-bold text-blue-950 hover:bg-yellow-300">+ Nuevo pedido</Link></div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 bg-slate-50 px-5 py-4"><h2 className="font-bold text-blue-950">Historial de solicitudes</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-blue-950 text-white"><tr>{['Número', 'Fecha', 'Productos', 'Total', 'Estado', 'Pago'].map((col) => <th key={col} className="px-4 py-3 font-bold">{col}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{pedidos.map((pedido) => <tr key={pedido.id} className="hover:bg-slate-50"><td className="px-4 py-4 font-bold text-blue-950">{pedido.id}</td><td className="whitespace-nowrap px-4 py-4">{pedido.fecha}</td><td className="max-w-64 px-4 py-4">{pedido.producto}</td><td className="whitespace-nowrap px-4 py-4 font-semibold">{formatoPeso(pedido.total)}</td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${pedido.estado === 'Entregado' ? 'bg-green-100 text-green-800' : pedido.estado === 'En Ruta' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{pedido.estado}</span></td><td className="px-4 py-4">{pedido.pagoRegistrado ? <span className="font-semibold text-green-700">Pagado</span> : <span className="text-slate-500">Pendiente</span>}</td></tr>)}{pedidos.length === 0 && <tr><td colSpan="6" className="px-4 py-12 text-center"><p className="font-bold text-slate-800">Todavía no tienes pedidos</p><p className="mt-1 text-slate-500">Crea tu primera solicitud para que aparezca en este historial.</p><Link to="/pedido" className="mt-4 inline-flex rounded-lg bg-yellow-400 px-4 py-2 font-bold text-blue-950">Crear pedido</Link></td></tr>}</tbody></table></div></div>
  </section>;
}
