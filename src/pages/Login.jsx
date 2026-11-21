import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/servicios';
import { mensajeDeError } from '../services/api';

const rutasPorRol = {
  CLIENTE: '/mis-pedidos',
  VENDEDOR: '/ordenes',
  ADMINISTRADOR: '/admin',
};

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const manejarSubmit = async (event) => {
    event.preventDefault();
    if (!correo.trim() || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }
    setError('');
    setCargando(true);
    try {
      const usuario = await authApi.login(correo, password);   // POST /v1/auth/login
      navigate(rutasPorRol[usuario.rol] ?? '/mis-pedidos', { replace: true });
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo iniciar sesión.'));
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 text-slate-800">
      <main className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b-4 border-yellow-400 bg-blue-950 p-8 text-center">
          <Link to="/" className="mb-4 inline-flex items-center justify-center rounded-2xl bg-yellow-400 p-3 text-3xl text-blue-950" aria-label="Volver al inicio">🔥</Link>
          <h1 className="text-2xl font-extrabold text-white">Sucursal Virtual</h1>
          <p className="mt-1 text-sm text-blue-200">Acceso a tu cuenta</p>
        </div>
        <div className="p-8">
          <form onSubmit={manejarSubmit} className="space-y-5">
            <div>
              <label htmlFor="input-correo" className="mb-1 block text-sm font-bold text-slate-700">Correo electrónico</label>
              <input id="input-correo" type="email" autoComplete="username" required value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="ejemplo@correo.com" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300" />
            </div>
            <div>
              <label htmlFor="input-password" className="mb-1 block text-sm font-bold text-slate-700">Contraseña</label>
              <input id="input-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ingresa tu contraseña" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300" />
            </div>
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            <button type="submit" disabled={cargando} className="w-full rounded-full bg-yellow-400 py-3.5 font-extrabold text-blue-950 shadow-sm transition hover:bg-yellow-300 disabled:cursor-wait disabled:opacity-60">{cargando ? 'Ingresando...' : 'Ingresar'}</button>
          </form>
          <div className="mt-6 text-center text-sm">
            <p className="text-slate-500">¿No tienes cuenta? <Link to="/registro" className="font-bold text-blue-700 hover:underline">Regístrate aquí</Link></p>
            <Link to="/" className="mt-3 inline-block font-medium text-slate-500 hover:text-blue-900 hover:underline">Volver al inicio</Link>
          </div>
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-bold text-slate-800">Cuentas de demostración</p>
            <p className="mt-1">Cliente: juan.perez@email.com / 123456</p>
            <p>Vendedor: ana.vendedora@volcan.cl / 123456</p>
            <p>Administrador: admin@volcan.cl / admin123</p>
            <p className="mt-2">Disponibles cuando el backend se inicia con DEMO_USERS=true. No utilizar contraseñas reales.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
