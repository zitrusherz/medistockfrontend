

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input, Button } from '@/components/ui';
import { CustomersTable } from '@/features/accounts/components/CustomersTable';
import { CustomerDetail } from '@/features/accounts/components/CustomerDetail';
import { useClientes } from '@/features/accounts/hooks/useClientes';
import type { Cliente } from '@/features/accounts/types/cliente';

export default function EjecutivoClientes() {
    const [search, setSearch] = useState('');
    const { clientes, isLoading } = useClientes(search);
    const [detalle, setDetalle] = useState<Cliente | null>(null);

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Clientes"
                description="Directorio de instituciones y pacientes a los que asesoras."
                breadcrumb={[
                    { label: 'Inicio', href: '/ejecutivo' },
                    { label: 'Clientes' },
                ]}
            />

            <div className="mt-6 space-y-5">
                <div className="sm:w-80">
                    <Input
                        label="Buscar"
                        placeholder="Nombre, RUT o email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <CustomersTable
                    clientes={clientes}
                    loading={isLoading}
                    renderAcciones={(c) => (
                        <Button size="xs" variant="ghost" onClick={() => setDetalle(c)}>
                            Ver
                        </Button>
                    )}
                />
            </div>

            <CustomerDetail
                cliente={detalle ?? undefined}
                open={detalle !== null}
                onClose={() => setDetalle(null)}
            />
        </PageWrapper>
    );
}
