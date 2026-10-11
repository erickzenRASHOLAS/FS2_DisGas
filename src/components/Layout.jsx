import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
    return (
        // min-h-screen asegura que el contenedor ocupe al menos el 100% del alto de la pantalla
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">

            {/* Tu menú de navegación superior */}
            <Navbar />

            {/*
        flex-grow hace que este contenedor principal empuje al Footer hacia abajo.
        <Outlet /> es el componente mágico de React Router donde se inyectará
        el contenido de cada vista (PideTuCilindro, Operadora, etc.)
      */}
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Tu pie de página */}
            <Footer />

        </div>
    );
}

export default Layout;