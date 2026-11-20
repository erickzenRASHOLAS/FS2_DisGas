import { useLocation } from 'react-router-dom'

/** Componente auxiliar de pruebas: muestra la ruta actual para comprobar redirecciones. */
export default function UbicacionActual() {
  const location = useLocation()
  return <p data-testid="ruta-actual">{location.pathname}</p>
}
