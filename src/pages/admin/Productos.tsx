

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
