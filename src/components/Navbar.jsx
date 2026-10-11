import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cerrarSesion, obtenerUsuarioActual } from '../services/datosMock';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [usuario, setUsuario] = useState(() => obtenerUsuarioActual());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setUsuario(obtenerUsuarioActual());
    setMenuAbierto(false);
  }, [location.pathname]);

  const salir = () => {
    cerrarSesion();
    setUsuario(null);
    setMenuAbierto(false);
    navigate('/login');
  };

  const enlaces = [
    { to: '/', texto: 'Inicio' },
    { to: '/pedido', texto: 'Pedir cilindro', rol: ['Cliente', 'Administrador', 'admin', 'Operadora'] },
    { to: '/mis-pedidos', texto: 'Mis pedidos', rol: ['Cliente'] },
    { to: '/operadora', texto: 'Despacho', rol: ['Operadora', 'Administrador', 'admin'] },
    { to: '/repartidor', texto: 'Repartidor', rol: ['Repartidor'] },
    { to: '/inventario', texto: 'Inventario', rol: ['Administrador', 'admin'] },
    { to: '/admin', texto: 'Usuarios', rol: ['Administrador', 'admin'] },
    { to: '/perfil', texto: 'Mi perfil', rol: ['Cliente', 'Repartidor', 'Operadora', 'Administrador', 'admin'] },
  ];
  const enlacesVisibles = enlaces.filter((enlace) => !enlace.rol || (usuario && enlace.rol.includes(usuario.rol)));
  const linkClass = ({ isActive }) => `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-yellow-400 text-blue-950' : 'text-white hover:bg-blue-900 hover:text-yellow-300'}`;

  return (
    <nav className="sticky top-0 z-50 bg-blue-950 text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-black uppercase tracking-wide text-yellow-400">Gas El Volcán</Link>
        <div className="hidden items-center gap-1 lg:flex">
          {enlacesVisibles.filter((e) => e.to !== '/').map((enlace) => <NavLink key={enlace.to} to={enlace.to} className={linkClass}>{enlace.texto}</NavLink>)}
          {usuario ? <button onClick={salir} className="ml-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-700">Cerrar sesión</button> : <Link to="/login" className="ml-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-blue-950 hover:bg-yellow-300">Ingresar</Link>}
        </div>
        <button onClick={() => setMenuAbierto((abierto) => !abierto)} aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuAbierto} className="rounded-md p-2 hover:bg-blue-900 lg:hidden">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">{menuAbierto ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}</svg>
        </button>
      </div>
      {menuAbierto && <div className="space-y-1 border-t border-blue-900 bg-blue-900 px-4 py-4 lg:hidden">
        {enlacesVisibles.map((enlace) => <NavLink key={enlace.to} to={enlace.to} end={enlace.to === '/'} onClick={() => setMenuAbierto(false)} className={({ isActive }) => `block rounded-lg px-3 py-3 font-semibold ${isActive ? 'bg-yellow-400 text-blue-950' : 'text-white hover:bg-blue-800'}`}>{enlace.texto}</NavLink>)}
        {usuario ? <button onClick={salir} className="mt-2 w-full rounded-lg bg-red-600 px-4 py-3 text-left font-bold hover:bg-red-700">Cerrar sesión</button> : <Link to="/login" onClick={() => setMenuAbierto(false)} className="mt-2 block rounded-lg bg-yellow-400 px-4 py-3 font-bold text-blue-950">Ingresar</Link>}
      </div>}
    </nav>
  );
}
