import { useMemo, useSyncExternalStore } from 'react';
import { EVENTO_SESION, obtenerUsuarioActual, sesionCruda } from './sesion.js';

function suscribir(avisar) {
  window.addEventListener(EVENTO_SESION, avisar);   // login/logout en esta pestaña
  window.addEventListener('storage', avisar);       // login/logout en otra pestaña
  return () => {
    window.removeEventListener(EVENTO_SESION, avisar);
    window.removeEventListener('storage', avisar);
  };
}

/**
 * Hook: devuelve el usuario con sesión (o null) y se vuelve a renderizar solo
 * cuando la sesión cambia (login, logout, edición de perfil, otra pestaña).
 */
export function useSesion() {
  const crudo = useSyncExternalStore(suscribir, sesionCruda, () => null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => obtenerUsuarioActual(), [crudo]);
}
