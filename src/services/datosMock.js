/*
 * Capa de datos de DEMOSTRACIÓN.
 * Persiste datos en localStorage para poder probar los flujos del frontend.
 * No reemplaza una API ni una base de datos y no debe utilizarse en producción.
 */
const KEYS = {
  usuarios: 'gasVolcan.usuarios.v1',
  pedidos: 'gasVolcan.pedidos.v1',
  inventario: 'gasVolcan.inventario.v1',
  usuarioActual: 'usuarioActual',
};

const usuariosIniciales = [
  { id: 1, nombre: 'Juan Pérez', correo: 'juan.perez@email.com', telefono: '+56 9 1234 5678', direccion: 'Av. Brasil 456, Depto 12, Chillán', rol: 'Cliente', pass: '123456', estado: 'Activo' },
  { id: 2, nombre: 'María González', correo: 'maria.gonzalez@email.com', telefono: '+56 9 8765 4321', direccion: 'Los Pinos 123, Chillán', rol: 'Cliente', pass: '123456', estado: 'Activo' },
  { id: 3, nombre: 'Carlos Repartidor', correo: 'carlos.repartidor@volcan.cl', telefono: '+56 9 5555 4444', direccion: 'Base Central, Chillán', rol: 'Repartidor', pass: '123456', estado: 'Activo' },
  { id: 4, nombre: 'Ana Operadora', correo: 'ana.operadora@volcan.cl', telefono: '+56 9 3333 2222', direccion: 'Oficina Central, Chillán', rol: 'Operadora', pass: '123456', estado: 'Activo' },
  { id: 5, nombre: 'Admin Volcán', correo: 'admin@volcan.cl', telefono: '+56 9 9999 8888', direccion: 'Oficina Central, Chillán', rol: 'Administrador', pass: 'admin123', estado: 'Activo' },
];

const pedidosIniciales = [
  { id: 'ORD-201', clienteId: 2, cliente: 'María González', telefono: '+56 9 8765 4321', direccion: 'Los Pinos 123, Chillán', tipoGas: '15kg', producto: '1x Cilindro 15 kg', cantidad: 1, estado: 'En Ruta', fecha: '2026-10-05', repartidorId: 3, repartidor: 'Carlos Repartidor', total: 27900, pagoRegistrado: false },
  { id: 'ORD-202', clienteId: 1, cliente: 'Juan Pérez', telefono: '+56 9 1234 5678', direccion: 'Av. Brasil 456, Chillán', tipoGas: '11kg', producto: '2x Cilindro 11 kg', cantidad: 2, estado: 'Pendiente', fecha: '2026-10-05', repartidorId: null, repartidor: '', total: 43000, pagoRegistrado: false },
  { id: 'ORD-203', clienteId: 2, cliente: 'María González', telefono: '+56 9 8765 4321', direccion: 'Los Pinos 123, Chillán', tipoGas: '5kg', producto: '1x Cilindro 5 kg', cantidad: 1, estado: 'Pendiente', fecha: '2026-10-05', repartidorId: null, repartidor: '', total: 10800, pagoRegistrado: false },
  { id: 'ORD-200', clienteId: 1, cliente: 'Juan Pérez', telefono: '+56 9 1234 5678', direccion: 'Av. Brasil 456, Depto 12, Chillán', tipoGas: '15kg', producto: '1x Cilindro 15 kg', cantidad: 1, estado: 'Entregado', fecha: '2026-10-04', repartidorId: 3, repartidor: 'Carlos Repartidor', total: 27900, pagoRegistrado: true, montoPagado: 27900 },
];

const inventarioInicial = [
  { id: 'gas-5', producto: 'Cilindro de gas 5 kg', capacidad: '5 kg', stock: 32, minimo: 8 },
  { id: 'gas-11', producto: 'Cilindro de gas 11 kg', capacidad: '11 kg', stock: 48, minimo: 10 },
  { id: 'gas-15', producto: 'Cilindro de gas 15 kg', capacidad: '15 kg', stock: 27, minimo: 8 },
];

function leer(key, valorInicial) {
  try {
    const valor = window.localStorage.getItem(key);
    if (valor === null) {
      guardar(key, valorInicial);
      return structuredClone(valorInicial);
    }
    const parsed = JSON.parse(valor);
    return Array.isArray(parsed) ? parsed : structuredClone(valorInicial);
  } catch (error) {
    console.warn(`No fue posible leer ${key} desde localStorage.`, error);
    return structuredClone(valorInicial);
  }
}

