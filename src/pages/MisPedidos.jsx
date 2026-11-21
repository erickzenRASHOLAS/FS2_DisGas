import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSesion } from '../services/useSesion';
import { boletasApi } from '../services/servicios';
import { mensajeDeError } from '../services/api';
import { claseEstado, etiquetaEstado, formatoFecha, formatoPeso, resumenProductos } from '../services/formato';

export default function MisPedidos() {
  const usuario = useSesion();
  const location = useLocation();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState(location.state?.mensaje ?? '');

  // GET /v1/boletas: para un CLIENTE el backend devuelve solo sus boletas
  const cargar = () => boletasApi.listar()
    .then((lista) => { setPedidos(lista); setError(''); })
    .catch((e) => setError(mensajeDeError(e, 'No se pudieron cargar tus pedidos.')))
    .finally(() => setCargando(false));

  useEffect(() => { if (usuario) cargar(); }, [usuario?.id]);

  const cancelar = async (pedido) => {
    if (!window.confirm(`¿Cancelar el pedido #${pedido.id}? Se devolverá el stock.`)) return;
    try {
      await boletasApi.cancelar(pedido.id);   // PUT /v1/boletas/{id}/cancelar
      setMensaje(`Pedido #${pedido.id} cancelado.`);
      setError('');
      await cargar();
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo cancelar el pedido.'));
    }
  };

  if (!usuario) return <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-black text-blue-950">Mis pedidos</h1><p className="mt-2 text-slate-600">Inicia sesión para revisar tu historial.</p><Link to="/login" className="mt-5 inline-flex rounded-xl bg-blue-950 px-5 py-3 font-bold text-white">Iniciar sesión</Link></section>;

  return <section className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-widest text-amber-600">Sucursal virtual</p><h1 className="mt-1 text-3xl font-black text-blue-950">Mis pedidos</h1><p className="mt-2 text-slate-600">Consulta el historial y el estado actualizado de tus solicitudes, {usuario.nombre}.</p></div><Link to="/pedido" className="inline-flex justify-center rounded-xl bg-yellow-400 px-5 py-3 font-bold text-blue-950 hover:bg-yellow-300">+ Nuevo pedido</Link></div>
    {mensaje && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">{mensaje}</div>}
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 bg-slate-50 px-5 py-4"><h2 className="font-bold text-blue-950">Historial de solicitudes</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-blue-950 text-white"><tr>{['Número', 'Fecha', 'Productos', 'Total', 'Estado', 'Acciones'].map((col) => <th key={col} className="px-4 py-3 font-bold">{col}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{pedidos.map((pedido) => <tr key={pedido.id} className="hover:bg-slate-50"><td className="px-4 py-4 font-bold text-blue-950">#{pedido.id}</td><td className="whitespace-nowrap px-4 py-4">{formatoFecha(pedido.fecha)}</td><td className="max-w-64 px-4 py-4">{resumenProductos(pedido)}</td><td className="whitespace-nowrap px-4 py-4 font-semibold">{formatoPeso(pedido.total)}</td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${claseEstado(pedido.estado)}`}>{etiquetaEstado(pedido.estado)}</span></td><td className="px-4 py-4">{pedido.estado === 'PENDIENTE' ? <button onClick={() => cancelar(pedido)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50">Cancelar</button> : <span className="text-slate-400">—</span>}</td></tr>)}{!cargando && pedidos.length === 0 && <tr><td colSpan="6" className="px-4 py-12 text-center"><p className="font-bold text-slate-800">Todavía no tienes pedidos</p><p className="mt-1 text-slate-500">Crea tu primera solicitud para que aparezca en este historial.</p><Link to="/pedido" className="mt-4 inline-flex rounded-lg bg-yellow-400 px-4 py-2 font-bold text-blue-950">Crear pedido</Link></td></tr>}{cargando && <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-500">Cargando pedidos...</td></tr>}</tbody></table></div></div>
  </section>;
}
