// src/router/lazyPages.ts
import { lazy } from "react"

// ─── Lazy-load por zona: cada rol = su propio chunk en el build ───────────────
// Extraídas de index.tsx para que el router solo exporte config (no componentes)
// y así satisfacer react-refresh/only-export-components.

// Públicas
export const Home        = lazy(() => import("@/pages/public/Home"))
export const Catalogo    = lazy(() => import("@/pages/public/Catalogo"))
export const Producto    = lazy(() => import("@/pages/public/Producto"))
export const CrearCuenta = lazy(() => import("@/pages/public/CrearCuenta"))
export const NotFound    = lazy(() => import("@/pages/public/NotFound"))

// Cliente
export const ClienteDashboard = lazy(() => import("@/pages/cliente/Dashboard"))
export const Carrito          = lazy(() => import("@/pages/cliente/Carrito"))
export const Checkout         = lazy(() => import("@/pages/cliente/Checkout"))
export const Pago             = lazy(() => import("@/pages/cliente/Pago"))
export const PagoRetorno      = lazy(() => import("@/pages/cliente/PagoRetorno"))
export const MisPedidos       = lazy(() => import("@/pages/cliente/MisPedidos"))
export const PedidoDetalle    = lazy(() => import("@/pages/cliente/PedidoDetalle"))
export const MisPagos         = lazy(() => import("@/pages/cliente/MisPagos"))

// Ejecutivo
export const EjecutivoDashboard = lazy(() => import("@/pages/ejecutivo/Dashboard"))
export const EjecutivoPedidos   = lazy(() => import("@/pages/ejecutivo/Pedidos"))

// Logística
export const LogisticaDashboard    = lazy(() => import("@/pages/logistica/Dashboard"))
export const LogisticaOrdenes      = lazy(() => import("@/pages/logistica/Ordenes"))
export const LogisticaPreparacion  = lazy(() => import("@/pages/logistica/Preparacion"))
export const LogisticaEnvio        = lazy(() => import("@/pages/logistica/Envio"))
export const LogisticaAlertas      = lazy(() => import("@/pages/logistica/Alertas"))

// Analista
export const AnalistaDashboard = lazy(() => import("@/pages/analista/Dashboard"))
export const AnalistaPagos     = lazy(() => import("@/pages/analista/Pagos"))

// Admin
export const AdminInicio       = lazy(() => import("@/pages/admin/Inicio"))
export const AdminEstadisticas = lazy(() => import("@/pages/admin/Estadisticas"))
export const AdminProductos    = lazy(() => import("@/pages/admin/Productos"))
export const AdminTrabajadores = lazy(() => import("@/pages/admin/Trabajadores"))
export const AdminClientes     = lazy(() => import("@/pages/admin/Clientes"))
export const AdminApiKeys      = lazy(() => import("@/pages/admin/ApiKeys"))
