// src/pages/admin/Productos.tsx
// T4.2 — Página Admin · Productos / inventario. Contenedor: PageWrapper +
// PageHeader + ProductsSection (toggle listado/alta). Protegida por RoleRoute
// (Proxy) en el router para el rol Administrador. Ruta: /admin/productos.
// Export default: el router la carga con lazy().

import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductsSection } from '@/features/inventory/components/ProductsSection';

export default function AdminProductos() {
    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Productos"
                description="Consulta el catálogo e ingresa nuevos productos al inventario."
                breadcrumb={[{ label: 'Inicio' }, { label: 'Productos' }]}
            />

            <div className="mt-6">
                <ProductsSection />
            </div>
        </PageWrapper>
    );
}
