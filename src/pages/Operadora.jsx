import { useEffect, useState } from 'react';
import { asignarRepartidor, obtenerPedidos, obtenerRepartidores, actualizarEstadoPedido } from '../services/datosMock';

const formatoPeso = (monto) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(monto ?? 0));
const colorEstado = (estado) => estado === 'Entregado' ? 'bg-green-100 text-green-800' : estado === 'En Ruta' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800';

export default function Operadora() {
  const [pedidos, setPedidos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});
  const [mensaje, setMensaje] = useState('');

  const cargarDatos = () => {
    const lista = obtenerPedidos();
    setPedidos(lista);
    setRepartidores(obtenerRepartidores());
    setSeleccionados(Object.fromEntries(lista.map((p) => [p.id, p.repartidorId ? String(p.repartidorId) : ''])));
  };

  useEffect(() => { cargarDatos(); }, []);

  const manejarAsignacion = (pedidoId) => {
    const repartidorId = seleccionados[pedidoId];
    if (!repartidorId) {
      setMensaje('Selecciona un repartidor antes de asignar el pedido.');
      return;
    }
    const resultado = asignarRepartidor(pedidoId, repartidorId);
    setMensaje(resultado.mensaje);
    cargarDatos();
  };

  const cambiarEstado = (pedido, nuevoEstado) => {
    const resultado = actualizarEstadoPedido(pedido.id, nuevoEstado);
    setMensaje(resultado.mensaje);
    cargarDatos();
  };

  const pendientes = pedidos.filter((p) => p.estado !== 'Entregado').length;
  const asignados = pedidos.filter((p) => p.repartidorId && p.estado !== 'Entregado').length;

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="text-sm font-bold uppercase tracking-widest text-amber-600">Operaciones</p><h1 className="mt-1 text-3xl font-black text-blue-950">Panel de despacho</h1><p className="mt-2 text-slate-600">Revisa los pedidos, asigna un repartidor y actualiza su estado.</p></div>
        <button onClick={cargarDatos} className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-50">Actualizar lista</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Pedidos registrados</p><p className="mt-2 text-3xl font-black text-blue-950">{pedidos.length}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Pendientes de entrega</p><p className="mt-2 text-3xl font-black text-amber-600">{pendientes}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Pedidos asignados activos</p><p className="mt-2 text-3xl font-black text-green-700">{asignados}</p></div>
      </div>

      {mensaje && <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-900">{mensaje}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4"><h2 className="text-lg font-bold text-blue-950">Pedidos</h2><p className="text-sm text-slate-500">Los cambios quedan guardados en el navegador de demostración.</p></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-blue-950 text-white"><tr>{['Orden / fecha', 'Cliente y dirección', 'Productos', 'Total', 'Estado', 'Repartidor', 'Acciones'].map((t) => <th key={t} className="px-4 py-3 font-bold">{t}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {pedidos.map((pedido) => <tr key={pedido.id} className="hover:bg-slate-50">
                <td className="px-4 py-4"><p className="font-bold text-blue-950">{pedido.id}</p><p className="text-xs text-slate-500">{pedido.fecha}</p></td>
                <td className="px-4 py-4"><p className="font-semibold text-slate-800">{pedido.cliente}</p><p className="max-w-48 text-xs text-slate-500">{pedido.direccion}</p><p className="text-xs text-slate-500">{pedido.telefono}</p></td>
                <td className="max-w-52 px-4 py-4">{pedido.producto}</td>
                <td className="whitespace-nowrap px-4 py-4 font-semibold">{formatoPeso(pedido.total)}</td>
                <td className="px-4 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${colorEstado(pedido.estado)}`}>{pedido.estado}</span><p className="mt-1 text-xs text-slate-500">{pedido.pagoRegistrado ? 'Pago registrado' : 'Pago pendiente'}</p></td>
                <td className="px-4 py-4"><label className="sr-only" htmlFor={`rep-${pedido.id}`}>Repartidor para {pedido.id}</label><select id={`rep-${pedido.id}`} value={seleccionados[pedido.id] ?? ''} onChange={(e) => setSeleccionados((actual) => ({ ...actual, [pedido.id]: e.target.value }))} className="w-44 rounded-lg border border-slate-300 bg-white px-2 py-2"><option value="">Sin asignar</option>{repartidores.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}</select></td>
                <td className="px-4 py-4"><div className="flex flex-col gap-2"><button onClick={() => manejarAsignacion(pedido.id)} disabled={pedido.estado === 'Entregado'} className="rounded-lg bg-blue-950 px-3 py-2 font-bold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-40">Asignar</button><select aria-label={`Estado del pedido ${pedido.id}`} value={pedido.estado} onChange={(e) => cambiarEstado(pedido, e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-2" disabled={pedido.estado === 'Entregado'}><option>Pendiente</option><option>En Ruta</option>{pedido.estado === 'Entregado' && <option>Entregado</option>}</select></div></td>
              </tr>)}
              {pedidos.length === 0 && <tr><td colSpan="7" className="px-4 py-12 text-center text-slate-500">Todavía no hay pedidos registrados.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
