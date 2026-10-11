import { Link } from 'react-router-dom';

function Footer() {
    // Calculamos el año actual de forma dinámica para el copyright
    const añoActual = new Date().getFullYear();

    return (
        <footer className="bg-blue-950 text-slate-300 border-t-4 border-yellow-400 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Contenedor principal con Grid: 1 columna en móvil, 3 en escritorio */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Columna 1: Información de la empresa */}
                    <div>
                        <h3 className="text-xl font-black text-yellow-400 uppercase tracking-wider mb-4">
                            Gas El Volcán
                        </h3>
                        <p className="text-sm leading-relaxed mb-4">
                            Tu distribuidora de confianza en Chillán. Llevamos la energía que necesitas directamente a tu hogar, con rapidez y seguridad.
                        </p>
                    </div>

                    {/* Columna 2: Datos de Contacto */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Contacto</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-400">📍</span>
                                <span>Av. O'Higgins 1234, Chillán</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-400">📞</span>
                                <span>+56 9 1234 5678</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-400">🕒</span>
                                <span>Lun a Sáb: 08:00 - 20:00 hrs<br/>Dom y Festivos: 09:00 - 15:00 hrs</span>
                            </li>
                        </ul>
                    </div>

                    {/* Columna 3: Enlaces Rápidos */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Accesos Rápidos</h3>
                        <ul className="space-y-2 text-sm flex flex-col">
                            <li>
                                <Link className="hover:text-yellow-400 hover:underline transition" to="/">
                                    Pide tu cilindro
                                </Link>
                            </li>
                            <li>
                                <Link className="hover:text-yellow-400 hover:underline transition" to="/operadora">
                                    Panel Operadora
                                </Link>
                            </li>
                            <li>
                                <Link className="hover:text-yellow-400 hover:underline transition" to="/admin">
                                    Administración
                                </Link>
                            </li>
                            <li>
                                <Link className="hover:text-yellow-400 hover:underline transition" to="/login">
                                    Acceso Trabajadores
                                </Link>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Línea divisoria y Copyright */}
                <div className="mt-10 pt-6 border-t border-slate-700 text-center text-sm">
                    <p>&copy; {añoActual} Distribuidora de Gas El Volcán. Todos los derechos reservados.</p>
                </div>

            </div>
        </footer>
    );
}

export default Footer;