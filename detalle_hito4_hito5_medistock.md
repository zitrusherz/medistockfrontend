# Detalle ampliado — Hito 4 y Hito 5 (MediStock)

> Expansión de las tareas T4.1–T4.5 y T5.1–T5.4 del plan maestro. Cada tarea: **qué construyes** · **pasos** · **mapeo maqueta→real** · **API y datos** · **detalle técnico/decisiones** · **errores y bordes** · **cómo verificar el DoD**.

---

# HITO 4 — Admin + integración B2B

El admin es el rol que ve todo. Aquí se portan los paneles del mega-admin de la maqueta a páginas reales bajo `/admin/*`, conectadas a la API. Ojo: varios paneles (stock, morosos) también viven en otros roles; en el admin son una **vista agregada de solo lectura**, reusando los mismos componentes de feature.

## T4.1 · Admin — Inicio y Estadísticas

**Qué construyes:** dos páginas. `Inicio` = tablero operativo del día (KPIs + alertas). `Estadísticas` = analítica de ventas (KPIs + gráficos + export).

**Pasos**
1. **Inicio** (`pages/admin/Inicio`): banner con saludo + `SantiagoClock`; fila de KPIs (pedidos pendientes, clientes activos, morosos; cotizaciones solo si decides mantenerlas en M11); tablas resumidas de alertas de stock, vencimientos y morosos (las mismas de logística/analista, en modo lectura con "ver todos" que enlaza a esas zonas).
2. **Estadísticas** (`pages/admin/Estadisticas`): KPIs (ventas 12 meses, pedidos totales, ticket promedio, clientes activos); gráfico de barras de ventas mensuales; donut de ventas por categoría; tabla de pedidos recientes; ranking de top compradores con barras; cada bloque con `StatActions` (Detalles + Exportar CSV) y `StatModal`.

**Mapeo maqueta→real**
- `HomeView`, `PendingCard` (admin-home) → `pages/admin/Inicio` + `ui/StatCard`.
- `StatsView`, `KpiCard` (admin-dashboard) → `pages/admin/Estadisticas` + `ui/StatCard`.
- `BarChart`, `Donut` (admin-ui) → **recharts** (`BarChart`, `PieChart`) en `features/.../charts`, o conservar los SVG hechos a mano como fallback.
- `StatActions`, `StatModal`, `downloadCSV` → `features/.../components` + `utils/csv`.
- `SantiagoClock` → `components/common/SantiagoClock` (zona `America/Santiago`).

**API y datos**
- No hay endpoint de "dashboard" listo: los KPIs se **derivan en el cliente** desde `GET /orders/pedidos/todos/` y `GET /payments/todos/` (y `GET /accounts/clientes/` para "clientes activos").
- Las series mensuales y por categoría también se **agregan en el front** (agrupar pedidos/pagos por mes y por categoría de producto) dentro de un hook/selector. **Decisión a confirmar:** si el backend expone agregados (`/payments/stats/` o similar), úsalo; si no, agrega client-side (suficiente para el volumen de la demo).

**Detalle técnico / decisiones**
- Encapsula el cálculo de KPIs en un hook `useAdminKpis()` que toma las listas crudas y devuelve `{ pending, rev, avg, growth, … }` (replica lo que hacía `Admin.kpis()` en la maqueta, pero sobre datos reales). *(Patrón: Adapter/selector.)*
- Export CSV: `downloadCSV(file, headers, rows)` recibe las filas **crudas** (no formateadas) para que el CSV sea limpio; la tabla en pantalla sí usa `formatCurrency`.
- **M14:** la grilla de KPIs colapsa a 1–2 columnas en móvil; los gráficos van dentro de `ResponsiveContainer` (recharts) o con `viewBox` fluido (SVG).

**Errores y bordes**
- Sin datos aún → gráficos y tablas con estado vacío ("aún no hay ventas"), no un gráfico roto.
- Carga → `Skeleton` en KPIs y tablas (M12).

