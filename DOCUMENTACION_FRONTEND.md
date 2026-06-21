# Documentación Frontend — MEDISTOCK

> **Versión:** 1.0  
> **Última actualización:** 2026-06-10  
> **Responsable:** Por definir  
> **Repositorio:** Por definir

> **Nota de alcance:** esta documentación describe el estado real del workspace `medistockfrontend` al momento de escribirla. Cuando una ruta o vista está declarada en `src/router/index.tsx` pero no existe como archivo en el proyecto, se marca explícitamente como **pendiente**.

---

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Estructura de carpetas y archivos](#2-estructura-de-carpetas-y-archivos)
3. [Sistema de diseño](#3-sistema-de-diseño)
4. [Mapa de endpoints consumidos](#4-mapa-de-endpoints-consumidos)
5. [Vistas por tipo de usuario](#5-vistas-por-tipo-de-usuario)
6. [Documentación de cada página](#6-documentación-de-cada-página)
7. [Sanitización y normalización de datos](#7-sanitización-y-normalización-de-datos)
8. [Manejo de errores](#8-manejo-de-errores)
9. [Gestión de sesión y JWT](#9-gestión-de-sesión-y-jwt)
10. [Caché y re-fetch](#10-caché-y-re-fetch)
11. [Accesibilidad y responsividad](#11-accesibilidad-y-responsividad)
12. [Pruebas del frontend](#12-pruebas-del-frontend)
13. [Glosario y decisiones técnicas](#13-glosario-y-decisiones-técnicas)
14. [Changelog](#14-changelog)

---

## 1. Visión general

### ¿Qué es este proyecto?

Frontend de la plataforma **MEDISTOCK**, orientada a la comercialización de insumos y equipamiento clínico. La aplicación combina catálogo público, registro de clientes, carrito, checkout, pagos con Webpay, y paneles internos por rol.

### Stack tecnológico real

| Tecnología | Versión | Uso |
|---|---:|---|
| React | 19.2.6 | UI principal |
| React DOM | 19.2.6 | Renderizado en navegador |
| React Router | 7.16.0 | Enrutamiento y guards |
| Axios | 1.16.1 | Cliente HTTP con interceptores |
| TanStack React Query | 5.100.14 | Caché, queries y mutations |
| Zustand | 5.0.14 | Estado global (`auth`, `cart`) |
| React Hook Form | 7.76.1 | Formularios |
| Zod | 4.4.3 | Validación de esquemas |
| Tailwind CSS | 4.3.0 | Estilos utilitarios |
| @tailwindcss/vite | 4.3.0 | Integración con Vite |
| Lucide React | 1.3.0 | Iconografía |
| Vite | 8.0.12 | Bundler y dev server |
| TypeScript | ~6.0.2 | Tipado estático |

**Package manager:** `pnpm@11.5.2`

### Requisitos para correr localmente

```bash
pnpm install
pnpm dev
```

### Variables de entorno usadas por el código

| Variable | Descripción | Default / uso |
|---|---|---|
| `VITE_API_BASE_URL` | URL base del backend | Si no existe, `http://localhost:8000/api` |
| `VITE_USE_MOCKS` | Activa estrategia mock de pagos | Si es `'true'`, usa `mockPaymentStrategy` |

> No hay más variables de entorno consumidas directamente en el código observado.

---

## 2. Estructura de carpetas y archivos

### Árbol funcional actual

```text
medistockfrontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── common/
│   │   │   └── Placeholder.tsx
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Grid.tsx
│   │   │   ├── LogoMark.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── PageWrapper.tsx
│   │   │   ├── RoleSidebar.tsx
│   │   │   ├── Section.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SidebarContext.ts
│   │   │   ├── Stack.tsx
│   │   │   ├── index.ts
│   │   │   ├── navItems.ts
│   │   │   └── useSidebar.ts
│   │   └── ui/
│   │       ├── Accordion.tsx
│   │       ├── Alert.tsx
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Checkbox.tsx
│   │       ├── Divider.tsx
│   │       ├── Drawer.tsx
│   │       ├── FileUpload.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Pagination.tsx
│   │       ├── Popover.tsx
│   │       ├── ProgressBar.tsx
│   │       ├── Radio.tsx
│   │       ├── Select.tsx
│   │       ├── Skeleton.tsx
│   │       ├── Spinner.tsx
│   │       ├── Switch.tsx
│   │       ├── Table.tsx
│   │       ├── Tabs.tsx
│   │       ├── Textarea.tsx
│   │       ├── Toast.tsx
│   │       ├── Tooltip.tsx
│   │       ├── UseToast.tsx
│   │       ├── icons.tsx
│   │       ├── index.ts
│   │       └── toastContext.tsx
│   ├── features/
│   │   ├── accounts/
│   │   │   ├── components/
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useMisDirecciones.ts
│   │   │   │   └── useRegisterForm.ts
│   │   │   ├── services/
│   │   │   │   └── accountsService.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   └── LoginForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useLogin.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   ├── store/
│   │   │   └── types/
│   │   ├── cart/
│   │   │   ├── components/
│   │   │   │   ├── CartMenu.tsx
│   │   │   │   ├── CartRow.tsx
│   │   │   │   ├── CartSummary.tsx
│   │   │   │   ├── QuickAdd.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useCart.ts
│   │   │   │   └── useCatalogLookup.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── catalog/
│   │   │   ├── components/
│   │   │   │   ├── CatalogItems.tsx
│   │   │   │   └── QtyStepper.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCatalogo.ts
│   │   │   │   └── useCategorias.ts
│   │   │   ├── services/
│   │   │   │   ├── mappers/
│   │   │   │   │   └── productMapper.ts
│   │   │   │   └── catalogService.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── integrations/
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── inventory/
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── locations/
│   │   │   ├── hooks/
│   │   │   │   ├── useRegionesConComunas.ts
│   │   │   │   └── useSucursal.ts
│   │   │   ├── services/
│   │   │   │   └── locationsService.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── logistics/
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── orders/
│   │   │   ├── components/
│   │   │   │   ├── CheckoutForm.tsx
│   │   │   │   ├── EstadoBadge.tsx
│   │   │   │   ├── PedidoCard.tsx
│   │   │   │   └── PedidoEditForm.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useEditarPedido.ts
│   │   │   │   ├── useMisPedidos.ts
│   │   │   │   └── usePedido.ts
│   │   │   ├── services/
│   │   │   │   ├── mappers/
│   │   │   │   │   └── orderMapper.ts
│   │   │   │   ├── checkoutService.ts
│   │   │   │   └── orderService.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   └── payments/
│   │       ├── services/
│   │       │   ├── mappers/
│   │       │   │   └── paymentMapper.ts
│   │       │   ├── strategies/
│   │       │   │   ├── MockPaymentStrategy.ts
│   │       │   │   ├── PaymentStrategy.ts
│   │       │   │   ├── WebpayStrategy.ts
│   │       │   │   └── index.ts
│   │       │   ├── pagoSession.ts
│   │       │   ├── paymentService.ts
│   │       │   └── paymentState.ts
│   │       └── types/
│   │           └── index.ts
│   ├── hooks/
│   ├── lib/
│   │   ├── axios.ts
│   │   └── queryClient.ts
│   ├── pages/
│   │   ├── admin/
│   │   ├── analista/
│   │   ├── cliente/
│   │   │   ├── Carrito.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── MisPedidos.tsx
│   │   │   ├── Pago.tsx
│   │   │   ├── PagoRetorno.tsx
│   │   │   └── PedidoDetalle.tsx
│   │   ├── ejecutivo/
│   │   ├── logistica/
│   │   └── public/
│   │       ├── home/
│   │       │   ├── components/
│   │       │   │   ├── Categories.tsx
│   │       │   │   ├── FeaturedGrid.tsx
│   │       │   │   ├── Hero.tsx
│   │       │   │   ├── MediaThumb.tsx
│   │       │   │   ├── ProgramBanner.tsx
│   │       │   │   ├── TrustBar.tsx
│   │       │   │   ├── TwoUp.tsx
│   │       │   │   ├── WidePromo.tsx
│   │       │   │   ├── icons.tsx
│   │       │   │   └── index.ts
│   │       │   └── types.ts
│   │       ├── Catalogo.tsx
│   │       ├── CrearCuenta.tsx
│   │       ├── DesignSystem.tsx
│   │       ├── Home.tsx
│   │       └── Producto.tsx
│   ├── router/
│   │   ├── PrivateRouter.tsx
│   │   ├── RoleRoute.tsx
│   │   ├── homeByRole.ts
│   │   └── index.tsx
│   ├── services/
│   │   └── api.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   └── cartStore.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── models.ts
│   │   └── roles.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── csv.ts
│   │   ├── formatCurrency.ts
│   │   ├── formatDate.ts
│   │   ├── image.ts
│   │   ├── iva.ts
│   │   ├── notifyApiError.ts
│   │   └── validators.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── DOCUMENTACION_FRONTEND.md
├── eslint.config.js
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### 2.1 Archivos recientes agregados

Además del árbol resumido anterior, el workspace incluye archivos nuevos o recientemente incorporados que ahora forman parte de la documentación funcional:

- `public/favicon.svg`
- `public/icons.svg`
- `src/assets/hero.png`, `react.svg`, `vite.svg`
- `src/components/common/Placeholder.tsx`
- `src/components/layout/AuthLayout.tsx`
- `src/components/layout/DashboardLayout.tsx`
- `src/components/layout/Grid.tsx`, `Section.tsx`, `Stack.tsx`, `PageHeader.tsx`, `PageWrapper.tsx`, `RoleSidebar.tsx`, `useSidebar.ts`
- `src/features/auth/components/LoginForm.tsx`, `src/features/auth/hooks/useLogin.ts`
- `src/features/accounts/components/RegisterForm.tsx`, `src/features/accounts/hooks/useMisDirecciones.ts`, `src/features/accounts/hooks/useRegisterForm.ts`
- `src/features/cart/components/CartMenu.tsx`, `QuickAdd.tsx`, `CartRow.tsx`, `CartSummary.tsx`
- `src/features/catalog/components/CatalogItems.tsx`, `QtyStepper.tsx`
- `src/features/catalog/services/mappers/productMapper.ts`
- `src/features/locations/hooks/useRegionesConComunas.ts`, `useSucursal.ts`
- `src/features/orders/components/CheckoutForm.tsx`, `src/features/orders/services/checkoutService.ts`, `src/features/orders/services/mappers/orderMapper.ts`
- `src/features/payments/services/pagoSession.ts`, `paymentState.ts`, `paymentService.ts`, `services/mappers/paymentMapper.ts`
- `src/features/payments/services/strategies/MockPaymentStrategy.ts`, `PaymentStrategy.ts`, `WebpayStrategy.ts`, `index.ts`
- `src/pages/cliente/Pago.tsx`, `src/pages/cliente/PagoRetorno.tsx`
- `src/pages/public/home/components/Categories.tsx`, `FeaturedGrid.tsx`, `Hero.tsx`, `MediaThumb.tsx`, `ProgramBanner.tsx`, `TrustBar.tsx`, `TwoUp.tsx`, `WidePromo.tsx`, `icons.tsx`, `index.ts`
- `src/pages/public/home/types.ts`

Los componentes de `src/components/ui/` y los archivos de `src/pages/public/home/` siguen una lógica similar: componen la interfaz, pero no cambian el contrato funcional principal de la aplicación.

### Observación importante sobre el router

`src/router/index.tsx` declara rutas para varias vistas que **todavía no existen como archivo** en el workspace. Eso significa que el estado actual del proyecto es parcialmente scaffolded.

#### Rutas declaradas pero sin archivo encontrado

- `/login`
- `/cliente`
- `/cliente/pedidos`
- `/cliente/pedidos/:id`
- `/cliente/pagos`
- `/ejecutivo`
- `/ejecutivo/pedidos`
- `/logistica`
- `/logistica/ordenes`
- `/logistica/alertas`
- `/analista`
- `/analista/pagos`
- `/admin`
- `/admin/productos`
- `/admin/trabajadores`
- `/admin/clientes`
- `/admin/api-keys`
- `*` (404)

### Convenciones de nombres observadas

| Tipo | Convención | Ejemplo |
|---|---|---|
| Componentes React | PascalCase | `CartSummary.tsx` |
| Hooks | camelCase con prefijo `use` | `useCatalogo.ts` |
| Servicios | camelCase + sufijo `Service` | `catalogService.ts` |
| Stores | camelCase + sufijo `Store` | `authStore.ts` |
| Utilidades | camelCase | `formatCurrency.ts` |
| Rutas | kebab o segmento simple | `/cliente/pedidos` |

---

## 3. Sistema de diseño

### 3.1 Tema global

El tema visual se define en `src/index.css` con `@theme` de Tailwind v4.

#### Fuentes

- `--font-sans`: `Plus Jakarta Sans`
- `--font-display`: `Cormorant Garamond`

#### Paleta principal

| Grupo | Variables | Uso |
|---|---|---|
| Grape | `--color-grape-50` a `--color-grape-900` | Texto secundario, bordes, fondos suaves |
| Plum | `--color-plum-500`, `--color-plum-600`, `--color-plum-700`, `--color-plum-800` | Marca principal |
| Azure | `--color-azure-500`, `--color-azure-600`, `--color-azure-700` | Links y acentos informativos |
| Gold | `--color-gold-200` a `--color-gold-600` | CTA, destacados, separadores |
| Ink | `--color-ink` | Texto principal |

#### Tokens semánticos

| Token | Valor | Uso |
|---|---|---|
| `--color-background` | `#F4F1F7` | Fondo general |
| `--color-primary` | `var(--color-plum-700)` | Acción principal |
| `--color-primary-strong` | `var(--color-plum-800)` | Hover/énfasis |
| `--color-accent` | `var(--color-gold-400)` | CTA y reglas decorativas |
| `--color-surface` | `#ffffff` | Tarjetas, paneles |
| `--color-surface-muted` | `var(--color-grape-50)` | Fondos suaves |
| `--color-border` | `var(--color-grape-100)` | Bordes |
| `--color-text` | `var(--color-ink)` | Texto principal |
| `--color-text-muted` | `var(--color-grape-500)` | Texto secundario |
| `--color-ring` | `var(--color-grape-500)` | Focus visible |

#### Estados

| Estado | Token base | Token suave | Uso |
|---|---|---|---|
| Éxito | `--color-success` | `--color-success-soft` | Confirmado, aprobado, stock disponible |
| Advertencia | `--color-warning` | `--color-warning-soft` | Stock crítico, pendientes |
| Error | `--color-danger` | `--color-danger-soft` | Validación, rechazo |
| Info | `--color-info` | `--color-info-soft` | Mensajes neutrales |

### 3.2 Utilidades visuales destacadas

Definidas en `src/index.css`:

- `.gold-rule`
- `.text-gold-gradient`
- `.ring-gold`
- `.ph-stripes`
- `.range-thumb`

### 3.3 Kit de componentes base

`src/components/ui/index.ts` exporta un kit amplio reutilizable:

- Formularios: `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `FileUpload`
- Feedback: `Spinner`, `Skeleton`, `ProgressBar`, `Alert`, `ToastProvider`, `Badge`
- Contenedores: `Card`, `Modal`, `Drawer`, `Tooltip`, `Popover`, `Accordion`, `Tabs`
- Datos: `Table`, `Pagination`, `Avatar`
- Decorativos: `Divider`, `GoldRuleIcon`

### 3.4 Componentes de layout

- `Navbar`
- `Sidebar`
- `RoleSidebar`
- `LogoMark`
- `AppShell`
- `navItems.ts`

`AppShell` compone el chrome interno: navbar fijo, sidebar sensible al rol y `<Outlet />` para las páginas hijas.

---

## 4. Mapa de endpoints consumidos

> Esta sección agrupa los endpoints observados en servicios, hooks y flujos de UI.

### 4.1 Autenticación y cuentas

| Endpoint | Método | Archivo | Función | Dónde se usa |
|---|---|---|---|---|
| `/accounts/login/` | POST | `features/auth/services/authService.ts` | `login()` | Login y auto-login tras registro |
| `/accounts/login/refresh/` | POST | `features/auth/services/authService.ts` | `refresh()` | Interceptor de `lib/axios.ts` |
| `/accounts/logout/` | POST | `features/auth/services/authService.ts` | `logout()` | `authStore.logout()` |
| `/accounts/perfil/me/` | GET | `features/auth/services/authService.ts` | `getMe()` | Bootstrap de sesión y perfil |
| `/accounts/registro/cliente/` | POST | `features/accounts/services/accountsService.ts` | `registrarCliente()` | `RegisterForm` |
| `/accounts/mis-direcciones/` | GET | `features/accounts/services/accountsService.ts` | `getMisDirecciones()` | `CheckoutForm` |

### 4.2 Ubicaciones

| Endpoint | Método | Archivo | Función | Dónde se usa |
|---|---|---|---|---|
| `/locations/regions-with-comunas/` | GET | `features/locations/services/locationsService.ts` | `getRegionesConComunas()` | `useRegionesConComunas()` |
| `/locations/regiones/` | GET | `features/locations/services/locationsService.ts` | `getRegiones()` | Uso liviano de regiones |
| `/locations/sucursales/{id}/` | GET | `features/locations/services/locationsService.ts` | `getSucursal()` | Checkout / ficha de sucursal |
| `/locations/comunas-chilexpress/` | GET | `features/locations/services/locationsService.ts` | `getComunasChilexpress()` | Cotización logística futura |
| `/locations/sucursales/` | GET | `features/catalog/services/catalogService.ts` | `getSucursales()` | Filtro de catálogo |

### 4.3 Catálogo e inventario

| Endpoint | Método | Archivo | Función | Dónde se usa |
|---|---|---|---|---|
| `/inventory/catalogo/` | GET | `features/catalog/services/catalogService.ts` | `getCatalogo()` | `useCatalogo()` |
| `/inventory/catalogo-cajas/` | GET | `features/catalog/services/catalogService.ts` | `getCatalogoCajas()` | Filtro de cajas/bultos |
| `/inventory/public/productos/{id}/` | GET | `features/catalog/services/catalogService.ts` | `getProducto()` | Página de producto |
| `/inventory/public/categorias/` | GET | `features/catalog/services/catalogService.ts` | `getCategorias()` | Landing y filtros |
| `/inventory/public/marcas/` | GET | `features/catalog/services/catalogService.ts` | `getMarcas()` | Filtros del catálogo |

### 4.4 Pedidos

| Endpoint | Método | Archivo | Función | Dónde se usa |
|---|---|---|---|---|
| `/orders/pedidos/` | POST | `features/orders/services/orderService.ts` | `crearPedido()` | Checkout |
| `/orders/pedidos/mis-pedidos/` | GET | `features/orders/services/orderService.ts` | `misPedidos()` | Historial del cliente |
| `/orders/pedidos/todos/` | GET | `features/orders/services/orderService.ts` | `todosPedidos()` | Panel interno |
| `/orders/pedidos/{id}/` | GET | `features/orders/services/orderService.ts` | `detallePedido()` | Detalle de pedido |
| `/orders/pedidos/{id}/` | PATCH | `features/orders/services/orderService.ts` | `editarPedido()` | Edición limitada |
| `/orders/pedidos/{id}/aprobar/` | POST | `features/orders/services/orderService.ts` | `aprobarPedido()` | Flujo interno de aprobación |

### 4.5 Pagos

| Endpoint | Método | Archivo | Función | Dónde se usa |
|---|---|---|---|---|
| `/payments/webpay/iniciar/` | POST | `features/payments/services/strategies/WebpayStrategy.ts` | `iniciar()` | Inicio del pago Webpay |
| `/payments/webpay/commit/` | POST | `features/payments/services/strategies/WebpayStrategy.ts` | `commit()` | Retorno desde Transbank |
| `/payments/webpay/estado/{token_ws}/` | GET | `features/payments/services/strategies/WebpayStrategy.ts` | `consultar()` | Consulta de estado |
| `/payments/mis-pagos/` | GET | `features/payments/services/paymentService.ts` | `misPagos()` | Historial del cliente |
| `/payments/todos/` | GET | `features/payments/services/paymentService.ts` | `todosPagos()` | Panel de finanzas |

### 4.6 Estrategia de pagos

`src/features/payments/services/strategies/index.ts` selecciona estrategia por entorno:

- `VITE_USE_MOCKS === 'true'` → `mockPaymentStrategy`
- en caso contrario → `webpayStrategy`

---

## 5. Vistas por tipo de usuario

### 5.1 Roles del sistema

El tipo real de `Rol` en `src/types/roles.ts` contiene:

- `CLIENTE`
- `ADMINISTRADOR`
- `EJECUTIVO`
- `OPERADOR_LOGISTICO`
- `ANALISTA`

### 5.2 Rutas disponibles por rol en el router actual

| Ruta | Público | Cliente | Ejecutivo | Logística | Analista | Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/login` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/registro` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/catalogo` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/producto/:codigo` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/cliente/*` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/ejecutivo/*` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `/logistica/*` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `/analista/*` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `/admin/*` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 5.3 Relación con navegación interna

`src/components/layout/navItems.ts` define ítems de menú por rol. Hay rutas del menú que todavía no existen como páginas concretas, por ejemplo:

- `/ejecutivo/stock`
- `/ejecutivo/clientes`
- `/admin/estadisticas`

Esto debe considerarse deuda técnica o scaffolding pendiente.

---

## 6. Documentación de cada página

### 6.1 Home — `/`

**Archivo:** `src/pages/public/Home.tsx`

**Propósito:** landing pública con productos destacados y categorías.

**Qué hace:**
- Consume `useCatalogo({})` y `useCategorias()`.
- Normaliza datos con helpers locales (`asList`, `toFeatured`, `toCategoryCard`).
- Renderiza secciones presentacionales: `TrustBar`, `Hero`, `FeaturedGrid`, `WidePromo`, `Categories`, `TwoUp`, `ProgramBanner`.
- Reutiliza componentes de `src/pages/public/home/components/` para mantener la landing modular.
- Si no hay destacados o categorías, esas secciones simplemente no se renderizan.

**Datos que muestra:**
- Productos destacados.
- Categorías de catálogo.
- Bloques promocionales e informativos.

**Dependencias clave:**
- React Query para cachear catálogo y categorías.
- Componentes del subárbol `pages/public/home/`.

---

### 6.2 Catálogo — `/catalogo`

**Archivo:** `src/pages/public/Catalogo.tsx`

**Propósito:** buscar, filtrar y navegar productos.

**Qué hace:**
- Lee filtros desde la URL con `useSearchParams`.
- Usa `useCatalogo()` para catálogo filtrado por servidor + búsqueda por cliente.
- Carga categorías, marcas y sucursales con `useQuery`.
- Permite alternar vista `grid` / `list`.
- Implementa paginación local de 12 productos por página.

**Filtros soportados:**
- `search`
- `cat` / categoría
- `man` / marca
- `suc` / sucursal

**Puntos relevantes:**
- La URL es la fuente de verdad de los filtros.
- Usa `SkeletonCard` mientras carga.
- `Badge` muestra filtros activos y permite quitarlos.
- Los enlaces a producto se hacen con `<a href=...>` en `CatalogItems`, por lo que hay recarga completa de página en ese punto.

---

### 6.3 Producto — `/producto/:codigo`

**Archivo:** `src/pages/public/Producto.tsx`

**Propósito:** mostrar detalle de un producto y permitir añadirlo al carrito.

**Qué hace:**
- Obtiene `codigo` desde la ruta.
- Carga el producto con `catalogService.getProducto(codigo)`.
- Determina sucursal por defecto según el carrito actual.
- Permite cambiar sucursal y cantidad con `QtyStepper`.
- Llama a `useCartActions().addItem(...)` para agregar al carrito.
- Muestra stock por sucursal, descripción, categorías, registro sanitario y productos relacionados.

**Reglas de negocio visibles:**
- Un carrito solo admite productos de una sucursal.
- La cantidad no puede superar el stock de la sucursal elegida.
- Si el producto requiere control de vencimiento, se muestra advertencia.

**Estado local relevante:**
- `qty`
- `chosenSucursalId`
- `added`
- `cartError`

---

### 6.4 Crear cuenta — `/registro`

**Archivo:** `src/pages/public/CrearCuenta.tsx`

**Propósito:** mostrar el formulario de registro de cliente.

**Qué hace:**
- Solo compone el layout superior y `RegisterForm`.
- Toda la lógica vive en `features/accounts`.

#### RegisterForm

**Archivo:** `src/features/accounts/components/RegisterForm.tsx`

**Funcionalidad:**
- Captura datos personales.
- Carga regiones/comunas dependientes.
- Captura dirección de entrega.
- Captura credenciales de acceso.
- Incluye toggle de visibilidad de contraseña.

#### useRegisterForm

**Archivo:** `src/features/accounts/hooks/useRegisterForm.ts`

**Funcionalidad:**
- Valida con Zod + React Hook Form.
- Traduce campos del formulario al payload de la API.
- Envía el registro con `accountsService.registrarCliente()`.
- Intenta auto-login con `authService.login()`.
- Si el auto-login falla, redirige a `/login` con toast informativo.

**Regla importante:** el registro usa `username = correo`.

---

### 6.4.1 Iniciar sesión — `/login`

**Archivo:** `src/features/auth/components/LoginForm.tsx`

**Propósito:** autenticar al usuario y redirigirlo según su rol.

**Qué hace:**
- Valida el formulario con Zod + React Hook Form.
- Envía credenciales con `useLogin()`.
- Muestra error inline solo para `401`.

**Archivos que participan en el flujo:**
- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/hooks/useLogin.ts`
- `src/features/auth/services/authService.ts`
- `src/store/authStore.ts`

**Comportamiento clave:**
- `useLogin()` llama a `authService.login()`, guarda tokens, hace `loadProfile()` y navega al home por rol.
- El login fallido limpia la sesión para evitar estados parciales.

---

### 6.4.2 Iniciar pago — `/cliente/pago/:pedidoId`

**Archivo:** `src/pages/cliente/Pago.tsx`

**Propósito:** iniciar el cobro Webpay de un pedido ya creado.

**Qué hace:**
- Lee `pedidoId` desde la ruta.
- Llama a `checkoutService.pagar(pedidoId)`.
- Guarda el `token_ws` en `sessionStorage` a través de `guardarPagoPendiente()`.
- Redirige a Webpay con la URL devuelta por la estrategia.
- Si el backend devuelve una transacción ya iniciada, navega al retorno con el token.

**Estados visibles:**
- `iniciando`
- `redirigiendo`
- `error`

**Fallbacks de error:**
- `502` → mensaje claro de indisponibilidad de Webpay.
- otros errores → mensaje genérico y opción de reintentar.

---

### 6.4.3 Retorno de pago — `/cliente/pago/retorno`

**Archivo:** `src/pages/cliente/PagoRetorno.tsx`

**Propósito:** confirmar el pago al volver desde Transbank.

**Qué hace:**
- Lee `token_ws` desde query string o desde `sessionStorage`.
- Ejecuta `paymentService.commitPago(tokenWs)`.
- Enriquce el resultado con `paymentService.consultarPago(tokenWs)`.
- Decide la vista con `paymentState.ts`.
- Limpia el pago pendiente cuando la transacción se resuelve.

**Estados visibles:**
- `confirmando`
- `resultado`
- `recuperable`
- `abortado`
- `error`

**Patrón de estado:**
- `paymentState.ts` traduce el `estado_pago` del backend a una experiencia visual (`aprobado`, `rechazado`, `anulado`, `error`, `pendiente`).

**Persistencia efímera asociada:**
- `pagoSession.ts` usa `sessionStorage` para no perder el `token_ws` si la pestaña se recarga.

---

### 6.5 Carrito — `/cliente/carrito`

**Archivo:** `src/pages/cliente/Carrito.tsx`

**Propósito:** revisar el pedido en curso.

**Qué hace:**
- Muestra `QuickAdd` en el panel lateral.
- Lista líneas del carrito con `CartRow`.
- Muestra el resumen con `CartSummary`.
- Si el carrito está vacío, presenta estado vacío con enlace al catálogo.

#### CartSummary

**Archivo:** `src/features/cart/components/CartSummary.tsx`

**Funcionalidad:**
- Calcula neto, IVA y total estimado.
- Permite vaciar el carrito.
- Permite ir al checkout con `/cliente/checkout`.

---

### 6.6 Checkout — `/cliente/checkout`

**Archivo:** `src/pages/cliente/Checkout.tsx`

**Propósito:** finalizar el pedido cuando el carrito ya tiene productos.

**Qué hace:**
- Lee los ítems del carrito con `useCartItems()`.
- Si el carrito está vacío, muestra un estado vacío con enlace al catálogo.
- Si hay productos, renderiza `CheckoutForm` desde `features/orders/components/CheckoutForm`.

**Comportamiento visible en la UI:**
- Breadcrumb: Inicio / Mi pedido / Finalizar.
- Título: “Finalizar pedido”.
- Bloque de estado vacío si no hay productos.

**Dependencia clave:**
- El flujo de checkout real está encapsulado en `CheckoutForm`; esta página actúa como contenedor.

---

### 6.7 Design System — `src/pages/public/DesignSystem.tsx`

**Estado actual:** archivo existente pero vacío.

**Implicación:**
- No aporta comportamiento funcional todavía.
- Puede usarse como futura página de documentación visual / componentes del kit.

---

### 6.8 CheckoutForm — `src/features/orders/components/CheckoutForm.tsx`

**Propósito:** capturar los datos finales del pedido y convertir el carrito en una orden real.

**Qué hace:**
- Usa React Hook Form + Zod.
- Carga direcciones del cliente con `useMisDirecciones()`.
- Carga la sucursal activa con `useSucursal()`.
- Construye el pedido con `checkoutService.crearDesdeCarrito()`.
- Vacía el carrito solo tras una creación exitosa del pedido.
- Maneja errores por línea de stock, bloqueos por rol y mensajes generales.

**Secciones visibles:**
- Dirección de entrega.
- Sucursal origen.
- Tipo de despacho.
- Prioridad médica.
- Observación opcional.
- Resumen del pedido.

---

### 6.9 Auth Layout — `src/components/layout/AuthLayout.tsx`

**Propósito:** layout para pantallas de autenticación.

**Qué hace:**
- Centra una tarjeta de login/registro.
- Permite una marca superior (`brand`).
- Incluye un panel lateral opcional decorativo en desktop (`aside`).

---

### 6.10 Dashboard Layout — `src/components/layout/DashboardLayout.tsx`

**Propósito:** estructura base de paneles internos con navbar, sidebar y contenido scrolleable.

**Qué hace:**
- Inyecta `navbar` y `sidebar` ya renderizados.
- Ajusta el offset del contenido según el ancho del sidebar.
- Mantiene el contenido principal independiente del chrome.

---

### 6.11 Page Header — `src/components/layout/PageHeader.tsx`

**Propósito:** encabezado reutilizable con breadcrumb, título, descripción y acciones.

**Qué hace:**
- Renderiza breadcrumb navegable.
- Muestra título y descripción.
- Reserva un slot derecho para botones o badges.

---

### 6.12 Page Wrapper — `src/components/layout/PageWrapper.tsx`

**Propósito:** contenedor de ancho y padding consistente para páginas.

**Qué hace:**
- Permite elegir un tamaño de ancho máximo.
- Permite habilitar o no padding horizontal y vertical.
- Puede renderizarse como `main`, `section` u otro elemento con `as`.

---

### 6.13 Role Sidebar — `src/components/layout/RoleSidebar.tsx`

**Propósito:** sidebar principal de la aplicación interna, filtrado por rol.

**Qué hace:**
- Renderiza navegación a partir de `navItems.ts`.
- Muestra usuario actual y rol.
- Permite colapsar en desktop.
- Permite off-canvas en móvil.
- Incluye logout.

---

### 6.14 Servicios y hooks del checkout

#### `src/features/orders/services/checkoutService.ts`

**Propósito:** fachada para convertir el carrito en pedido.

**Qué hace:**
- Construye el payload de pedido con `buildPedido()`.
- Lee `sucursalId` y `detalles` desde el carrito.
- Llama a `orderService.crearPedido()`.
- Expone `limpiarCarrito()` para vaciar el carrito tras éxito.

#### `src/features/catalog/services/mappers/productMapper.ts`

**Propósito:** adaptar productos, categorías y marcas desde el DTO del backend al modelo de dominio de la UI.

**Qué hace:**
- Convierte `sku` en `code`.
- Convierte el stock por sucursal a `stockBySucursal`.
- Calcula `stockTotal` como derivado.

#### `src/features/orders/services/mappers/orderMapper.ts`

**Propósito:** traducir pedidos y detalles desde snake_case a camelCase.

**Qué hace:**
- Mapea `PedidoDTO` a `Pedido`.
- Mapea `DetallePedidoDTO` a `DetallePedido`.
- Expone montos y estados ya listos para la UI.

#### `src/features/payments/services/paymentService.ts`

**Propósito:** fachada de pagos.

**Qué hace:**
- `iniciarPago()` delega en la estrategia de pago.
- `commitPago()` confirma el cobro al volver de Webpay.
- `consultarPago()` enriquece el estado.
- `misPagos()` y `todosPagos()` listan pagos ya normalizados.

#### `src/features/payments/services/pagoSession.ts`

**Propósito:** persistencia efímera del pago en curso.

**Qué hace:**
- Guarda `token_ws`, `pedidoId` y `transaccionId` en `sessionStorage`.
- Permite recuperar el flujo si el retorno pierde el query param.

#### `src/features/payments/services/paymentState.ts`

**Propósito:** derivar la vista final del pago según `estado_pago` / resultado de commit.

**Qué hace:**
- Traduce estados del backend a resultados visuales.
- Define copy y tono semántico para cada estado.
- Indica cuándo se permite reintentar el pago.

#### `src/features/accounts/hooks/useMisDirecciones.ts`

**Propósito:** cargar las direcciones del cliente para el checkout.

**Qué hace:**
- Consulta `accountsService.getMisDirecciones()`.
- Usa `staleTime` corto y evita refetch al enfocar ventana.

#### `src/features/locations/hooks/useSucursal.ts`

**Propósito:** cargar la sucursal activa del carrito.

**Qué hace:**
- Consulta `locationsService.getSucursal(id)`.
- Solo dispara la query cuando hay un `id` válido.

---

### 6.15 Tipos nuevos relevantes

#### `src/features/orders/types/index.ts`

**Contiene:**
- Estados de pedido.
- Tipo de venta.
- Tipo de despacho.
- Prioridad médica.
- DTOs de pedido.
- Payloads de creación/edición/aprobación.

#### `src/features/payments/types/index.ts`

**Contiene:**
- Transacciones de pago.
- Respuestas de inicio/commit de Webpay.
- Estado de Webpay.
- Filtros de pagos.

#### `src/features/auth/components/LoginForm.tsx` y `src/features/auth/hooks/useLogin.ts`

**Contienen el flujo de login** con validación, manejo de error inline y redirección por rol.

---

### 6.16 Páginas declaradas en router pero aún pendientes

El router ya tiene contratos para estas vistas, pero no existe archivo en el workspace:

- `/login`
- `/cliente`
- `/cliente/pedidos`
- `/cliente/pedidos/:id`
- `/cliente/pagos`
- `/ejecutivo`
- `/ejecutivo/pedidos`
- `/logistica`
- `/logistica/ordenes`
- `/logistica/alertas`
- `/analista`
- `/analista/pagos`
- `/admin`
- `/admin/productos`
- `/admin/trabajadores`
- `/admin/clientes`
- `/admin/api-keys`
- `*` (404)

Esto no invalida la documentación; solo significa que el frontend está a medio implementar respecto de su router declarado.

#### Páginas/herramientas nuevas que sí existen pero aún no estaban documentadas

- `src/components/layout/AuthLayout.tsx`
- `src/components/layout/DashboardLayout.tsx`
- `src/components/layout/PageHeader.tsx`
- `src/components/layout/PageWrapper.tsx`
- `src/components/layout/RoleSidebar.tsx`
- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/hooks/useLogin.ts`
- `src/features/orders/components/CheckoutForm.tsx`
- `src/features/orders/services/checkoutService.ts`
- `src/features/accounts/hooks/useMisDirecciones.ts`
- `src/features/locations/hooks/useSucursal.ts`
- `src/features/payments/services/pagoSession.ts`
- `src/features/payments/services/paymentState.ts`
- `src/features/payments/services/paymentService.ts`
- `src/features/catalog/services/mappers/productMapper.ts`
- `src/features/orders/services/mappers/orderMapper.ts`
- `src/features/payments/services/mappers/paymentMapper.ts`
- `src/features/orders/types/index.ts`
- `src/features/payments/types/index.ts`

---

## 7. Sanitización y normalización de datos

### 7.1 Antes de enviar al backend

#### `src/utils/validators.ts`

Funciones reales presentes:

| Función | Propósito |
|---|---|
| `cleanRut()` | Elimina caracteres no válidos del RUT |
| `formatRut()` | Formatea RUT para mostrar/reenviar |
| `isValidRut()` | Valida dígito verificador con módulo 11 |
| `isEmail()` | Validación pragmática de email |
| `isStrongPassword()` | Al menos 8 caracteres, una letra y un número |
| `isPhoneCL()` | Valida móvil chileno |
| `isNotEmpty()` | Cadena no vacía |

#### Registro de cliente

En `useRegisterForm`:

- `correo`, `nombre`, `apellido`, `calle`, `numero`, `detalle`, `referencia` usan `.trim()`
- `rut` se normaliza con `formatRut()` al construir el payload
- `telefono` se envía limpio con `.trim()`

### 7.2 Después de recibir del backend

#### `src/utils/formatCurrency.ts`

- `formatCLP()` formatea montos como moneda CLP.

#### `src/utils/iva.ts`

- `calcularIVA()` calcula 19%.
- `calcTotales()` devuelve `{ neto, iva, total }`.

### 7.3 Manejo de errores de validación

`src/utils/notifyApiError.ts` aplica dos caminos:

1. `400` con errores por campo → se usan `setError()` en el formulario.
2. Otros errores → toast con mensaje amigable.

---

## 8. Manejo de errores

### 8.1 Normalización central

`src/lib/axios.ts` define `ApiError` y `toApiError()`.

Casos cubiertos:

- `detail` de DRF
- `error` custom del backend
- errores por campo en `400`
- red caída / timeout / CORS

### 8.2 Interceptor global de 401

Comportamiento real:

- Si recibe `401` en una petición normal, intenta refrescar token.
- Si hay múltiples peticiones fallidas al mismo tiempo, se encolan y esperan un solo refresh.
- Si el refresh falla, ejecuta logout forzado y redirige a `/login`.
- No intenta refresh sobre `/accounts/login/` ni sobre `/accounts/login/refresh/`.

### 8.3 Mensajería al usuario

`notifyApiError()` traduce a texto amigable:

| Código | Mensaje |
|---|---|
| `0` | Sin conexión |
| `401` | Sesión expirada |
| `403` | Sin permisos |
| `404` | Recurso inexistente |
| `409` | Posible cambio de stock |
| `500` | Error interno |
| `502` | Servicio externo no responde |
| `503` | Servicio no disponible |

---

## 9. Gestión de sesión y JWT

### 9.1 Dónde se almacenan los tokens

`src/store/authStore.ts` persiste en `localStorage` con la clave:

- `medistock-auth`

Se persisten:

- `accessToken`
- `refreshToken`

No se persisten:

- `user`
- `rol`
- `status`

> Importante: en el código actual el `refreshToken` **sí** queda en `localStorage`, no en cookie `httpOnly`.

### 9.2 Flujo de bootstrap

`src/App.tsx` hace bootstrap de sesión así:

1. Lee `status`, `accessToken` y `loadProfile()` desde el store.
2. Si no hay token, pasa a `guest`.
3. Si hay token, valida con `/accounts/perfil/me/`.
4. Mientras valida, el router no se renderiza y se muestra spinner global.

### 9.3 Guards

#### `PrivateRoute`

- `idle` / `loading` → spinner
- `guest` → `/login`
- `authenticated` → `<Outlet />`

#### `RoleRoute`

- Si el rol no está permitido, redirige a la home correspondiente con `homeByRole()`.

### 9.4 Logout

Al cerrar sesión:

1. `queryClient.clear()`
2. `authStore.logout()`
3. Redirección a `/`

Además, el store invalida el refresh token en backend en modo fire-and-forget.

---

## 10. Caché y re-fetch

### 10.1 Estrategia por dato

| Dato | Estrategia actual | TTL |
|---|---|---:|
| Catálogo | React Query + `keepPreviousData` | 60s en `useCatalogo` |
| Categorías | React Query | 30 min |
| Regiones con comunas | React Query | 1 h activo, 1 día en caché |
| Carrito | Zustand persistido | Hasta limpieza manual |
| Sesión | Zustand persistido | Hasta logout o limpieza |
| Perfil del usuario | Memoria del store + revalidación | Sesión activa |

### 10.2 Configuración global de React Query

`src/lib/queryClient.ts`:

- `staleTime: 60_000`
- `retry: 1`

### 10.3 Riesgos y mitigación

- El catálogo puede quedar desfasado si cambia el stock.
- La mitigación real ocurre al crear el pedido: el backend debe volver a validar stock.

---

## 11. Accesibilidad y responsividad

### 11.1 Breakpoints observados

La app usa los breakpoints estándar de Tailwind:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### 11.2 Patrones responsive visibles

- `AppShell` cambia sidebar fijo en desktop por off-canvas en móvil.
- `Catalogo` alterna grid/list y usa sidebar de filtros en desktop.
- `Producto` muestra columna lateral solo en `lg`.
- `Carrito` apila layout en mobile y usa dos columnas en desktop.

### 11.3 Accesibilidad aplicada

- Labels asociados a inputs en `RegisterForm`.
- `aria-label` en botones de navegación y acciones relevantes.
- `aria-current="page"` en navegación activa.
- `role="alert"` en errores de formulario o mensajes críticos.
- Buttons reales para acciones, no solo íconos decorativos.

---

## 12. Pruebas del frontend

### 12.1 Estado actual

No se observó suite de tests configurada en `package.json`.

| Tipo de prueba | Herramienta | Estado |
|---|---|---|
| Unitarias | — | Pendiente |
| Componentes | — | Pendiente |
| Integración | — | Pendiente |
| E2E | — | Pendiente |

### 12.2 Scripts disponibles hoy

```bash
pnpm dev
pnpm build
pnpm lint
pnpm preview
```

### 12.3 Casos críticos que conviene cubrir a futuro

- Login exitoso y redirección por rol.
- Login fallido sin exponer errores técnicos.
- Persistencia del carrito entre páginas.
- Rechazo por stock insuficiente.
- Inicio/commit de pago Webpay.
- Guards de autenticación y autorización.
- Bloqueo de rutas internas para clientes.

---

## 13. Glosario y decisiones técnicas

### 13.1 Términos del dominio

| Término | Definición |
|---|---|
| B2C | Venta a cliente final |
| B2B | Venta a institución / clínica |
| FEFO | First Expired, First Out |
| Picking | Preparación de pedido en bodega |
| OT | Orden de Transporte |
| Stock neto | Stock real disponible para vender |
| Prioridad médica | Urgencia del pedido: `NORMAL`, `ALTA`, `CRITICA` |

### 13.2 Decisiones técnicas reales

| Decisión | Alternativa | Motivo |
|---|---|---|
| Zustand para estado global | Redux | Menos complejidad |
| Axios con interceptores | Fetch | Refresh automático y normalización centralizada |
| React Query | Fetch manual | Caché y re-fetch declarativos |
| Tailwind v4 | CSS puro por componente | Consistencia y rapidez |
| Estrategia de pagos | implementación única | Permite mocks por entorno (`VITE_USE_MOCKS`) |
| Guards por ruta | HOCs o validación en página | Separación clara de autenticación y autorización |

### 13.3 Deuda técnica conocida

| ID | Descripción | Impacto |
|---|---|---|
| DT-001 | Hay varias rutas declaradas sin archivo real | El router está incompleto |
| DT-002 | `CatalogItems` usa `<a href>` en vez de `Link` | Recarga completa al entrar a detalle |
| DT-003 | No existe suite de tests | Riesgo en regresión |
| DT-004 | El `refreshToken` se persiste en `localStorage` | Exposición a XSS si el entorno no está endurecido |
| DT-005 | Existen menús con rutas no implementadas | Navegación interna incompleta |

---

## 14. Changelog

| Versión | Fecha | Autor | Cambios |
|---|---|---|---|
| 1.1.0 | 2026-06-10 | Por definir | Actualización del árbol funcional y registro de nuevos componentes, assets y estrategias |

---

> **Nota para el equipo:** esta documentación debe actualizarse en la misma PR que modifique el comportamiento funcional del frontend. Si el router, los servicios o el store cambian, esta guía debe cambiar en paralelo.