function guardar(key, valor) {
  try {
    window.localStorage.setItem(key, JSON.stringify(valor));
    return true;
  } catch (error) {
    console.error(`No fue posible guardar ${key} en localStorage.`, error);
    return false;
  }
}

const sinClave = (usuario) => {
  if (!usuario) return null;
  const { pass, password, ...publico } = usuario;
  return publico;
};

export const usuariosMock = usuariosIniciales;
export const pedidosMock = pedidosIniciales;

export const obtenerUsuarios = () => leer(KEYS.usuarios, usuariosIniciales);
export const obtenerRepartidores = () => obtenerUsuarios().filter((u) => u.rol === 'Repartidor' && u.estado !== 'Inactivo');

export const obtenerPedidos = () => {
  const pedidos = leer(KEYS.pedidos, pedidosIniciales);
  // Compatibilidad con registros creados por una versión anterior del prototipo.
  return pedidos.map((pedido) => ({
    repartidorId: pedido.repartidorId ?? null,
    repartidor: pedido.repartidor ?? '',
    pagoRegistrado: pedido.pagoRegistrado ?? false,
    ...pedido,
  }));
};

export const obtenerPedidosPorCliente = (clienteId) =>
  obtenerPedidos().filter((pedido) => String(pedido.clienteId) === String(clienteId));

export const obtenerPedidosPorEstado = (estado) => obtenerPedidos().filter((pedido) => pedido.estado === estado);

export const crearPedido = (nuevoPedido) => {
  const lista = obtenerPedidos();
  const pedido = {
    id: `ORD-${Date.now().toString().slice(-7)}`,
    fecha: new Date().toISOString().slice(0, 10),
    estado: 'Pendiente',
    repartidorId: null,
    repartidor: '',
    pagoRegistrado: false,
    ...nuevoPedido,
  };
  lista.unshift(pedido);
  guardar(KEYS.pedidos, lista);
  return pedido;
};

export const asignarRepartidor = (pedidoId, repartidorId) => {
  const lista = obtenerPedidos();
  const usuario = obtenerUsuarios().find((u) => String(u.id) === String(repartidorId) && u.rol === 'Repartidor');
  const indice = lista.findIndex((pedido) => String(pedido.id) === String(pedidoId));
  if (indice < 0 || !usuario) return { exito: false, mensaje: 'Pedido o repartidor no encontrado.' };
  lista[indice] = { ...lista[indice], repartidorId: usuario.id, repartidor: usuario.nombre };
  const exito = guardar(KEYS.pedidos, lista);
  return { exito, pedido: lista[indice], mensaje: exito ? 'Repartidor asignado correctamente.' : 'No se pudo guardar la asignación.' };
};

export const actualizarEstadoPedido = (pedidoId, nuevoEstado) => {
  const lista = obtenerPedidos();
  const indice = lista.findIndex((pedido) => String(pedido.id) === String(pedidoId));
  if (indice < 0) return { exito: false, mensaje: 'No se encontró el pedido.' };
  lista[indice] = { ...lista[indice], estado: nuevoEstado };
  const exito = guardar(KEYS.pedidos, lista);
  return { exito, pedidos: lista, mensaje: exito ? 'Estado actualizado.' : 'No se pudo guardar el cambio.' };
};

export const registrarPagoEfectivo = (pedidoId) => {
  const lista = obtenerPedidos();
  const indice = lista.findIndex((pedido) => String(pedido.id) === String(pedidoId));
  if (indice < 0) return { exito: false, mensaje: 'No se encontró el pedido.' };
  if (lista[indice].pagoRegistrado) return { exito: true, mensaje: 'El pago ya estaba registrado.' };
  lista[indice] = {
    ...lista[indice],
    pagoRegistrado: true,
    metodoPago: 'Efectivo',
    montoPagado: Number(lista[indice].total ?? 0),
    fechaPago: new Date().toISOString(),
  };
  const exito = guardar(KEYS.pedidos, lista);
  return { exito, mensaje: exito ? 'Pago en efectivo registrado en la demostración.' : 'No se pudo guardar el pago.' };
};

export const obtenerInventario = () => leer(KEYS.inventario, inventarioInicial);

export const guardarInventario = (inventarioActualizado) => {
  const valido = inventarioActualizado.every((item) => String(item.stock).trim() !== '' && Number.isInteger(Number(item.stock)) && Number(item.stock) >= 0);
  if (!valido) return { exito: false, mensaje: 'El stock debe ser un número entero igual o mayor que cero.' };
  const exito = guardar(KEYS.inventario, inventarioActualizado.map((item) => ({ ...item, stock: Number(item.stock) })));
  return { exito, mensaje: exito ? 'Inventario guardado en este navegador.' : 'No se pudo guardar el inventario.' };
};