**Verificar DoD**
- Entrar como admin: los KPIs muestran números que cuadran con las listas reales; el barchart y el donut renderizan; "Exportar" descarga un `.csv` con filas reales y separador `;` (Excel es-CL).

---

## T4.2 · Admin — Productos / inventario

**Qué construyes:** una página con **listado de productos** (buscador + tabla) y un **formulario de alta** de producto que publica en el catálogo.

**Pasos**
1. `pages/admin/Productos` con toggle lista/alta (como `ProductsSection`).
2. **Listado:** tabla (imagen, nombre, código, marca, stock, precio) con buscador por nombre/código.
3. **Alta:** formulario con nombre, SKU (opcional, autogenera), **marca** (select), **categoría** (select), unidad, **precio CLP**, stock inicial, imagen.

**Mapeo maqueta→real**
- `ProductsList`, `ProductForm`, `ProductsSection` (admin-forms) → `features/inventory/components/*` + `pages/admin/Productos`.
- Imagen → `ui/FileUpload` + `utils/image` (`fileToThumb`).

**API y datos**
- Catálogo admin: `GET /inventory/productos/` (o `catalogo`); marcas/categorías para los selects: `GET /inventory/marcas/`, `GET /inventory/categorias/`.
- Alta: `POST /inventory/ingresar-producto/` (probablemente crea producto + inventario inicial en una llamada). CRUD fino: `/inventory/productos|marcas|categorias|lotes|inventarios/`.

**Detalle técnico / decisiones**
- **Cambio clave vs maqueta:** en el prototipo marca/categoría son texto libre; la API usa **FK** (`marca_id`, `categoria_id`). Convierte esos inputs en **selects** poblados desde la API. *(Adapter en el `fromForm`.)*
- **Imagen — decisión a confirmar con backend:** ¿el endpoint recibe un archivo (`multipart/form-data`) o una URL? Si es archivo, envía `FormData` (no JSON) y ajusta el header; si es URL, sube la imagen aparte. La maqueta guarda un dataURL base64 local; eso **no** sirve para producción.
- Al crear con éxito, **invalida** las queries de catálogo (`queryClient.invalidateQueries(['catalogo'])`) para que el producto aparezca sin recargar. *(Command + Observer.)*
- Lotes/inventarios: para la nota basta alta de producto + stock inicial; gestión fina de lotes/inventarios puede ser lectura o un CRUD mínimo.

**Errores y bordes**
- Validación: nombre y precio obligatorios; precio entero ≥ 0; stock ≥ 0.
- `400` con `fieldErrors` → pintar el error junto al input (no solo toast).
- Imagen muy grande → redimensionar con `fileToThumb` antes de subir.

**Verificar DoD**
- Crear un producto en el admin → abrir `/catalogo` (público) → el producto aparece (tras invalidar caché o pasado el `staleTime`).

---

## T4.3 · Admin — Trabajadores

**Qué construyes:** alta de cuentas internas + tabla del equipo con activar/desactivar.

**Pasos**
1. `pages/admin/Trabajadores`: formulario (nombre, correo corporativo, **rol**) + tabla (avatar, rol, ingreso, estado, acción).
2. Acción activar/desactivar por fila.

**Mapeo maqueta→real**
- `WorkersView` (admin-forms) → `features/accounts/components/WorkersView` + `pages/admin/Trabajadores`.

**API y datos**
- Crear: `POST /accounts/registro/trabajador/`. Listar/editar/baja: CRUD `/accounts/trabajadores/`.

**Detalle técnico / decisiones**
- **M4 (crítico):** los roles del select deben ser el enum real — **Administrador, Ejecutivo de Cuentas, Operador Logístico, Analista de Finanzas** — no los de la maqueta (Ventas/Bodega/Soporte/Finanzas). Léelos de la constante `ROLES`.
- **Creación — decisión a confirmar:** ¿el backend envía invitación por correo (el trabajador define su clave) o requiere una contraseña en el POST? Ajusta el formulario a lo que pida la API.
- Activar/desactivar: `PATCH /accounts/trabajadores/{id}/` con `is_active` (o endpoint dedicado). *(Command.)*
- Ruta solo-admin con `RoleRoute`. *(Proxy.)*

