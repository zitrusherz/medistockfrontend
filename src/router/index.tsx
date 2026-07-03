// src/router/index.tsx
import { createBrowserRouter } from "react-router"
import { PrivateRoute } from "./PrivateRouter"
import { RoleRoute } from "./RoleRoute"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { AppShell } from "@/components/layout/AppShell"
import { Roles } from "@/types/roles"
import { S } from "./withSuspense"


import Login from "@/pages/public/Login"


import {
    Home, Catalogo, Categorias, Producto, CrearCuenta, NotFound,
    ClienteDashboard, Carrito, Checkout, Pago, PagoRetorno,
    MisPedidos, PedidoDetalle, MisPagos,
    EjecutivoDashboard, EjecutivoPedidos,
    LogisticaDashboard, LogisticaOrdenes, LogisticaPreparacion,
    LogisticaEnvio, LogisticaAlertas,
    AnalistaDashboard, AnalistaPagos,
    AdminInicio, AdminEstadisticas, AdminPedidos, AdminProductos,
    AdminTrabajadores, AdminClientes, AdminApiKeys,
} from "./lazyPages"

export { homeByRole } from "./homeByRole"

export const router = createBrowserRouter([

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


    { path: "/login",    element: <Login /> },
    { path: "/registro", element: S(<CrearCuenta />) },


    {
        element: <PrivateRoute />, // Guarda 1: autenticación
        children: [
            // Cliente
            {
                element: <RoleRoute roles={[Roles.CLIENTE]} />, // Guarda 2: rol
                children: [

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
                            { path: "/admin/pedidos",      element: S(<AdminPedidos />) },
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
