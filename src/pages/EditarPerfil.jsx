import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerUsuarioActual } from '../services/sesion';
import { perfilApi } from '../services/servicios';
import { mensajeDeError } from '../services/api';

export default function EditarPerfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', direccion: '' });
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);
  useEffect(() => {
    const actual = obtenerUsuarioActual();
    setUsuario(actual);
    if (actual) setForm({ nombre: actual.nombre ?? '', correo: actual.correo ?? '', telefono: actual.telefono ?? '', direccion: actual.direccion ?? '' });
  }, []);
  const cambiar = (event) => setForm((actual) => ({ ...actual, [event.target.name]: event.target.value }));
  const guardar = async (event) => {
    event.preventDefault();
    if (!usuario) { setMensaje('Inicia sesión para editar tu perfil.'); return; }
    setGuardando(true);
    try {
      // PUT /v1/perfil: el backend solo permite cambiar nombre, teléfono y dirección (no el correo ni el rol)
      await perfilApi.editar({ nombre: form.nombre, telefono: form.telefono, direccion: form.direccion });
      setMensaje('Datos actualizados correctamente.');
      setTimeout(() => navigate('/perfil'), 500);
    } catch (e) {
      setMensaje(mensajeDeError(e, 'No se pudieron guardar los cambios.'));
      setGuardando(false);
    }
  };
  if (!usuario) return <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><p>Debes iniciar sesión para editar el perfil.</p><Link to="/login" className="mt-4 inline-flex rounded-xl bg-blue-950 px-5 py-3 font-bold text-white">Iniciar sesión</Link></section>;
  return <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-bold uppercase tracking-widest text-amber-600">Mi cuenta</p><h1 className="mt-1 text-3xl font-black text-blue-950">Editar perfil</h1><form onSubmit={guardar} className="mt-6 space-y-4">{[['nombre', 'Nombre completo', 'text'], ['correo', 'Correo electrónico', 'email'], ['telefono', 'Teléfono', 'tel'], ['direccion', 'Dirección', 'text']].map(([name, label, type]) => <div key={name}><label htmlFor={`perfil-${name}`} className="mb-1 block text-sm font-semibold text-slate-700">{label}</label><input id={`perfil-${name}`} name={name} type={type} value={form[name]} onChange={cambiar} required readOnly={name === 'correo'} className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 ${name === 'correo' ? 'border-slate-200 bg-slate-100 text-slate-600' : 'border-slate-300'}`} />{name === 'correo' && <p className="mt-1 text-xs text-slate-500">El correo es tu usuario de acceso y no se puede cambiar.</p>}</div>)}{mensaje && <p role="status" className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{mensaje}</p>}<div className="flex flex-col gap-3 pt-2 sm:flex-row"><button disabled={guardando} className="rounded-xl bg-blue-950 px-5 py-3 font-bold text-white hover:bg-blue-900 disabled:opacity-60" type="submit">{guardando ? 'Guardando...' : 'Guardar cambios'}</button><Link to="/perfil" className="rounded-xl border border-slate-300 px-5 py-3 text-center font-bold text-slate-700 hover:bg-slate-50">Cancelar</Link></div></form></section>;
}