**Errores y bordes**
- Correo inválido o duplicado (`400`) → mensaje claro.
- No permitir que el admin se desactive a sí mismo.

**Verificar DoD**
- Crear un trabajador con rol "Operador Logístico" → cerrar sesión → entrar con esa cuenta → aterriza en el dashboard de logística (valida que el rol del backend manda el `RoleRoute`). Desactivar → no puede entrar.

---

## T4.4 · Admin — Clientes / Top compradores

**Qué construyes:** directorio de clientes con ficha de detalle, y un ranking de top compradores.

**Pasos**
1. `pages/admin/Clientes`: tabla/directorio (nombre, tipo institución/paciente, ciudad, pedidos, total, estado) + ficha de detalle.
2. **Ficha** (`CustomerDetail`): pestañas Datos / Pedidos / Pagos; barra de crédito o de gasto.
3. `pages/admin/TopCompradores`: ranking por monto con barras.

**Mapeo maqueta→real**
- `CustomersView`, `CustomerDetail`, `CreditBar`, `DetailTab`, `TopBuyersView`, `Avatar` (admin-customers) → `features/accounts/components/*`; `Avatar`→`ui/Avatar`, `DetailTab`→`ui/Tabs`.

**API y datos**
- Directorio/detalle: CRUD `/accounts/clientes/`, `/accounts/clientes/{id}/`.
- Pedidos del cliente: `GET /orders/pedidos/todos/?cliente=` (o filtro equivalente). Pagos: `GET /payments/todos/?cliente=`.
- Top compradores: si no hay endpoint de ranking, **agrega en el front** sumando montos por cliente.

**Detalle técnico / decisiones**
- **`CreditBar` — decisión:** la maqueta asume "crédito 30 días". Si el backend **no** modela crédito, reemplaza la barra de crédito por "total comprado / pendiente de pago" (cruzando con pagos). Confírmalo antes de codificar la pestaña.
- Distinguir B2B (institución/clínica) vs B2C (paciente) en la presentación (badge de tipo).
- Pestañas con `ui/Tabs`. *(Compound/Composite.)*

**Errores y bordes**
- Cliente sin pedidos/pagos → estados vacíos en las pestañas.
- Paginación si el directorio es grande (`ui/Pagination`).

**Verificar DoD**
- El directorio lista clientes reales; abrir uno muestra sus pedidos; Top compradores ordena por monto descendente con barras proporcionales.

---

## T4.5 · Integración B2B — API Keys (nueva) ⭐

**Qué construyes:** la pantalla que gestiona las **API Keys** para que los ERP de las clínicas consuman tu API sin login. Es la evidencia de la 3ª integración (tu propia API consumida por sistemas externos).

**Pasos**
1. `pages/admin/ApiClients`: tabla de instituciones con su key (enmascarada), estado (activa/revocada), fecha.
2. **Generar key:** crea y muestra la key **completa una sola vez** en un modal "cópiala ahora".
3. **Rotar** (nueva key, invalida la anterior) y **Revocar** (desactiva).

**Mapeo maqueta→real**
- Referencia visual M9 (no estaba en la maqueta) → `features/integrations/services/integrationsService.ts` + `features/integrations/components/*` + `pages/admin/ApiClients`.

**API y datos**
- Gestión: CRUD `/integrations/api-clients/` (crear, listar, rotar, revocar).
- **Uso por el ERP (la demo):** `POST /integrations/pedidos/` con header `X-Api-Key: <key>` y un payload de pedido B2B — sin JWT.

**Detalle técnico / decisiones**
- **Seguridad:** la key en texto plano se devuelve **solo al crearla**; después solo se guarda/muestra un prefijo enmascarado (`sk_live_••••4821`). En el modal de creación, botón "copiar". *(Patrón: Proxy de acceso; Repository en el service.)*
- Ruta solo-admin (`RoleRoute`).

