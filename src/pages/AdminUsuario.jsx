import { useEffect, useState } from 'react';
import { cambiarEstadoUsuario, eliminarUsuario, obtenerUsuarios, registrarUsuario } from '../services/datosMock';

const FORMULARIO_VACIO = { nombre: '', correo: '', telefono: '', direccion: '', pass: '', rol: 'Cliente' };

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(FORMULARIO_VACIO);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const cargar = () => setUsuarios(obtenerUsuarios());
  useEffect(() => { cargar(); }, []);

  const cambiarCampo = (event) => setForm((actual) => ({ ...actual, [event.target.name]: event.target.value }));
  const crear = (event) => {
    event.preventDefault();
    if (!form.nombre.trim() || !form.correo.trim() || !form.telefono.trim() || !form.direccion.trim() || form.pass.length < 6 || !form.rol) {
      setMensaje({ tipo: 'error', texto: 'Completa todos los campos y usa una contraseña de al menos 6 caracteres.' });
      return;
    }
    const exito = registrarUsuario(form);
    if (!exito) { setMensaje({ tipo: 'error', texto: 'No se pudo crear el usuario. Comprueba que el correo no esté registrado.' }); return; }
    setForm(FORMULARIO_VACIO);
    setMensaje({ tipo: 'ok', texto: 'Usuario creado y guardado en este navegador de demostración.' });
    cargar();
  };
  const alternar = (id) => { const r = cambiarEstadoUsuario(id); setMensaje({ tipo: r.exito ? 'ok' : 'error', texto: r.mensaje }); cargar(); };
  const borrar = (usuario) => {
    if (!window.confirm(`¿Eliminar la cuenta de ${usuario.nombre}?`)) return;
    const r = eliminarUsuario(usuario.id); setMensaje({ tipo: r.exito ? 'ok' : 'error', texto: r.mensaje }); cargar();
  };

  return <section className="space-y-6">
    <div><p className="text-sm font-bold uppercase tracking-widest text-amber-600">Administración</p><h1 className="mt-1 text-3xl font-black text-blue-950">Gestión de usuarios</h1><p className="mt-2 text-slate-600">Crea usuarios, cambia su estado y administra los roles disponibles.</p></div>
    {mensaje.texto && <div role="status" className={`rounded-xl border p-4 text-sm font-semibold ${mensaje.tipo === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800'}`}>{mensaje.texto}</div>}
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <form onSubmit={crear} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
        <h2 className="text-lg font-bold text-blue-950">Nuevo usuario</h2>
        {[['nombre', 'Nombre completo', 'text'], ['correo', 'Correo electrónico', 'email'], ['telefono', 'Teléfono', 'tel'], ['direccion', 'Dirección', 'text'], ['pass', 'Contraseña temporal', 'password']].map(([name, label, type]) => <div key={name}><label htmlFor={`usuario-${name}`} className="mb-1 block text-sm font-semibold text-slate-700">{label}</label><input id={`usuario-${name}`} name={name} type={type} autoComplete={name === 'pass' ? 'new-password' : undefined} value={form[name]} onChange={cambiarCampo} required minLength={name === 'pass' ? 6 : undefined} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200" /></div>)}
        <div><label htmlFor="usuario-rol" className="mb-1 block text-sm font-semibold text-slate-700">Rol</label><select id="usuario-rol" name="rol" value={form.rol} onChange={cambiarCampo} className="w-full rounded-lg border border-slate-300 px-3 py-2.5"><option>Cliente</option><option>Repartidor</option><option>Operadora</option><option>Administrador</option></select></div>
        <button type="submit" className="w-full rounded-xl bg-blue-950 px-4 py-3 font-bold text-white hover:bg-blue-900">Crear usuario</button>
        <p className="text-xs text-slate-500">Este prototipo guarda credenciales de prueba en el navegador. No uses datos ni contraseñas reales.</p>
      </form>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4"><h2 className="font-bold text-blue-950">Usuarios registrados</h2><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900">{usuarios.length}</span></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-blue-950 text-white"><tr><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100">{usuarios.map((usuario) => <tr key={usuario.id}><td className="px-4 py-4"><p className="font-bold text-slate-800">{usuario.nombre}</p><p className="text-xs text-slate-500">{usuario.correo}</p><p className="text-xs text-slate-500">{usuario.telefono}</p></td><td className="px-4 py-4">{usuario.rol}</td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${usuario.estado === 'Inactivo' ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-800'}`}>{usuario.estado ?? 'Activo'}</span></td><td className="px-4 py-4"><div className="flex gap-2"><button onClick={() => alternar(usuario.id)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold hover:bg-slate-50">{usuario.estado === 'Inactivo' ? 'Activar' : 'Desactivar'}</button><button onClick={() => borrar(usuario)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50">Eliminar</button></div></td></tr>)}</tbody></table></div>
      </div>
    </div>
  </section>;
}
