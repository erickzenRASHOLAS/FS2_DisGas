import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Pedido from './pages/Pedido';
import MisPedidos from './pages/MisPedidos';
import Perfil from './pages/Perfil';
import EditarPerfil from './pages/EditarPerfil';
import RutasRepartidor from './pages/RutasRepartidos';
import Operadora from './pages/Operadora';
import AdminUsuarios from './pages/AdminUsuario';
import Inventario from './pages/Inventario';
import { obtenerUsuarioActual } from './services/datosMock';

function RequireRole({ roles, children }) {
  const usuario = obtenerUsuarioActual();
  if (!usuario) return <Navigate to="/login" replace />;
  const rol = String(usuario.rol ?? '').toLowerCase();
  if (!roles.includes(rol)) {
    const inicioPorRol = {
      cliente: '/mis-pedidos',
      repartidor: '/repartidor',
      operadora: '/operadora',
      admin: '/admin',
      administrador: '/admin',
    };
    return <Navigate to={inicioPorRol[rol] ?? '/'} replace />;
  }
  return children;
}

function NoEncontrado() {
  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-bold uppercase tracking-widest text-amber-600">Error 404</p>
      <h1 className="mt-2 text-3xl font-black text-blue-950">Página no encontrada</h1>
      <p className="mt-3 text-slate-600">La dirección que intentaste abrir no existe en esta aplicación.</p>
      <a href="/" className="mt-6 inline-flex rounded-xl bg-blue-950 px-5 py-3 font-bold text-white hover:bg-blue-900">Volver al inicio</a>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      {/* La portada incluye su propio encabezado; no se duplica con el menú global. */}
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route element={<Layout />}>
        <Route path="/pedido" element={<RequireRole roles={['cliente', 'administrador', 'admin']}><Pedido /></RequireRole>} />
        <Route path="/mis-pedidos" element={<RequireRole roles={['cliente']}><MisPedidos /></RequireRole>} />
        <Route path="/perfil" element={<RequireRole roles={['cliente', 'repartidor', 'operadora', 'administrador', 'admin']}><Perfil /></RequireRole>} />
        <Route path="/editar-perfil" element={<RequireRole roles={['cliente', 'repartidor', 'operadora', 'administrador', 'admin']}><EditarPerfil /></RequireRole>} />
        <Route path="/repartidor" element={<RequireRole roles={['repartidor']}><RutasRepartidor /></RequireRole>} />
        <Route path="/rutas-repartidor" element={<RequireRole roles={['repartidor']}><RutasRepartidor /></RequireRole>} />
        <Route path="/operadora" element={<RequireRole roles={['operadora', 'administrador', 'admin']}><Operadora /></RequireRole>} />
        <Route path="/admin" element={<RequireRole roles={['administrador', 'admin']}><AdminUsuarios /></RequireRole>} />
        <Route path="/admin-usuario" element={<RequireRole roles={['administrador', 'admin']}><AdminUsuarios /></RequireRole>} />
        <Route path="/inventario" element={<RequireRole roles={['administrador', 'admin']}><Inventario /></RequireRole>} />
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  );
}
