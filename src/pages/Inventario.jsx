import { useEffect, useState } from 'react';
import { guardarInventario, obtenerInventario } from '../services/datosMock';

export default function Inventario() {
  const [inventario, setInventario] = useState([]);
  const [mensaje, setMensaje] = useState('');
  useEffect(() => { setInventario(obtenerInventario()); }, []);
  const cambiarStock = (id, stock) => setInventario((actual) => actual.map((item) => item.id === id ? { ...item, stock } : item));
  const guardar = () => { const resultado = guardarInventario(inventario); setMensaje(resultado.mensaje); if (resultado.exito) setInventario(obtenerInventario()); };
  const total = inventario.reduce((suma, item) => suma + Number(item.stock || 0), 0);
  const bajoMinimo = inventario.filter((item) => Number(item.stock) <= item.minimo).length;

  return <section className="space-y-6">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-widest text-amber-600">Administración</p><h1 className="mt-1 text-3xl font-black text-blue-950">Inventario de cilindros</h1><p className="mt-2 text-slate-600">Edita el stock disponible por capacidad.</p></div><button onClick={guardar} className="rounded-xl bg-blue-950 px-5 py-3 font-bold text-white hover:bg-blue-900">Guardar inventario</button></div>
    {mensaje && <div role="status" className={`rounded-xl border p-4 text-sm font-semibold ${mensaje.startsWith('El stock') || mensaje.startsWith('No ') ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800'}`}>{mensaje}</div>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Unidades disponibles</p><p className="mt-2 text-3xl font-black text-blue-950">{total}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Tipos de cilindro</p><p className="mt-2 text-3xl font-black text-blue-950">{inventario.length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Stock bajo o crítico</p><p className={`mt-2 text-3xl font-black ${bajoMinimo ? 'text-red-600' : 'text-green-700'}`}>{bajoMinimo}</p></div></div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-blue-950 text-white"><tr><th className="px-5 py-3">Producto</th><th className="px-5 py-3">Capacidad</th><th className="px-5 py-3">Stock disponible</th><th className="px-5 py-3">Stock mínimo</th><th className="px-5 py-3">Estado</th></tr></thead><tbody className="divide-y divide-slate-100">{inventario.map((item) => <tr key={item.id}><td className="px-5 py-4 font-semibold text-slate-800">{item.producto}</td><td className="px-5 py-4">{item.capacidad}</td><td className="px-5 py-4"><label className="sr-only" htmlFor={`stock-${item.id}`}>Stock de {item.producto}</label><input id={`stock-${item.id}`} type="number" min="0" step="1" value={item.stock} onChange={(e) => cambiarStock(item.id, e.target.value)} className="w-28 rounded-lg border border-slate-300 px-3 py-2" /></td><td className="px-5 py-4">{item.minimo}</td><td className="px-5 py-4">{Number(item.stock) <= item.minimo ? <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">Reponer</span> : <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">Suficiente</span>}</td></tr>)}</tbody></table></div></div>
    <p className="text-xs text-slate-500">Nota: esta pantalla persiste los cambios en el navegador de demostración. El stock todavía no se descuenta automáticamente al crear o entregar pedidos y no está conectado a un backend.</p>
  </section>;
}
