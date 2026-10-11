import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const Inicio = () => {
    // Estado para controlar el menú móvil
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Estados para capturar los datos del formulario
    const [celular, setCelular] = useState('');
    const [cilindro, setCilindro] = useState('');

    // Estados para los mensajes de error
    const [errorCelular, setErrorCelular] = useState('');
    const [errorCilindro, setErrorCilindro] = useState('');

    const navigate = useNavigate();

    // Función para manejar el envío y la validación
    const manejarSubmit = (e) => {
        e.preventDefault();
        let esValido = true;

        // Limpiar errores previos
        setErrorCelular('');
        setErrorCilindro('');

        // Validación básica del celular
        if (!celular.trim() || celular.length < 8) {
            setErrorCelular('Ingresa un número de celular válido.');
            esValido = false;
        }

        // Validación del cilindro
        if (!cilindro) {
            setErrorCilindro('Selecciona el formato de cilindro.');
            esValido = false;
        }

        if (esValido) {
            console.log('Pedido iniciado:', { celular, cilindro });
            // Redirigir a la vista de pedidos si la validación es exitosa
            navigate('/pedido');
        }
    };

    return (
        <div className="bg-slate-50 text-slate-800 font-sans flex flex-col min-h-screen">

            {/* HEADER PÚBLICO */}
            <header className="w-full">
                {/* Barra superior de teléfonos y emergencias */}
                <div className="bg-blue-950 text-white text-xs py-2 px-4 flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-yellow-400">Distribuidora Gas El Volcán</span>
                        <span className="hidden sm:inline">| Chillán y comunas aledañas</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="tel:6006009200" className="hover:underline flex items-center gap-1">
                            <i className="ph ph-warning-circle"></i> Emergencias: 600 600 9200
                        </a>
                        <a href="tel:6005006000" className="hover:underline flex items-center gap-1">
                            <i className="ph ph-phone"></i> Servicio cliente: 600 500 6000
                        </a>
                    </div>
                </div>

                {/* Menú de navegación principal con responsive */}
                <nav className="bg-white shadow-md border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">

                        {/* Logo de la empresa */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-yellow-400 p-2 rounded-xl text-blue-950 font-black text-xl flex items-center">
                                <i className="ph ph-flame-fill text-2xl mr-1"></i> VOLCÁN
                            </div>
                        </Link>

                        {/* Menú Escritorio */}
                        <div className="hidden lg:flex items-center space-x-8 font-medium text-slate-700">
                            <Link to="/" className="text-blue-900 border-b-2 border-yellow-400 pb-1 font-bold">Inicio</Link>
                            <a href="#productos" className="hover:text-blue-900 transition">Cilindros</a>
                            <a href="#nosotros" className="hover:text-blue-900 transition">Nosotros</a>
                        </div>

                        {/* Acceso a Sucursal Virtual / Login */}
                        <div className="hidden sm:flex items-center gap-4">
                            <Link to="/login" className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold px-5 py-2.5 rounded-full transition flex items-center gap-2 shadow-sm">
                                <i className="ph ph-user-circle text-xl"></i> Sucursal Virtual
                            </Link>
                        </div>

                        {/* Botón tipo hamburguesa para celulares */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-slate-700 hover:text-blue-900 focus:outline-none"
                            aria-label="Abrir menú"
                        >
                            <i className={`ph ${isMobileMenuOpen ? 'ph-x' : 'ph-list'} text-3xl`}></i>
                        </button>
                    </div>

                    {/* Menu desplegable para celulares */}
                    <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:hidden bg-slate-100 border-t border-slate-200 px-4 pt-2 pb-4 space-y-2`}>
                        <Link to="/" className="block py-2 font-bold text-blue-900">Inicio</Link>
                        <Link to="/pedido" className="block py-2 text-slate-700">Pide tu Cilindro</Link>
                        <a href="#productos" className="block py-2 text-slate-700">Cilindros</a>
                        <Link to="/login" className="block py-2 text-yellow-600 font-bold">Sucursal Virtual (Login)</Link>
                    </div>
                </nav>
            </header>

            <main className="flex-grow">

                {/* Formulario Rápido */}
                <section id="pedidos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                        {/* Tarjeta del Formulario (Izquierda) */}
                        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
                            <div className="flex border-b border-slate-200 mb-6 gap-2">
                                <button type="button" className="pb-3 border-b-4 border-yellow-400 font-bold text-blue-950 text-sm sm:text-base flex items-center gap-2">
                                    <i className="ph ph-gas-can text-lg"></i> Pide tu cilindro
                                </button>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 mb-2">Pide tu cilindro aquí</h1>
                            <p className="text-slate-600 text-sm mb-6">Ingresa tus datos para gestionar el despacho a domicilio en Chillán.</p>

                            <form onSubmit={manejarSubmit} noValidate className="space-y-4">
                                <div>
                                    <label htmlFor="input-celular" className="block text-sm font-semibold text-slate-700 mb-1">¿Cuál es tu celular?</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold text-sm">+56 9</span>
                                        <input
                                            type="tel"
                                            id="input-celular"
                                            name="celular"
                                            autoComplete="tel"
                                            placeholder="1234 5678"
                                            value={celular}
                                            onChange={(e) => setCelular(e.target.value)}
                                            className={`w-full pl-16 pr-4 py-3 rounded-xl border ${errorCelular ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none text-slate-800 font-medium`}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-400 mt-1 block">Ej: 987654321</span>
                                    {errorCelular && <p className="text-red-500 text-xs font-semibold mt-1">{errorCelular}</p>}
                                </div>

                                <div>
                                    <label htmlFor="select-cilindro" className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Cilindro</label>
                                    <select
                                        id="select-cilindro"
                                        name="cilindro"
                                        value={cilindro}
                                        onChange={(e) => setCilindro(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${errorCilindro ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-yellow-400 outline-none text-slate-800 font-medium bg-white`}
                                    >
                                        <option value="">Selecciona el formato...</option>
                                        <option value="5kg">Cilindro 5 kg</option>
                                        <option value="11kg">Cilindro 11 kg</option>
                                        <option value="15kg">Cilindro 15 kg</option>
                                    </select>
                                    {errorCilindro && <p className="text-red-500 text-xs font-semibold mt-1">{errorCilindro}</p>}
                                </div>

                                <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-extrabold py-3.5 rounded-full transition shadow-md text-center">
                                    Continuar
                                </button>
                            </form>
                        </div>

                        {/* Banner publicitario de apoyo (Derecha) */}
                        <div className="lg:col-span-7 bg-gradient-to-br from-blue-900 to-blue-950 text-white rounded-3xl p-8 lg:p-12 shadow-xl flex flex-col justify-between min-h-[380px] relative overflow-hidden">
                            <div className="z-10 max-w-lg">
                                <span className="bg-yellow-400 text-blue-950 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-4 inline-block">Servicio Local Chillán</span>
                                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
                                    Distribución rápida directamente a tu hogar
                                </h2>
                                <p className="text-blue-100 text-base mb-6">
                                    Monitorea el trayecto del camión repartidor en tiempo real y realiza tu pago en efectivo o transferencia al recibir tu carga.
                                </p>
                                <a href="#nosotros" className="inline-flex items-center gap-2 border-2 border-white hover:bg-white hover:text-blue-950 text-white font-bold px-6 py-3 rounded-full transition">
                                    Conoce más aquí <i className="ph ph-arrow-right"></i>
                                </a>
                            </div>
                            <i className="ph ph-flame text-yellow-400/10 text-[220px] absolute -right-10 -bottom-10 pointer-events-none"></i>
                        </div>

                    </div>
                </section>

                {/* Productos */}
                <section id="productos" className="bg-slate-100 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 text-center mb-8">Nuestros Formatos de Gas Licuado</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <article className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center">
                                <div className="bg-yellow-100 text-yellow-700 p-4 rounded-full mb-4">
                                    <i className="ph ph-gas-can text-4xl"></i>
                                </div>
                                <h3 className="text-xl font-bold text-blue-950 mb-1">Cilindro 5 kg</h3>
                                <p className="text-slate-500 text-sm mb-4">Ideal para estufas pequeñas, cocinillas y camping.</p>
                                <span className="text-2xl font-black text-blue-900 mb-4">$10.800</span>
                            </article>

                            <article className="bg-white p-6 rounded-2xl shadow-sm border-2 border-yellow-400 text-center flex flex-col items-center relative">
                                <span className="absolute -top-3 bg-yellow-400 text-blue-950 text-xs font-bold px-3 py-1 rounded-full uppercase">Más Vendido</span>
                                <div className="bg-yellow-100 text-yellow-700 p-4 rounded-full mb-4">
                                    <i className="ph ph-gas-can text-4xl"></i>
                                </div>
                                <h3 className="text-xl font-bold text-blue-950 mb-1">Cilindro 11 kg</h3>
                                <p className="text-slate-500 text-sm mb-4">El formato preferido para el consumo residencial cotidiano.</p>
                                <span className="text-2xl font-black text-blue-900 mb-4">$21.500</span>
                            </article>

                            <article className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center">
                                <div className="bg-yellow-100 text-yellow-700 p-4 rounded-full mb-4">
                                    <i className="ph ph-gas-can text-4xl"></i>
                                </div>
                                <h3 className="text-xl font-bold text-blue-950 mb-1">Cilindro 15 kg</h3>
                                <p className="text-slate-500 text-sm mb-4">Rendimiento extendido para calefacción y hogar numeroso.</p>
                                <span className="text-2xl font-black text-blue-900 mb-4">$27.900</span>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Video Informativo */}
                <section id="nosotros" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 mb-4">Sobre Distribuidora El Volcán</h2>
                            <p className="text-slate-600 mb-4 leading-relaxed">
                                Desde 1998 servimos a la comunidad de Chillán garantizando entregas puntuales. Nuestra flota de camiones y equipo de reparto opera diariamente para cubrir tus necesidades de gas licuado.
                            </p>
                            <ul className="space-y-2 text-slate-700 font-medium">
                                <li className="flex items-center gap-2"><i className="ph ph-check-circle-fill text-yellow-500 text-xl"></i> Cobertura total en la comuna de Chillán.</li>
                                <li className="flex items-center gap-2"><i className="ph ph-check-circle-fill text-yellow-500 text-xl"></i> Inspección y sellado de seguridad en cada cilindro.</li>
                            </ul>
                        </div>

                        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                            <iframe
                                className="w-full h-full"
                                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
                                title="Video Gas El Volcán"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
};

export default Inicio;