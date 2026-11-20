/*
 * Un "servicio" por recurso del backend. Las páginas llaman a estas funciones
 * y nunca usan fetch directamente. Todas las rutas llevan el versionado /v1.
 */
import { api } from './api.js';
import { actualizarUsuarioSesion, cerrarSesion, guardarSesion } from './sesion.js';

export const authApi = {
  /** POST /v1/auth/login → guarda token, refreshToken y usuario en la sesión. */
  async login(correo, password) {
    const datos = await api.post('/v1/auth/login', { correo: correo.trim(), password }, { auth: false });
    guardarSesion({ token: datos.token, refreshToken: datos.refreshToken, usuario: datos.usuario });
    return datos.usuario;
  },
  /** POST /v1/auth/registro → crea una cuenta con rol CLIENTE (el rol no se envía). */
  registrar: (datos) => api.post('/v1/auth/registro', datos, { auth: false }),
  logout: () => cerrarSesion(),
};

export const productosApi = {
  listar: () => api.get('/v1/productos', { auth: false }),            // catálogo (solo activos), público
  listarTodos: () => api.get('/v1/productos/todos'),                  // ADMINISTRADOR y VENDEDOR
  obtener: (id) => api.get(`/v1/productos/${id}`, { auth: false }),
  crear: (producto) => api.post('/v1/productos', producto),           // ADMINISTRADOR
  actualizar: (id, producto) => api.put(`/v1/productos/${id}`, producto),
  eliminar: (id) => api.delete(`/v1/productos/${id}`),
};

export const categoriasApi = {
  listar: () => api.get('/v1/categorias', { auth: false }),
};

export const boletasApi = {
  /** CLIENTE: solo las suyas. ADMINISTRADOR y VENDEDOR: todas. */
  listar: () => api.get('/v1/boletas'),
  obtener: (id) => api.get(`/v1/boletas/${id}`),
  /** Solo se envían producto y cantidad: el servidor calcula precios, total y descuenta stock. */
  crear: ({ direccion, items }) => api.post('/v1/boletas', {
    direccion,
    items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
  }),
  cambiarEstado: (id, estado) => api.put(`/v1/boletas/${id}/estado`, { estado }),   // ADMINISTRADOR
  cancelar: (id) => api.put(`/v1/boletas/${id}/cancelar`),
};

export const usuariosApi = {            // tooodo esto es solo ADMINISTRADOR
  listar: () => api.get('/v1/usuarios'),
  crear: (usuario) => api.post('/v1/usuarios', usuario),
  actualizar: (id, usuario) => api.put(`/v1/usuarios/${id}`, usuario),
  eliminar: (id) => api.delete(`/v1/usuarios/${id}`),
};

export const perfilApi = {
  /** GET /v1/perfil → además refresca los datos guardados en la sesión. */
  async ver() {
    const usuario = await api.get('/v1/perfil');
    actualizarUsuarioSesion(usuario);
    return usuario;
  },
  async editar({ nombre, telefono, direccion }) {
    const usuario = await api.put('/v1/perfil', { nombre, telefono, direccion });
    actualizarUsuarioSesion(usuario);
    return usuario;
  },
};
