# Empezar las pruebas con Vitest — EVA02

Este proyecto incorpora una configuración inicial de Vitest y pruebas para la capa de datos, Login, Inventario y Panel de despacho. **Los tests deben ejecutarse en el computador del equipo; esta versión no incluye porcentajes ni resultados inventados.**

## 1. Abrir la carpeta correcta

En VS Code, abre `fs2_DistribuidoraGas/dsy1104-gas-volcan`. La terminal debe quedar en esa carpeta, donde está `package.json`.

Verifica Node y npm:

```powershell
node --version
npm --version
```

Si Windows dice que `npm` no se reconoce, instala Node.js LTS desde https://nodejs.org y vuelve a abrir PowerShell.

## 2. Instalar las dependencias existentes

```powershell
npm install
```

## 3. Instalar las herramientas de pruebas

```powershell
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Ese comando añade las herramientas a `package.json` y actualiza `package-lock.json`. Si ya existe un conflicto de versiones, revisa `npm ls vite vitest @vitest/coverage-v8`; `vitest` y `@vitest/coverage-v8` deben ser compatibles entre sí.

## 4. Ejecutar las pruebas

Ejecutar una vez:

```powershell
npm run test:run
```

Modo interactivo que vuelve a ejecutar los tests al guardar cambios:

```powershell
npm test
```

La configuración usa `jsdom` para simular el DOM y React Testing Library para verificar componentes desde la perspectiva del usuario. Los tests de `datosMock.js` limpian `localStorage` antes de cada caso para que las pruebas no dependan del estado anterior.

## 5. Generar cobertura

```powershell
npm run test:coverage
```

Vitest imprime una tabla en la terminal y genera el informe HTML. Abre este archivo en el navegador:

`dsy1104-gas-volcan/coverage/index.html`

El informe muestra porcentajes de sentencias, ramas, funciones y líneas; los archivos y líneas no cubiertos aparecen detallados. La carpeta `coverage/` se regenera al ejecutar el comando.

## 6. Cómo llegar al mínimo solicitado

Primero genera una línea base real. Si el porcentaje está por debajo del 60 %, abre `coverage/index.html`, identifica los archivos con menor cobertura y añade pruebas para los caminos no ejecutados (por ejemplo, errores, datos ausentes, formularios inválidos y roles distintos). Repite `npm run test:coverage` después de cada lote.

La pauta escrita de EVA02 que compartió el equipo menciona análisis de cobertura, pero no establece allí un umbral numérico. El objetivo de 60 % proviene de la instrucción indicada por el docente/equipo. Para ser conservadores, procuren alcanzar al menos 60 % en líneas y, si es viable, en sentencias, ramas y funciones también. No oculten archivos de producción para inflar el porcentaje; se excluyen únicamente tests, setup, assets estáticos y el punto de entrada `src/main.jsx`.

Una vez que hayan logrado la cobertura requerida, se puede fijar el mínimo en `vite.config.js` para que una caída futura haga fallar la ejecución:

```js
thresholds: {
  statements: 60,
  branches: 60,
  functions: 60,
  lines: 60,
},
```

Añade ese bloque dentro de `test.coverage`. Si alguno de los indicadores aún no alcanza el mínimo, Vitest puede terminar con error, lo cual permite detectar la brecha; el informe debe revisarse igualmente.

## 7. Documento de cobertura

El comando de Vitest genera el informe técnico `coverage/index.html`, no un Word. Para la entrega se acompaña el informe con el documento `Documento_Cobertura_Testing_EVA02_Plantilla.docx` (fuera de este proyecto o descargado aparte), completando:

- fecha de ejecución y versión de Node/npm;
- número real de pruebas aprobadas, fallidas y omitidas;
- los porcentajes reales de los cuatro indicadores;
- observaciones de los archivos sin cobertura y acciones correctivas;
- capturas del terminal y del informe `coverage/index.html`;
- resultado final comparado con el mínimo requerido.

No registres un test como aprobado ni escribas porcentajes hasta ejecutar los comandos. El informe HTML y las evidencias deben corresponder a la misma ejecución.

## 8. Tests de inicio incluidos

- `src/services/datosMock.test.js`: lectura, creación y actualización de pedidos, asignación de repartidor, pagos de demostración, inventario, CRUD de usuarios y autenticación.
- `src/pages/Login.test.jsx`: renderizado, credenciales erróneas, login exitoso y navegación.
- `src/pages/Inventario.test.jsx`: renderizado, guardar stock y validar stock incorrecto.
- `src/pages/Operadora.test.jsx`: pedidos mostrados, asignación y actualización de estado.

Los tests son un punto de inicio, no evidencia de cobertura mínima cumplida. Tras la primera ejecución, amplíen pruebas a Registro, Pedido, MisPedidos, Perfil, Administración de usuarios, rutas del repartidor y los demás módulos que el informe muestre con cobertura insuficiente.

## Nota sobre Bootstrap

En la copia del proyecto revisada, `package.json` del frontend React contiene Tailwind CSS (`tailwindcss` y `@tailwindcss/vite`), pero no una dependencia ni importación de Bootstrap dentro de `src/`. Si Bootstrap ya se añadió en una versión posterior, confirma que los archivos actualizados están en el ZIP. De lo contrario, la responsividad actual se está resolviendo principalmente con clases Tailwind y el requisito de Bootstrap no se considera verificado.
