import { useEffect } from 'react';
import { Navigate, Route, Routes, Link } from 'react-router-dom';
import Layout from './components/Layout';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Pedido from './pages/Pedido';
import MisPedidos from './pages/MisPedidos';
import Perfil from './pages/Perfil';
import EditarPerfil from './pages/EditarPerfil';
import Ordenes from './pages/Ordenes';
import AdminUsuarios from './pages/AdminUsuario';
import Inventario from './pages/Inventario';
import { useSesion } from './services/useSesion';
import { obtenerUsuarioActual } from './services/sesion';
import { perfilApi } from './services/servicios';

// Página de inicio de cada rol (a donde se redirige a quien intenta entrar a algo que no le corresponde).
const INICIO_POR_ROL = { CLIENTE: '/mis-pedidos', VENDEDOR: '/ordenes', ADMINISTRADOR: '/admin' };

/** Guardia de rutas: sin sesión → /login; con sesión pero sin el rol → a su propia página de inicio. */
function RequireRole({ roles, children }) {
    const usuario = useSesion();
    if (!usuario) return <Navigate to="/login" replace />;
    if (!roles.includes(usuario.rol)) return <Navigate to={INICIO_POR_ROL[usuario.rol] ?? '/'} replace />;
    return children;
}

function NoEncontrado() {
    return (
        <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-600">Error 404</p>
            <h1 className="mt-2 text-3xl font-black text-blue-950">Página no encontrada</h1>
            <p className="mt-3 text-slate-600">La dirección que intentaste abrir no existe en esta aplicación.</p>
            {/* Usamos Link en lugar de a para respetar el basename */}
            <Link to="/" className="mt-6 inline-flex rounded-xl bg-blue-950 px-5 py-3 font-bold text-white hover:bg-blue-900">Volver al inicio</Link>
        </section>
    );
}

export default function App() {
    // Al cargar la app (o recargar con F5) se confirma la sesión guardada con el backend.
    // Si el token ya no sirve, api.js intenta renovarlo y, si no se puede, cierra la sesión.
    useEffect(() => {
        if (obtenerUsuarioActual()) perfilApi.ver().catch(() => {});
    }, []);

    return (
        <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route element={<Layout />}>
                <Route path="/pedido" element={<RequireRole roles={['CLIENTE', 'ADMINISTRADOR']}><Pedido /></RequireRole>} />
                <Route path="/mis-pedidos" element={<RequireRole roles={['CLIENTE']}><MisPedidos /></RequireRole>} />
                <Route path="/perfil" element={<RequireRole roles={['CLIENTE', 'ADMINISTRADOR']}><Perfil /></RequireRole>} />
                <Route path="/editar-perfil" element={<RequireRole roles={['CLIENTE', 'ADMINISTRADOR']}><EditarPerfil /></RequireRole>} />
                <Route path="/ordenes" element={<RequireRole roles={['VENDEDOR', 'ADMINISTRADOR']}><Ordenes /></RequireRole>} />
                <Route path="/inventario" element={<RequireRole roles={['VENDEDOR', 'ADMINISTRADOR']}><Inventario /></RequireRole>} />
                <Route path="/admin" element={<RequireRole roles={['ADMINISTRADOR']}><AdminUsuarios /></RequireRole>} />
                <Route path="/admin-usuario" element={<RequireRole roles={['ADMINISTRADOR']}><AdminUsuarios /></RequireRole>} />
                <Route path="*" element={<NoEncontrado />} />
            </Route>
        </Routes>
    );
}
