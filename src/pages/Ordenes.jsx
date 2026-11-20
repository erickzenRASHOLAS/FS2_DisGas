import { Fragment, useEffect, useState } from 'react';
import { useSesion } from '../services/useSesion';
import { boletasApi } from '../services/servicios';
import { mensajeDeError } from '../services/api';
import { claseEstado, etiquetaEstado, formatoFecha, formatoPeso, resumenProductos } from '../services/formato';

// Siguiente paso del flujo que valida el backend: PENDIENTE -> EN_RUTA -> ENTREGADO
const SIGUIENTE = { PENDIENTE: 'EN_RUTA', EN_RUTA: 'ENTREGADO' };
const TEXTO_AVANZAR = { PENDIENTE: 'Enviar a ruta', EN_RUTA: 'Marcar entregado' };
const FILTROS = [['', 'Todas'], ['PENDIENTE', 'Pendientes'], ['EN_RUTA', 'En ruta'], ['ENTREGADO', 'Entregadas'], ['CANCELADO', 'Canceladas']];

/**
 * Lista de órdenes (boletas).
 *  - VENDEDOR: solo lectura (lista y detalle).
 *  - ADMINISTRADOR: además cambia el estado y cancela.
 * El backend vuelve a validar el rol en cada petición; ocultar los botones es solo la parte visual.
 */
