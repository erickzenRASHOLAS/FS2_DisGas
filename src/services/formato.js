/** Ayudas de presentación compartidas por varias pantallas. */
export const formatoPeso = (monto) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(monto ?? 0));

export const ETIQUETA_ESTADO = { PENDIENTE: 'Pendiente', EN_RUTA: 'En ruta', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado' };
export const etiquetaEstado = (estado) => ETIQUETA_ESTADO[estado] ?? estado;

export const claseEstado = (estado) => ({
  ENTREGADO: 'bg-green-100 text-green-800',
  EN_RUTA: 'bg-blue-100 text-blue-800',
  CANCELADO: 'bg-slate-200 text-slate-600',
}[estado] ?? 'bg-amber-100 text-amber-800');

export const formatoFecha = (iso) => {
  if (!iso) return '';
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? String(iso) : fecha.toLocaleDateString('es-CL');
};

/** "2x Cilindro 15 kg, 1x Regulador de gas" a partir de los detalles de una boleta. */
export const resumenProductos = (boleta) =>
  (boleta.detalles ?? []).map((d) => `${d.cantidad}x ${d.producto?.nombre ?? 'Producto'}`).join(', ');
