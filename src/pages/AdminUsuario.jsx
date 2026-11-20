import { useEffect, useState } from 'react';
import { useSesion } from '../services/useSesion';
import { usuariosApi } from '../services/servicios';
import { mensajeDeError } from '../services/api';
import { ETIQUETA_ROL } from '../services/sesion';

const FORMULARIO_VACIO = { nombre: '', correo: '', telefono: '', direccion: '', password: '', rol: 'CLIENTE' };

export default function AdminUsuarios() {
  const yo = useSesion();
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(FORMULARIO_VACIO);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [cargando, setCargando] = useState(true);
  const cargar = () => usuariosApi.listar()                       // GET /v1/usuarios (solo ADMINISTRADOR)
    .then(setUsuarios)
    .catch((e) => setMensaje({ tipo: 'error', texto: mensajeDeError(e, 'No se pudieron cargar los usuarios.') }))
    .finally(() => setCargando(false));
  useEffect(() => { cargar(); }, []);

  const cambiarCampo = (event) => setForm((actual) => ({ ...actual, [event.target.name]: event.target.value }));
  const aviso = (r, textoOk) => setMensaje(r.ok ? { tipo: 'ok', texto: textoOk } : { tipo: 'error', texto: mensajeDeError(r.error) });
  const ejecutar = async (accion, textoOk) => {
    try { await accion(); aviso({ ok: true }, textoOk); await cargar(); return true; }
    catch (error) { aviso({ ok: false, error }); return false; }
  };

  const crear = async (event) => {
    event.preventDefault();
    if (!form.nombre.trim() || !form.correo.trim() || !form.telefono.trim() || !form.direccion.trim() || form.password.length < 6 || !form.rol) {
      setMensaje({ tipo: 'error', texto: 'Completa todos los campos y usa una contraseña de al menos 6 caracteres.' });
      return;
    }
    const creado = await ejecutar(() => usuariosApi.crear({ ...form, activo: true }), 'Usuario creado correctamente.');   // POST /v1/usuarios
    if (creado) setForm(FORMULARIO_VACIO);
  };

  // PUT /v1/usuarios/{id}: sin password, el backend mantiene la contraseña actual
  const cuerpo = (u, cambios) => ({ nombre: u.nombre, correo: u.correo, telefono: u.telefono, direccion: u.direccion, rol: u.rol, activo: u.activo, ...cambios });
  const alternar = (u) => ejecutar(() => usuariosApi.actualizar(u.id, cuerpo(u, { activo: !u.activo })), u.activo ? 'Usuario desactivado.' : 'Usuario activado.');
  const cambiarRol = (u, rol) => ejecutar(() => usuariosApi.actualizar(u.id, cuerpo(u, { rol })), `Rol de ${u.nombre} actualizado a ${ETIQUETA_ROL[rol]}.`);
  const borrar = (u) => {
    if (!window.confirm(`¿Eliminar la cuenta de ${u.nombre}?`)) return;
    ejecutar(() => usuariosApi.eliminar(u.id), 'Usuario eliminado.');                                                       // DELETE /v1/usuarios/{id}
  };

  return <section className="space-y-6">
    <div><p className="text-sm font-bold uppercase tracking-widest text-amber-600">Administración</p><h1 className="mt-1 text-3xl font-black text-blue-950">Gestión de usuarios</h1><p className="mt-2 text-slate-600">Crea usuarios, cambia su rol o estado y elimina cuentas.</p></div>
    {mensaje.texto && <div role={mensaje.tipo === 'error' ? 'alert' : 'status'} className={`rounded-xl border p-4 text-sm font-semibold ${mensaje.tipo === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800'}`}>{mensaje.texto}</div>}
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <form onSubmit={crear} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
        <h2 className="text-lg font-bold text-blue-950">Nuevo usuario</h2>
        {[['nombre', 'Nombre completo', 'text'], ['correo', 'Correo electrónico', 'email'], ['telefono', 'Teléfono', 'tel'], ['direccion', 'Dirección', 'text'], ['password', 'Contraseña temporal', 'password']].map(([name, label, type]) => <div key={name}><label htmlFor={`usuario-${name}`} className="mb-1 block text-sm font-semibold text-slate-700">{label}</label><input id={`usuario-${name}`} name={name} type={type} autoComplete={name === 'password' ? 'new-password' : undefined} value={form[name]} onChange={cambiarCampo} required minLength={name === 'password' ? 6 : undefined} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200" /></div>)}
        <div><label htmlFor="usuario-rol" className="mb-1 block text-sm font-semibold text-slate-700">Rol</label><select id="usuario-rol" name="rol" value={form.rol} onChange={cambiarCampo} className="w-full rounded-lg border border-slate-300 px-3 py-2.5">{Object.entries(ETIQUETA_ROL).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}</select></div>
        <button type="submit" className="w-full rounded-xl bg-blue-950 px-4 py-3 font-bold text-white hover:bg-blue-900">Crear usuario</button>
      </form>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4"><h2 className="font-bold text-blue-950">Usuarios registrados</h2><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900">{usuarios.length}</span></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-blue-950 text-white"><tr><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100">
          {usuarios.map((u) => { const esYo = yo?.id === u.id; return <tr key={u.id}>
            <td className="px-4 py-4"><p className="font-bold text-slate-800">{u.nombre}{esYo && <span className="ml-2 text-xs font-semibold text-blue-700">(tú)</span>}</p><p className="text-xs text-slate-500">{u.correo}</p><p className="text-xs text-slate-500">{u.telefono}</p></td>
            <td className="px-4 py-4"><label className="sr-only" htmlFor={`rol-${u.id}`}>Rol de {u.nombre}</label><select id={`rol-${u.id}`} value={u.rol} disabled={esYo} onChange={(e) => cambiarRol(u, e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 disabled:bg-slate-100">{Object.entries(ETIQUETA_ROL).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}</select></td>
            <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${u.activo ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td className="px-4 py-4"><div className="flex gap-2"><button onClick={() => alternar(u)} disabled={esYo} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">{u.activo ? 'Desactivar' : 'Activar'}</button><button onClick={() => borrar(u)} disabled={esYo} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">Eliminar</button></div></td>
          </tr>; })}
          {cargando && <tr><td colSpan="4" className="px-4 py-10 text-center text-slate-500">Cargando usuarios...</td></tr>}
        </tbody></table></div>
      </div>
    </div>
  </section>;
}
