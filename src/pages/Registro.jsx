import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../services/datosMock';

const Registro = () => {
    const navigate = useNavigate();

    // Estado para los campos del formulario (incluye correo para integrarse con Login)
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        direccion: '',
        telefono: '',
        pass1: '',
        pass2: ''
    });

    // Estado para manejar mensajes de éxito o error
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    // Manejador de cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Manejador de envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validaciones básicas
        if (!formData.nombre || !formData.correo || !formData.direccion || !formData.telefono || !formData.pass1 || !formData.pass2) {
            setMensaje({ tipo: 'error', texto: 'Todos los campos son obligatorios.' });
            return;
        }

        if (formData.pass1.length < 6) {
            setMensaje({ tipo: 'error', texto: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }

        if (formData.pass1 !== formData.pass2) {
            setMensaje({ tipo: 'error', texto: 'Las contraseñas no coinciden.' });
            return;
        }

        // Construcción del objeto de usuario para el servicio centralizado
        const nuevoUsuario = {
            id: Date.now(),
            nombre: formData.nombre,
            correo: formData.correo,
            telefono: formData.telefono,
            direccion: formData.direccion,
            password: formData.pass1,
            rol: 'Cliente'
        };

        // Guardado en el mock global
        const exito = registrarUsuario(nuevoUsuario);

        if (exito) {
            setMensaje({ tipo: 'exito', texto: '¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...' });
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } else {
            setMensaje({ tipo: 'error', texto: 'El correo electrónico ya se encuentra registrado.' });
        }
    };

    return (
        <div className="bg-slate-50 text-slate-800 font-sans flex items-center justify-center min-h-screen p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-lg border border-slate-200">

                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center bg-yellow-400 p-3 rounded-2xl mb-4">
                        <i className="ph ph-fire text-3xl text-blue-950"></i>
                    </div>
                    <h1 className="text-2xl font-black text-blue-950">Crea tu cuenta</h1>
                    <p className="text-slate-500 text-sm mt-1">Pide tu gas a domicilio más rápido</p>
                </div>

                {mensaje.texto && (
                    <div className={`mb-4 text-sm font-semibold p-3 rounded-xl border flex items-center gap-2 ${
                        mensaje.tipo === 'exito'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                        <i className={`ph ${mensaje.tipo === 'exito' ? 'ph-check-circle' : 'ph-warning-circle'} text-lg`}></i>
                        <span>{mensaje.texto}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="reg-nombre" className="block text-sm font-bold text-slate-700 mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            id="reg-nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Ej. María González"
                        />
                    </div>

                    <div>
                        <label htmlFor="reg-correo" className="block text-sm font-bold text-slate-700 mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            id="reg-correo"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="ejemplo@correo.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="reg-direccion" className="block text-sm font-bold text-slate-700 mb-1">Dirección de entrega (Chillán)</label>
                        <input
                            type="text"
                            id="reg-direccion"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Ej. Los Pinos 123"
                        />
                    </div>

                    <div>
                        <label htmlFor="reg-telefono" className="block text-sm font-bold text-slate-700 mb-1">Teléfono</label>
                        <input
                            type="tel"
                            id="reg-telefono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Ej. +56912345678"
                        />
                    </div>

                    <div>
                        <label htmlFor="reg-pass1" className="block text-sm font-bold text-slate-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            id="reg-pass1"
                            name="pass1"
                            value={formData.pass1}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div>
                        <label htmlFor="reg-pass2" className="block text-sm font-bold text-slate-700 mb-1">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="reg-pass2"
                            name="pass2"
                            value={formData.pass2}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Repite tu contraseña"
                        />
                    </div>

                    <button type="submit" className="w-full bg-blue-950 hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-xl transition mt-6">
                        Registrarme
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-slate-500">¿Ya tienes cuenta? </span>
                    <Link to="/login" className="text-blue-600 font-bold hover:underline">
                        Inicia sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Registro;