export default function Ordenes() {
  const usuario = useSesion();
  const esAdmin = usuario?.rol === 'ADMINISTRADOR';
  const [ordenes, setOrdenes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [abierta, setAbierta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const cargar = () => boletasApi.listar()                     // GET /v1/boletas (ADMIN y VENDEDOR ven todas)
    .then((lista) => setOrdenes(lista))
    .catch((e) => setMensaje({ tipo: 'error', texto: mensajeDeError(e, 'No se pudieron cargar las órdenes.') }))
    .finally(() => setCargando(false));

  useEffect(() => { cargar(); }, []);

  const avanzar = async (orden) => {
    try {
      await boletasApi.cambiarEstado(orden.id, SIGUIENTE[orden.estado]);   // PUT /v1/boletas/{id}/estado
      setMensaje({ tipo: 'ok', texto: `Orden #${orden.id} actualizada.` });
      await cargar();
    } catch (e) { setMensaje({ tipo: 'error', texto: mensajeDeError(e) }); }
  };

  const cancelar = async (orden) => {
    if (!window.confirm(`¿Cancelar la orden #${orden.id}? Se devolverá el stock.`)) return;
    try {
      await boletasApi.cancelar(orden.id);                                   // PUT /v1/boletas/{id}/cancelar
      setMensaje({ tipo: 'ok', texto: `Orden #${orden.id} cancelada.` });
      await cargar();
    } catch (e) { setMensaje({ tipo: 'error', texto: mensajeDeError(e) }); }
  };

  const visibles = ordenes.filter((o) => !filtro || o.estado === filtro);
  const activas = ordenes.filter((o) => o.estado === 'PENDIENTE' || o.estado === 'EN_RUTA').length;
  const columnas = esAdmin ? 7 : 6;

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="text-sm font-bold uppercase tracking-widest text-amber-600">Operaciones</p><h1 className="mt-1 text-3xl font-black text-blue-950">Órdenes</h1><p className="mt-2 text-slate-600">{esAdmin ? 'Revisa los pedidos, cambia su estado o cancélalos.' : 'Consulta la lista de pedidos y su detalle.'}</p></div>
        <button onClick={cargar} className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-50">Actualizar lista</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Órdenes registradas</p><p className="mt-2 text-3xl font-black text-blue-950">{ordenes.length}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Activas (pendientes o en ruta)</p><p className="mt-2 text-3xl font-black text-amber-600">{activas}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Entregadas</p><p className="mt-2 text-3xl font-black text-green-700">{ordenes.filter((o) => o.estado === 'ENTREGADO').length}</p></div>
      </div>

      {mensaje.texto && <div role={mensaje.tipo === 'error' ? 'alert' : 'status'} className={`rounded-xl border p-4 text-sm font-semibold ${mensaje.tipo === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800'}`}>{mensaje.texto}</div>}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {FILTROS.map(([valor, texto]) => <button key={valor} onClick={() => setFiltro(valor)} aria-pressed={filtro === valor} className={`rounded-full px-4 py-1.5 text-sm font-bold ${filtro === valor ? 'bg-blue-950 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>{texto}</button>)}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-blue-950 text-white"><tr>{['Orden / fecha', 'Cliente y dirección', 'Productos', 'Total', 'Estado', 'Detalle'].concat(esAdmin ? ['Acciones'] : []).map((t) => <th key={t} className="px-4 py-3 font-bold">{t}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {visibles.map((orden) => <Fragment key={orden.id}>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-4"><p className="font-bold text-blue-950">#{orden.id}</p><p className="text-xs text-slate-500">{formatoFecha(orden.fecha)}</p></td>
                  <td className="px-4 py-4"><p className="font-semibold text-slate-800">{orden.usuario?.nombre}</p><p className="max-w-48 text-xs text-slate-500">{orden.direccion}</p><p className="text-xs text-slate-500">{orden.usuario?.telefono}</p></td>
                  <td className="max-w-52 px-4 py-4">{resumenProductos(orden)}</td>
                  <td className="whitespace-nowrap px-4 py-4 font-semibold">{formatoPeso(orden.total)}</td>
                  <td className="px-4 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${claseEstado(orden.estado)}`}>{etiquetaEstado(orden.estado)}</span></td>
                  <td className="px-4 py-4"><button onClick={() => setAbierta(abierta === orden.id ? null : orden.id)} aria-expanded={abierta === orden.id} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold hover:bg-slate-50">{abierta === orden.id ? 'Ocultar' : 'Ver detalle'}</button></td>
                  {esAdmin && <td className="px-4 py-4"><div className="flex flex-col gap-2">
                    {SIGUIENTE[orden.estado] && <button onClick={() => avanzar(orden)} className="rounded-lg bg-blue-950 px-3 py-2 font-bold text-white hover:bg-blue-900">{TEXTO_AVANZAR[orden.estado]}</button>}
                    {(orden.estado === 'PENDIENTE' || orden.estado === 'EN_RUTA') && <button onClick={() => cancelar(orden)} className="rounded-lg border border-red-200 px-3 py-2 font-bold text-red-700 hover:bg-red-50">Cancelar</button>}
                    {!SIGUIENTE[orden.estado] && orden.estado !== 'PENDIENTE' && orden.estado !== 'EN_RUTA' && <span className="text-slate-400">—</span>}
                  </div></td>}
                </tr>
                {abierta === orden.id && <tr className="bg-slate-50"><td colSpan={columnas} className="px-6 py-4">
                  <p className="text-sm font-bold text-blue-950">Detalle de la orden #{orden.id}</p>
                  <p className="mt-1 text-xs text-slate-500">Cliente: {orden.usuario?.nombre} ({orden.usuario?.correo}) · Despacho: {orden.direccion}</p>
                  <table className="mt-3 w-full max-w-2xl text-left text-sm"><thead className="text-xs text-slate-500"><tr><th className="py-1 pr-4">Producto</th><th className="py-1 pr-4">Cantidad</th><th className="py-1 pr-4">Precio unitario</th><th className="py-1 text-right">Subtotal</th></tr></thead><tbody>{(orden.detalles ?? []).map((d) => <tr key={d.id}><td className="py-1 pr-4 font-semibold">{d.producto?.nombre}</td><td className="py-1 pr-4">{d.cantidad}</td><td className="py-1 pr-4">{formatoPeso(d.precioUnitario)}</td><td className="py-1 text-right font-semibold">{formatoPeso(d.subtotal)}</td></tr>)}</tbody><tfoot><tr><td colSpan="3" className="pt-2 text-right font-bold">Total</td><td className="pt-2 text-right font-black text-blue-950">{formatoPeso(orden.total)}</td></tr></tfoot></table>
                </td></tr>}
              </Fragment>)}
              {cargando && <tr><td colSpan={columnas} className="px-4 py-12 text-center text-slate-500">Cargando órdenes...</td></tr>}
              {!cargando && visibles.length === 0 && <tr><td colSpan={columnas} className="px-4 py-12 text-center text-slate-500">No hay órdenes para mostrar.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