**Errores y bordes**
- Mostrar advertencia "esta key no se volverá a mostrar".
- Revocar pide confirmación (acción destructiva).

**Verificar DoD (y cierre de las 3 integraciones)**
1. Crear una key → se muestra una vez → copiarla.
2. En **Postman**: `POST /integrations/pedidos/` con header `X-Api-Key` y un pedido → responde `201` **sin** login. Eso demuestra que un ERP externo se abastece solo.
3. Revocar la key → la misma petición ahora falla (`401/403`).
- Con esto quedan visibles las **3 integraciones**: API propia (front + ERP), Webpay y courier/tracking.


---

# HITO 5 — Pulido, QA, despliegue, demo

Aquí no se agregan features: se eleva todo de "funciona" a "presentable y desplegado". Trabájalo como **pasadas** sobre lo ya construido, no vista por vista desde cero.

## T5.1 · Pasada de calidad global

**Qué haces:** recorrer cada pantalla aplicando cuatro mejoras transversales.

- **M12 — Estados (loading / vacío / error) en cada vista con datos.**
  - *Loading:* `ui/Skeleton` en tablas y tarjetas mientras la query carga (no un spinner a pantalla completa).
  - *Vacío:* mensaje amable + acción ("No tienes pedidos aún — ir al catálogo"). Los vacíos de la maqueta ya están bien; mantenlos.
  - *Error:* bloque con mensaje traducido (`notifyApiError`) + botón "reintentar" (`refetch` de React Query).
  - *Cómo:* crea un componente reutilizable `<QueryState query={...} empty={...}>` que centralice los tres estados y envuelve cada lista con él.

- **M13 — Accesibilidad.**
  - *Foco visible:* `focus-visible:ring-2 focus-visible:ring-grape-500` en todo interactivo.
  - *Contraste:* revisar el **texto dorado sobre blanco** (`text-gold-600`, `.text-gold-gradient`) — suele no pasar AA en texto pequeño; usa `plum-700` para texto y reserva el dorado para acentos grandes/decorativos.
  - *Modal:* `role="dialog"`, `aria-modal`, **trampa de foco** y devolver el foco al cerrar (el `Modal` ya cierra con Escape; falta el focus trap).
  - *Dropdown* (`AccountMenu`, menús): `role="menu"`, navegable por teclado, Escape y click-fuera.
  - *Formularios:* `label` asociado a cada input; `role="alert"` en errores; `aria-current="page"` en el nav activo.

- **M14 — Responsive.**
  - Envolver tablas anchas en `overflow-x-auto` con `min-w-[640px]`.
  - Sidebar interno colapsable / off-canvas bajo `lg` (drawer en móvil).
  - Grillas de KPIs y catálogo que apilan; barras fijas (sticky bar de producto) que no tapan contenido en móvil.

- **M15 — Microcopy.**
  - Un mismo concepto se nombra igual en todas las pantallas (Carrito, Pedido, Despacho, Sucursal, Institución).
  - Fechas y números en es-CL; sin restos en inglés salvo códigos técnicos.

**Verificar:** checklist por página (¿tiene loading? ¿vacío? ¿error con retry? ¿foco visible? ¿tabla con scroll en móvil?). Pasada con teclado (sin mouse) por el flujo de compra.

---

## T5.2 · Consistencia final

**Qué haces:** barrido de coherencia y limpieza de restos de la maqueta.

- **M1 — Moneda:** buscar en el repo cualquier monto sin formatear (`toLocaleString` con decimales, concatenaciones `'$' +`, restos de `fmt`/`fmt0`); todo debe pasar por `formatCurrency` (CLP entero).
- **M10 — Iconos:** un solo módulo; eliminar definiciones duplicadas (`Icons` vs `NAV_ICONS`).
- **Badges de estado:** un único `Badge` con mapa `estado→estilo`; el mismo estado escrito igual en toda la app (`PENDIENTE`, no "Pendiente"/"pendiente" mezclados).
- **Eliminar mocks muertos:** `catalog-data.js` (generador), datos fake de `admin-data.js`, `DETAILS`, arreglos `featuredTop/Bottom`, `Cart.catalog` hardcodeado — todo lo que ya no se use tras cablear la API.

