# Frontend React — Gas El Volcán (DisGas)

React 19 + Vite + Tailwind. Se comunica con el backend Spring Boot por API REST (`fetch`) usando JWT.

## Cómo está conectado

```
Pantalla (pages/*.jsx)
   └─ services/servicios.js   un objeto por recurso: authApi, productosApi, boletasApi, usuariosApi, perfilApi
        └─ services/api.js    fetch + header Authorization: Bearer + renovación automática del token
             └─ Backend  http://localhost:8080/v1/...
services/sesion.js            guarda { token, refreshToken, usuario } en localStorage (sobrevive a F5)
services/useSesion.js         hook que re-renderiza la app al iniciar/cerrar sesión
```

| Pantalla | Ruta | Roles | Endpoints |
|---|---|---|---|
| Login | `/login` | público | `POST /v1/auth/login` |
| Registro | `/registro` | público | `POST /v1/auth/registro` |
| Pedir cilindro | `/pedido` | CLIENTE, ADMINISTRADOR | `GET /v1/productos`, `POST /v1/boletas` |
| Mis pedidos | `/mis-pedidos` | CLIENTE | `GET /v1/boletas`, `PUT /v1/boletas/{id}/cancelar` |
| Mi perfil / Editar | `/perfil`, `/editar-perfil` | CLIENTE, ADMINISTRADOR | `GET/PUT /v1/perfil` |
| Órdenes | `/ordenes` | VENDEDOR, ADMINISTRADOR (ver, cambiar estado, cancelar) | `GET /v1/boletas`, `PUT /v1/boletas/{id}/estado` y `/cancelar` |
| Inventario | `/inventario` | VENDEDOR (solo ver), ADMINISTRADOR (CRUD) | `GET /v1/productos/todos`, `GET /v1/categorias`, `POST/PUT/DELETE /v1/productos` |
| Usuarios | `/admin` | ADMINISTRADOR | `GET/POST/PUT/DELETE /v1/usuarios` |

**Seguridad:** el frontend oculta menús y bloquea rutas según el rol (`RequireRole` en `App.jsx` y `Navbar.jsx`),
pero la seguridad real está en el backend: cada endpoint vuelve a validar el JWT y el rol (403 si no corresponde).

**Sesión:** el login guarda `token` (60 min) y `refreshToken` (7 días). Si una petición recibe 401, `api.js` pide un token
nuevo en `POST /v1/auth/refresh` y repite la petición; si tampoco se puede renovar, cierra la sesión.
Al recargar la página la sesión se lee desde `localStorage` y se confirma con `GET /v1/perfil`.

## Comandos

```bash
npm ci
# .env.development ya trae VITE_API_URL=http://localhost:8080
npm run dev              # http://localhost:5173  (el backend debe estar en el puerto 8080)
npm run test:run         # pruebas (el backend se simula, no hace falta tenerlo encendido)
npm run build
```

## Docker

El `docker-compose.yml` vive en la carpeta del backend y levanta MySQL + backend + frontend:

```
proyecto/
  Fs2_Dis_Gas_Backend/   <- docker-compose.yml
  FS2_DisGas/            <- este proyecto (Dockerfile + nginx.conf)
```

```bash
cd Fs2_Dis_Gas_Backend
docker compose up --build
```

- Tienda: http://localhost:3000 · Swagger: http://localhost:8080/swagger-ui.html · Salud: http://localhost:8080/actuator/health
- `VITE_API_URL` (y `VITE_BASE_PATH`) se graban en el JS al compilar y es la dirección del backend **vista desde el navegador**.
  Para AWS: `VITE_API_URL=http://IP-PUBLICA:8080 docker compose up --build` y ese mismo origen del frontend debe estar en `CORS_ORIGIN` del backend.

## Cuentas de demostración (backend con `DEMO_USERS=true`)

| Rol | Correo | Contraseña |
|---|---|---|
| ADMINISTRADOR | admin@volcan.cl | admin123 |
| VENDEDOR | ana.vendedora@volcan.cl | 123456 |
| CLIENTE | juan.perez@email.com | 123456 |
