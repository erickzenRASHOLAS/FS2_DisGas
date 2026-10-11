import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerUsuarioActual } from '../services/datosMock';

const Perfil = () => {
    // Estado para almacenar los datos del usuario cargados dinámicamente desde el mock[cite: 1]
    const [userData, setUserData] = useState({
        nombre: '',
        rol: '',
        correo: '',
        telefono: '',
        direccion: ''
    });

    // Cargar los datos del usuario logueado o activo en el mock central
    useEffect(() => {
        const usuarioActivo = obtenerUsuarioActual();
        if (usuarioActivo) {
            setUserData(usuarioActivo);
        }
    }, []);

    if (!userData || !userData.id) {
        return (
            <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h1 className="text-2xl font-black text-blue-950">Mi perfil</h1>
                <p className="mt-2 text-slate-600">Inicia sesión para revisar tus datos personales.</p>
                <Link to="/login" className="mt-5 inline-flex rounded-xl bg-blue-950 px-5 py-3 font-bold text-white">Iniciar sesión</Link>
            </section>
        );
    }

    return (
        <div className="bg-slate-50 text-slate-800 font-sans flex flex-col min-h-screen">

            {/* HEADER[cite: 1] */}

            {/* MAIN CONTENT[cite: 1] */}
            <main className="flex-grow max-w-3xl mx-auto w-full p-4 sm:p-8 flex items-start justify-center mt-4 sm:mt-10">
                <section className="bg-white w-full rounded-3xl shadow-md border border-slate-200 overflow-hidden">

                    {/* Cabecera del Perfil[cite: 1] */}
                    <div className="bg-blue-950 px-8 py-10 flex flex-col items-center text-center relative">
                        <div className="bg-yellow-400 h-24 w-24 rounded-full flex items-center justify-center text-blue-950 text-4xl shadow-lg border-4 border-white mb-4">
                            <i className="ph ph-user-fill"></i>
                        </div>
                        <h1 className="text-2xl font-extrabold text-white">{userData.nombre || 'Cargando...'}</h1>
                        <p className="text-slate-300 text-sm mt-1">{userData.rol || 'Cliente'}</p>
                    </div>

                    {/* Datos del Perfil[cite: 1] */}
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 sm:col-span-2">
                                <p className="text-xs text-slate-500 font-bold uppercase mb-1 flex items-center gap-1"><i className="ph ph-user text-lg"></i> Nombre Completo</p>
                                <p className="text-slate-800 font-medium">{userData.nombre}</p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 font-bold uppercase mb-1 flex items-center gap-1"><i className="ph ph-envelope-simple text-lg"></i> Correo Electrónico</p>
                                <p className="text-slate-800 font-medium">{userData.correo}</p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 font-bold uppercase mb-1 flex items-center gap-1"><i className="ph ph-phone text-lg"></i> Teléfono Móvil</p>
                                <p className="text-slate-800 font-medium">{userData.telefono}</p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 sm:col-span-2">
                                <p className="text-xs text-slate-500 font-bold uppercase mb-1 flex items-center gap-1"><i className="ph ph-map-pin text-lg"></i> Dirección de Despacho Principal</p>
                                <p className="text-slate-800 font-medium">{userData.direccion}</p>
                            </div>

                        </div>

                        {/* Botón Modificar[cite: 1] */}
                        <div className="pt-4 border-t border-slate-200 mt-6 flex justify-end">
                            <Link to="/editar-perfil" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition flex items-center gap-2">
                                <i className="ph ph-pencil-simple text-lg"></i> Modificar Datos
                            </Link>
                        </div>
                    </div>
                </section>
            </main>


        </div>
    );
};

export default Perfil;