export const registrarUsuario = (nuevoUsuario) => {
  const usuarios = obtenerUsuarios();
  const correo = String(nuevoUsuario.correo ?? '').trim().toLowerCase();
  if (!correo || usuarios.some((user) => String(user.correo).toLowerCase() === correo)) return false;
  const usuario = {
    id: nuevoUsuario.id ?? Date.now(),
    nombre: String(nuevoUsuario.nombre ?? '').trim(),
    correo,
    telefono: String(nuevoUsuario.telefono ?? '').trim(),
    direccion: String(nuevoUsuario.direccion ?? '').trim(),
    rol: nuevoUsuario.rol ?? 'Cliente',
    estado: nuevoUsuario.estado ?? 'Activo',
    pass: nuevoUsuario.pass ?? nuevoUsuario.password ?? '',
  };
  usuarios.push(usuario);
  return guardar(KEYS.usuarios, usuarios);
};

export const actualizarUsuario = (usuarioId, cambios) => {
  const usuarios = obtenerUsuarios();
  const indice = usuarios.findIndex((usuario) => String(usuario.id) === String(usuarioId));
  if (indice < 0) return { exito: false, mensaje: 'Usuario no encontrado.' };
  const correo = cambios.correo ? String(cambios.correo).trim().toLowerCase() : usuarios[indice].correo;
  const duplicado = usuarios.some((usuario, i) => i !== indice && usuario.correo.toLowerCase() === correo);
  if (duplicado) return { exito: false, mensaje: 'Ese correo ya pertenece a otro usuario.' };
  usuarios[indice] = { ...usuarios[indice], ...cambios, correo };
  const exito = guardar(KEYS.usuarios, usuarios);
  const actual = obtenerUsuarioActual();
  if (actual && String(actual.id) === String(usuarioId)) guardar(KEYS.usuarioActual, sinClave(usuarios[indice]));
  return { exito, mensaje: exito ? 'Usuario actualizado.' : 'No se pudo guardar el usuario.' };
};

export const cambiarEstadoUsuario = (usuarioId) => {
  const usuarios = obtenerUsuarios();
  const indice = usuarios.findIndex((usuario) => String(usuario.id) === String(usuarioId));
  if (indice < 0) return { exito: false, mensaje: 'Usuario no encontrado.' };
  usuarios[indice] = { ...usuarios[indice], estado: usuarios[indice].estado === 'Inactivo' ? 'Activo' : 'Inactivo' };
  const exito = guardar(KEYS.usuarios, usuarios);
  return { exito, usuarios, mensaje: exito ? 'Estado de usuario actualizado.' : 'No se pudo guardar el estado.' };
};

export const eliminarUsuario = (usuarioId) => {
  const actual = obtenerUsuarioActual();
  if (actual && String(actual.id) === String(usuarioId)) return { exito: false, mensaje: 'No puedes eliminar tu propia cuenta desde esta pantalla.' };
  const usuarios = obtenerUsuarios().filter((usuario) => String(usuario.id) !== String(usuarioId));
  const exito = guardar(KEYS.usuarios, usuarios);
  return { exito, usuarios, mensaje: exito ? 'Usuario eliminado.' : 'No se pudo eliminar el usuario.' };
};

export const autenticarUsuario = (correo, pass) => {
  const normalizedEmail = String(correo ?? '').trim().toLowerCase();
  return obtenerUsuarios().find((user) =>
    String(user.correo).toLowerCase() === normalizedEmail &&
    (user.pass === pass || user.password === pass) && user.estado !== 'Inactivo'
  ) ?? null;
};

export const iniciarSesion = (correo, password) => {
  const usuario = autenticarUsuario(correo, password);
  if (!usuario) return { exito: false, mensaje: 'Correo o contraseña incorrectos.' };
  guardar(KEYS.usuarioActual, sinClave(usuario));
  return { exito: true, usuario: sinClave(usuario) };
};

export const obtenerUsuarioActual = () => {
  try {
    const valor = window.localStorage.getItem(KEYS.usuarioActual);
    return valor ? JSON.parse(valor) : null;
  } catch {
    return null;
  }
};

export const cerrarSesion = () => {
  try { window.localStorage.removeItem(KEYS.usuarioActual); } catch (error) { console.warn(error); }
};
