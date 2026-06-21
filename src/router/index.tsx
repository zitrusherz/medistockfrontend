import { lazy } from "react"
import { createBrowserRouter } from "react-router"
import { PrivateRoute } from "./PrivateRouter"
import { RoleRoute } from "./RoleRoute"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Roles } from "@/types/roles"
import { S } from "./withSuspense"

export { homeByRole } from "./homeByRole"

// ─── Lazy-load por zona: cada rol = su propio chunk en el build ───────────────
const Home        = lazy(() => import("@/pages/public/Home"))
const Login       = lazy(() => import("@/pages/public/Login"))
const Catalogo    = lazy(() => import("@/pages/public/Catalogo"))
const Producto    = lazy(() => import("@/pages/public/Producto"))
const CrearCuenta = lazy(() => import("@/pages/public/CrearCuenta"))
const NotFound    = lazy(() => import("@/pages/public/NotFound"))
const ClienteDashboard = lazy(() => import("@/pages/cliente/Dashboard"))
const Carrito          = lazy(() => import("@/pages/cliente/Carrito"))
const Checkout         = lazy(() => import("@/pages/cliente/Checkout"))
const Pago             = lazy(() => import("@/pages/cliente/Pago"))
const PagoRetorno      = lazy(() => import("@/pages/cliente/PagoRetorno"))
const MisPedidos       = lazy(() => import("@/pages/cliente/MisPedidos"))
const PedidoDetalle    = lazy(() => import("@/pages/cliente/PedidoDetalle"))
const MisPagos         = lazy(() => import("@/pages/cliente/MisPagos"))
const EjecutivoDashboard = lazy(() => import("@/pages/ejecutivo/Dashboard"))
const EjecutivoPedidos   = lazy(() => import("@/pages/ejecutivo/Pedidos"))
const LogisticaDashboard    = lazy(() => import("@/pages/logistica/Dashboard"))
const LogisticaOrdenes      = lazy(() => import("@/pages/logistica/Ordenes"))
const LogisticaPreparacion  = lazy(() => import("@/pages/logistica/Preparacion"))
const LogisticaEnvio        = lazy(() => import("@/pages/logistica/Envio"))
const LogisticaAlertas      = lazy(() => import("@/pages/logistica/Alertas"))
const AnalistaDashboard = lazy(() => import("@/pages/analista/Dashboard"))
const AnalistaPagos     = lazy(() => import("@/pages/analista/Pagos"))
const AdminInicio       = lazy(() => import("@/pages/admin/Inicio"))
const AdminEstadisticas = lazy(() => import("@/pages/admin/Estadisticas"))
const AdminProductos    = lazy(() => import("@/pages/admin/Productos"))
const AdminTrabajadores = lazy(() => import("@/pages/admin/Trabajadores"))
const AdminClientes     = lazy(() => import("@/pages/admin/Clientes"))
const AdminApiKeys      = lazy(() => import("@/pages/admin/ApiKeys"))

export const router = createBrowserRouter([
    // ── Tienda pública (con header de tienda) ─────────────────────────────────
    // PublicLayout aporta el chrome (TopBar/Header/sub-barra) + <Outlet/>.
    // Va eager (no lazy): el header debe aparecer al instante, sin spinner.
    {
        element: <PublicLayout />,
        children: [
            { path: "/",                 element: S(<Home />) },
            { path: "/catalogo",         element: S(<Catalogo />) },
            { path: "/producto/:codigo", element: S(<Producto />) },
        ],
    },

    // ── Auth (sin el header de tienda; usan su propio AuthLayout) ─────────────
    { path: "/login",    element: S(<Login />) },
    { path: "/registro", element: S(<CrearCuenta />) },

    // ── Privadas (requieren sesión) ──────────────────────────────────────────
    {
        element: <PrivateRoute />, // Guarda 1: autenticación
        children: [
            // Cliente
            {
                element: <RoleRoute roles={[Roles.CLIENTE]} />, // Guarda 2: rol
                children: [
                    { path: "/cliente",             element: S(<ClienteDashboard />) },
                    { path: "/cliente/carrito",     element: S(<Carrito />) },
                    { path: "/cliente/checkout",    element: S(<Checkout />) },
                    // T2.9 — El backend de Django redirige aquí tras procesar el POST de Webpay
                    { path: "/resultado-pago",   element: S(<PagoRetorno />) },
                    { path: "/cliente/pago/:pedidoId", element: S(<Pago />) },
                    { path: "/cliente/pedidos",     element: S(<MisPedidos />) },
                    { path: "/cliente/pedidos/:id", element: S(<PedidoDetalle />) },
                    { path: "/cliente/pagos",       element: S(<MisPagos />) },
                ],
            },
            // Ejecutivo de Cuentas
            {
                element: <RoleRoute roles={[Roles.EJECUTIVO]} />,
                children: [
                    { path: "/ejecutivo",         element: S(<EjecutivoDashboard />) },
                    { path: "/ejecutivo/pedidos", element: S(<EjecutivoPedidos />) },
                ],
            },
            // Operador Logístico
            {
                element: <RoleRoute roles={[Roles.OPERADOR_LOGISTICO]} />,
                children: [
                    { path: "/logistica",         element: S(<LogisticaDashboard />) },
                    { path: "/logistica/ordenes", element: S(<LogisticaOrdenes />) },
                    // T3.5 — rutas contextuales por pedido (se alcanzan desde Órdenes).
                    { path: "/logistica/preparacion/:pedidoId", element: S(<LogisticaPreparacion />) },
                    { path: "/logistica/envio/:pedidoId",       element: S(<LogisticaEnvio />) },
                    { path: "/logistica/alertas", element: S(<LogisticaAlertas />) },
                ],
            },
            // Analista de Finanzas
            {
                element: <RoleRoute roles={[Roles.ANALISTA]} />,
                children: [
                    { path: "/analista",       element: S(<AnalistaDashboard />) },
                    { path: "/analista/pagos", element: S(<AnalistaPagos />) },
                ],
            },
            // Administrador
            {
                element: <RoleRoute roles={[Roles.ADMINISTRADOR]} />,
                children: [
                    // T4.1 — "Inicio" (operativo) reemplaza al antiguo Dashboard; se
                    // añade "Estadísticas" (analítica). Ambas rutas ya declaradas en navItems.
                    { path: "/admin",              element: S(<AdminInicio />) },
                    { path: "/admin/estadisticas", element: S(<AdminEstadisticas />) },
                    { path: "/admin/productos",    element: S(<AdminProductos />) },
                    { path: "/admin/trabajadores", element: S(<AdminTrabajadores />) },
                    { path: "/admin/clientes",     element: S(<AdminClientes />) },
                    { path: "/admin/api-keys",     element: S(<AdminApiKeys />) },
                ],
            },
        ],
    },

    // ── Catch-all 404 ─────────────────────────────────────────────────────────
    { path: "*", element: S(<NotFound />) },
])