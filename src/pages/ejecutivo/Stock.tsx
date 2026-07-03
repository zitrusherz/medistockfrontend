

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input, Select } from '@/components/ui';
import { StockTable } from '@/features/inventory/components/StockTable';
import { useSucursales } from '@/features/catalog/hooks/useSucursales';
import { useCatalogo } from '@/features/catalog/hooks/useCatalogo';

const TODAS = '';

export default function EjecutivoStock() {
    const { sucursales, isLoading: cargandoSucursales } = useSucursales();
    const [sucursal, setSucursal] = useState<string>(TODAS);
    const [search, setSearch] = useState('');

    const sucursalIdNum = sucursal === TODAS ? null : Number(sucursal);

    const { productos, isLoading } = useCatalogo({
        sucursal_id: sucursalIdNum ?? undefined,
        search,
    });

    const opciones = useMemo(
        () => [
            { value: TODAS, label: 'Todas las sucursales' },
            ...sucursales.map((s) => ({ value: String(s.id), label: s.nombre })),
        ],
        [sucursales],
    );

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Stock por bodega"
                description="Consulta la disponibilidad por sucursal antes de aprobar un pedido."
                breadcrumb={[
                    { label: 'Inicio', href: '/ejecutivo' },
                    { label: 'Stock' },
                ]}
            />

            <div className="mt-6 space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="sm:w-72">
                        <Select
                            label="Sucursal"
                            options={opciones}
                            value={sucursal}
                            disabled={cargandoSucursales}
                            onChange={(e) => setSucursal(e.target.value)}
                        />
                    </div>
                    <div className="sm:w-80">
                        <Input
                            label="Buscar"
                            placeholder="Nombre o código de producto…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <StockTable
                    productos={productos}
                    sucursalId={sucursalIdNum}
                    loading={isLoading}
                />
            </div>
        </PageWrapper>
    );
}
