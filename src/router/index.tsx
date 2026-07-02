// src/router/index.tsx
import { createBrowserRouter } from "react-router"
import { PrivateRoute } from "./PrivateRouter"
import { RoleRoute } from "./RoleRoute"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { AppShell } from "@/components/layout/AppShell"
import { Roles } from "@/types/roles"
import { S } from "./withSuspense"

// Login EAGER (no lazy): es el destino de redirección más frecuente para
// invitados (mini-carrito → /login). Sin chunk lazy = sin spinner de carga.
import Login from "@/pages/public/Login"

// Páginas lazy extraídas a su propio módulo: así este archivo de config solo
// exporta no-componentes (router, homeByRole) y no rompe react-refresh.
import {
    Home, Catalogo, Categorias, Producto, CrearCuenta, NotFound,
    ClienteDashboard, Carrito, Checkout, Pago, PagoRetorno,
    MisPedidos, PedidoDetalle, MisPagos,
    EjecutivoDashboard, EjecutivoPedidos,
    LogisticaDashboard, LogisticaOrdenes, LogisticaPreparacion,
    LogisticaEnvio, LogisticaAlertas,
    AnalistaDashboard, AnalistaPagos,
    AdminInicio, AdminEstadisticas, AdminProductos,
    AdminTrabajadores, AdminClientes, AdminApiKeys,
} from "./lazyPages"

export { homeByRole } from "./homeByRole"

export const router = createBrowserRouter([
    // ── Tienda pública (con header de tienda) ─────────────────────────────────
    // FIX Bug 1: se registran /categorias y /categorias/:id (el navbar y el
    // MainMenu ya apuntaban aquí, pero la ruta no existía → 404).
    // FIX Bug 2: el catch-all 404 ahora vive DENTRO de PublicLayout para que la
    // pantalla de "no encontrado" conserve el header/navbar de la tienda.
    {
        element: <PublicLayout />,
        children: [
            { path: "/",                 element: S(<Home />) },
            { path: "/catalogo",         element: S(<Catalogo />) },
            { path: "/categorias",       element: S(<Categorias />) },
            { path: "/categorias/:id",   element: S(<Categorias />) },
            { path: "/producto/:codigo", element: S(<Producto />) },

            // ── Catch-all 404 (con header de tienda) ──────────────────────────
            { path: "*", element: S(<NotFound />) },
        ],
    },

    // ── Auth (sin el header de tienda; usan su propio AuthLayout) ─────────────
    // /login eager (sin S): redirección instantánea para invitados.
    { path: "/login",    element: <Login /> },
    { path: "/registro", element: S(<CrearCuenta />) },

    // ── Privadas (requieren sesión) ──────────────────────────────────────────
    // FIX Bug 2: cada grupo de rol se envuelve en <AppShell/> (chrome interno:
    // navbar + RoleSidebar + logout). Antes las páginas se montaban "peladas",
    // por eso el dashboard aparecía sin navbar y sin forma de navegar/volver.
    {
        element: <PrivateRoute />, // Guarda 1: autenticación
        children: [
            // Cliente
            {
                element: <RoleRoute roles={[Roles.CLIENTE]} />, // Guarda 2: rol
                children: [
                    // CAMBIO 2: el carrito y el checkout usan el MISMO header de la
                    // tienda pública (PublicLayout) en lugar del chrome interno
                    // (AppShell). Así "Ver carrito" mantiene el navbar de la tienda.
                    // Siguen protegidos por PrivateRoute + RoleRoute (solo CLIENTE).
                    {
                        element: <PublicLayout />,
                        children: [
                            { path: "/cliente/carrito",  element: S(<Carrito />) },
                            { path: "/cliente/checkout", element: S(<Checkout />) },
                        ],
                    },
                    // El resto del panel del cliente conserva el chrome interno.
                    {
                        element: <AppShell />, // Guarda 3: chrome interno
                        children: [
                            { path: "/cliente",             element: S(<ClienteDashboard />) },
                            // T2.9 — El backend de Django redirige aquí tras procesar el POST de Webpay
                            { path: "/resultado-pago",      element: S(<PagoRetorno />) },
                            { path: "/cliente/pago/:pedidoId", element: S(<Pago />) },
                            { path: "/cliente/pedidos",     element: S(<MisPedidos />) },
                            { path: "/cliente/pedidos/:id", element: S(<PedidoDetalle />) },
                            { path: "/cliente/pagos",       element: S(<MisPagos />) },
                        ],
                    },
                ],
            },
            // Ejecutivo de Cuentas
            {
                element: <RoleRoute roles={[Roles.EJECUTIVO]} />,
                children: [
                    {
                        element: <AppShell />,
                        children: [
                            { path: "/ejecutivo",         element: S(<EjecutivoDashboard />) },
                            { path: "/ejecutivo/pedidos", element: S(<EjecutivoPedidos />) },
                        ],
                    },
                ],
            },
            // Operador Logístico
            {
                element: <RoleRoute roles={[Roles.OPERADOR_LOGISTICO]} />,
                children: [
                    {
                        element: <AppShell />,
                        children: [
                            { path: "/logistica",         element: S(<LogisticaDashboard />) },
                            { path: "/logistica/ordenes", element: S(<LogisticaOrdenes />) },
                            // T3.5 — rutas contextuales por pedido (se alcanzan desde Órdenes).
                            { path: "/logistica/preparacion/:pedidoId", element: S(<LogisticaPreparacion />) },
                            { path: "/logistica/envio/:pedidoId",       element: S(<LogisticaEnvio />) },
                            { path: "/logistica/alertas", element: S(<LogisticaAlertas />) },
                        ],
                    },
                ],
            },
            // Analista de Finanzas
            {
                element: <RoleRoute roles={[Roles.ANALISTA]} />,
                children: [
                    {
                        element: <AppShell />,
                        children: [
                            { path: "/analista",       element: S(<AnalistaDashboard />) },
                            { path: "/analista/pagos", element: S(<AnalistaPagos />) },
                        ],
                    },
                ],
            },
            // Administrador
            {
                element: <RoleRoute roles={[Roles.ADMINISTRADOR]} />,
                children: [
                    {
                        element: <AppShell />,
                        children: [
                            // T4.1 — "Inicio" (operativo) reemplaza al antiguo Dashboard.
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
        ],
    },
])