**Verificar:** `grep` en el repo de `fmt(`, `CATALOG`, `DETAILS`, `Browse`, `Admin.` (el mock) — no deberían quedar referencias vivas. La app compila sin imports muertos.

---

## T5.3 · Despliegue

**Qué haces:** publicar el front consumiendo la API de producción, con Webpay funcionando en el dominio público.

**Pasos**
1. **Build de producción:** `VITE_API_BASE_URL` apuntando a la API real; `pnpm build` → `dist/`.
2. **Elegir destino:**
   - *Amplify:* conectas el repo, defines variables de entorno y build; lo más simple.
   - *S3 + CloudFront:* subes `dist/`; **configura el fallback SPA** (403/404 → `index.html`) o el routing de cliente se rompe al recargar una ruta profunda.
   - *EC2 + nginx:* sirves `dist/` con `try_files $uri /index.html;` (mismo fallback SPA).
3. **CORS:** el backend debe permitir el origen del front desplegado.
4. **Webpay return URL:** apuntar la URL de retorno al dominio público (`https://tu-dominio/cliente/pago/retorno`), tanto en el front como en la config de Webpay del backend. Transbank necesita una URL **alcanzable** (y normalmente **HTTPS**).

**Gotchas (lo que más rompe)**
- Olvidar el fallback SPA → recargar `/catalogo` da 404.
- Webpay return URL apuntando a `localhost` → el pago no vuelve en producción.
- Mezclar http/https → bloqueos de contenido mixto.

**Verificar:** abrir el sitio desplegado y hacer una **compra completa con Webpay de prueba**; confirmar que el retorno aterriza y hace commit.

---

## T5.4 · Demo

**Qué haces:** preparar datos y guion para mostrar los 3 flujos sin caídas (la evaluación es presentación grupal de 10–15 min, todos presentan).

**Datos semilla**
- 1 cliente con dirección, 1 usuario por rol, 1 institución con **API Key** activa, productos con stock en sucursales, y al menos un pedido para mostrar tracking.

**Guion por rol (ejemplo de 12 min)**
1. **Cliente:** catálogo → carrito → checkout → **pago Webpay** (tarjeta de prueba) → ve su pedido.
2. **Ejecutivo:** aprueba ese pedido.
3. **Operador Logístico:** crea el envío → genera nº de **tracking** → avanza estado (el cliente lo ve moverse).
4. **Analista:** ve ese pago en la auditoría.
5. **Admin:** crea un producto que aparece en el catálogo; muestra la gestión de **API Keys**.
6. **ERP (Postman):** con `X-Api-Key` crea un pedido B2B → aparece en el sistema.

**Checklist de los 3 flujos (lo que evalúan):**
- catálogo → compra → **Webpay**
- pedido → **tracking**
- ERP → **API Key**

**Plan B (tip senior):** si un externo (Webpay/courier) falla en vivo, ten listo el conmutador `VITE_USE_MOCKS` o una grabación de respaldo del flujo.

**Verificar:** ensayar de punta a punta una vez, cronometrado, sin errores; repartir quién presenta cada parte.

---

## Resumen de decisiones a confirmar con el backend (antes de H4)

1. ¿Hay endpoint de **agregados/estadísticas** o se calculan en el front? (T4.1)
2. **Imagen de producto:** ¿`multipart` (archivo) o URL? (T4.2)
3. **Alta de trabajador:** ¿invitación por correo o contraseña en el POST? (T4.3)
4. ¿El modelo de cliente tiene **crédito**, o la ficha muestra total/pendiente? (T4.4)
5. Forma exacta del payload de `POST /integrations/pedidos/` para la demo B2B. (T4.5)
