import { useEffect, useState } from 'react';
import { useSesion } from '../services/useSesion';
import { categoriasApi, productosApi } from '../services/servicios';
import { mensajeDeError } from '../services/api';
import { formatoPeso } from '../services/formato';

const VACIO = { nombre: '', descripcion: '', precio: '', stock: '', stockMinimo: '', categoriaId: '', activo: true };

/**
 * Inventario de productos (conectado a /v1/productos).
 *  - ADMINISTRADOR: crea, edita (precio, stock, mínimo, activo) y elimina.
 *  - VENDEDOR: solo ve la lista y el detalle.
 * El backend rechaza con 403 cualquier escritura que no venga de un ADMINISTRADOR.
 */
export default function Inventario() {
  const usuario = useSesion();
  const esAdmin = usuario?.rol === 'ADMINISTRADOR';
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [detalle, setDetalle] = useState(null);       // producto abierto en el panel de detalle
  const [form, setForm] = useState(null);              // null = formulario cerrado; { id?, ...campos }
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try {
      // GET /v1/productos/todos incluye los inactivos (solo ADMINISTRADOR y VENDEDOR)
      const [lista, cats] = await Promise.all([productosApi.listarTodos(), categoriasApi.listar()]);
      setProductos(lista);
      setCategorias(cats);
    } catch (e) {
      setMensaje({ tipo: 'error', texto: mensajeDeError(e, 'No se pudo cargar el inventario.') });
    } finally { setCargando(false); }
  };
  useEffect(() => { cargar(); }, []);

  const total = productos.reduce((suma, p) => suma + Number(p.stock || 0), 0);
  const bajoMinimo = productos.filter((p) => p.activo && Number(p.stock) <= Number(p.stockMinimo)).length;

  const abrirNuevo = () => { setDetalle(null); setForm({ ...VACIO, categoriaId: categorias[0]?.id ?? '' }); };
  const abrirEdicion = (p) => { setDetalle(null); setForm({ id: p.id, nombre: p.nombre, descripcion: p.descripcion ?? '', precio: p.precio, stock: p.stock, stockMinimo: p.stockMinimo, categoriaId: p.categoria?.id ?? '', activo: p.activo }); };
  const cambiar = (e) => { const { name, value, type, checked } = e.target; setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value })); };

  const guardar = async (e) => {
    e.preventDefault();
    const enteros = ['precio', 'stock', 'stockMinimo'];
    if (!form.nombre.trim() || !form.categoriaId || enteros.some((c) => String(form[c]).trim() === '' || !Number.isInteger(Number(form[c])) || Number(form[c]) < 0)) {
      setMensaje({ tipo: 'error', texto: 'Completa el nombre, la categoría y usa números enteros iguales o mayores que cero en precio, stock y stock mínimo.' });
      return;
    }
    const cuerpo = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      stock: Number(form.stock),
      stockMinimo: Number(form.stockMinimo),
      activo: form.activo,
      categoria: { id: Number(form.categoriaId) },
    };
    setGuardando(true);
    try {
      if (form.id) await productosApi.actualizar(form.id, cuerpo);   // PUT /v1/productos/{id}
      else await productosApi.crear(cuerpo);                          // POST /v1/productos
      setMensaje({ tipo: 'ok', texto: form.id ? 'Producto actualizado.' : 'Producto creado.' });
      setForm(null);
      await cargar();
    } catch (err) { setMensaje({ tipo: 'error', texto: mensajeDeError(err) }); }
    finally { setGuardando(false); }
  };

  const eliminar = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}"?`)) return;
    try {
      await productosApi.eliminar(p.id);                              // DELETE /v1/productos/{id} (409 si ya está en boletas)
      setMensaje({ tipo: 'ok', texto: 'Producto eliminado.' });
      setDetalle(null);
      await cargar();
    } catch (err) { setMensaje({ tipo: 'error', texto: mensajeDeError(err, 'No se pudo eliminar el producto.') }); }
  };

  const campo = 'w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200';

  return <section className="space-y-6">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-widest text-amber-600">{esAdmin ? 'Administración' : 'Consulta'}</p><h1 className="mt-1 text-3xl font-black text-blue-950">Inventario de productos</h1><p className="mt-2 text-slate-600">{esAdmin ? 'Administra productos, precios y stock.' : 'Consulta los productos y su detalle.'}</p></div>{esAdmin && <button onClick={abrirNuevo} className="rounded-xl bg-blue-950 px-5 py-3 font-bold text-white hover:bg-blue-900">+ Nuevo producto</button>}</div>
    {mensaje.texto && <div role={mensaje.tipo === 'error' ? 'alert' : 'status'} className={`rounded-xl border p-4 text-sm font-semibold ${mensaje.tipo === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800'}`}>{mensaje.texto}</div>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Unidades disponibles</p><p className="mt-2 text-3xl font-black text-blue-950">{total}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Productos</p><p className="mt-2 text-3xl font-black text-blue-950">{productos.length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Stock bajo o crítico</p><p className={`mt-2 text-3xl font-black ${bajoMinimo ? 'text-red-600' : 'text-green-700'}`}>{bajoMinimo}</p></div></div>

    {esAdmin && form && <form onSubmit={guardar} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label={form.id ? 'Editar producto' : 'Nuevo producto'}>
      <h2 className="text-lg font-bold text-blue-950">{form.id ? `Editar producto #${form.id}` : 'Nuevo producto'}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div><label htmlFor="prod-nombre" className="mb-1 block text-sm font-semibold text-slate-700">Nombre</label><input id="prod-nombre" name="nombre" value={form.nombre} onChange={cambiar} className={campo} /></div>
        <div><label htmlFor="prod-categoria" className="mb-1 block text-sm font-semibold text-slate-700">Categoría</label><select id="prod-categoria" name="categoriaId" value={form.categoriaId} onChange={cambiar} className={campo}><option value="">Selecciona...</option>{categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
        <div className="sm:col-span-2"><label htmlFor="prod-descripcion" className="mb-1 block text-sm font-semibold text-slate-700">Descripción</label><input id="prod-descripcion" name="descripcion" value={form.descripcion} onChange={cambiar} className={campo} /></div>
        <div><label htmlFor="prod-precio" className="mb-1 block text-sm font-semibold text-slate-700">Precio (CLP)</label><input id="prod-precio" name="precio" type="number" min="0" step="1" value={form.precio} onChange={cambiar} className={campo} /></div>
        <div><label htmlFor="prod-stock" className="mb-1 block text-sm font-semibold text-slate-700">Stock disponible</label><input id="prod-stock" name="stock" type="number" min="0" step="1" value={form.stock} onChange={cambiar} className={campo} /></div>
        <div><label htmlFor="prod-minimo" className="mb-1 block text-sm font-semibold text-slate-700">Stock mínimo</label><input id="prod-minimo" name="stockMinimo" type="number" min="0" step="1" value={form.stockMinimo} onChange={cambiar} className={campo} /></div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold text-slate-700"><input type="checkbox" name="activo" checked={form.activo} onChange={cambiar} /> Visible en la tienda</label>
      </div>
      <div className="flex gap-3"><button type="submit" disabled={guardando} className="rounded-xl bg-blue-950 px-5 py-3 font-bold text-white hover:bg-blue-900 disabled:opacity-60">{guardando ? 'Guardando...' : 'Guardar producto'}</button><button type="button" onClick={() => setForm(null)} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">Cancelar</button></div>
    </form>}

    {detalle && <aside className="rounded-2xl border border-blue-200 bg-blue-50 p-5" aria-label="Detalle del producto">
      <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-blue-950">{detalle.nombre}</h2><p className="text-sm text-slate-600">{detalle.descripcion || 'Sin descripción.'}</p></div><button onClick={() => setDetalle(null)} className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-bold text-blue-900">Cerrar</button></div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5"><div><dt className="text-slate-500">Categoría</dt><dd className="font-semibold">{detalle.categoria?.nombre}</dd></div><div><dt className="text-slate-500">Precio</dt><dd className="font-semibold">{formatoPeso(detalle.precio)}</dd></div><div><dt className="text-slate-500">Stock</dt><dd className="font-semibold">{detalle.stock}</dd></div><div><dt className="text-slate-500">Stock mínimo</dt><dd className="font-semibold">{detalle.stockMinimo}</dd></div><div><dt className="text-slate-500">En tienda</dt><dd className="font-semibold">{detalle.activo ? 'Sí' : 'No'}</dd></div></dl>
    </aside>}

    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-blue-950 text-white"><tr>{['Producto', 'Categoría', 'Precio', 'Stock', 'Mínimo', 'Estado', 'Acciones'].map((t) => <th key={t} className="px-5 py-3">{t}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">
      {productos.map((p) => <tr key={p.id} className={p.activo ? '' : 'bg-slate-50 text-slate-500'}>
        <td className="px-5 py-4 font-semibold text-slate-800">{p.nombre}{!p.activo && <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600">Oculto</span>}</td>
        <td className="px-5 py-4">{p.categoria?.nombre}</td>
        <td className="px-5 py-4">{formatoPeso(p.precio)}</td>
        <td className="px-5 py-4 font-semibold">{p.stock}</td>
        <td className="px-5 py-4">{p.stockMinimo}</td>
        <td className="px-5 py-4">{Number(p.stock) <= Number(p.stockMinimo) ? <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">Reponer</span> : <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">Suficiente</span>}</td>
        <td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => { setForm(null); setDetalle(p); }} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold hover:bg-slate-50" aria-label={`Ver detalle de ${p.nombre}`}>Ver detalle</button>{esAdmin && <><button onClick={() => abrirEdicion(p)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold hover:bg-slate-50" aria-label={`Editar ${p.nombre}`}>Editar</button><button onClick={() => eliminar(p)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50" aria-label={`Eliminar ${p.nombre}`}>Eliminar</button></>}</div></td>
      </tr>)}
      {cargando && <tr><td colSpan="7" className="px-5 py-12 text-center text-slate-500">Cargando inventario...</td></tr>}
      {!cargando && productos.length === 0 && <tr><td colSpan="7" className="px-5 py-12 text-center text-slate-500">No hay productos registrados.</td></tr>}
    </tbody></table></div></div>
    <p className="text-xs text-slate-500">El stock se descuenta automáticamente al crear un pedido y se devuelve al cancelarlo.</p>
  </section>;
}
