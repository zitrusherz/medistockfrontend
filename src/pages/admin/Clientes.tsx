

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Pagination } from '@/components/ui';
import { CustomersTable } from '@/features/accounts/components/CustomersTable';
import { CustomerDetail } from '@/features/accounts/components/CustomerDetail';
import { useClientes } from '@/features/accounts/hooks/useClientes';
import { useTopCompradores } from '@/features/accounts/hooks/useTopCompradores';
import type { Cliente } from '@/features/accounts/types/cliente';
import type { TipoCliente } from '@/types/models';

const PAGE_SIZE = 10;

const inputCls =
    'rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function AdminClientes() {
    const [search, setSearch] = useState('');
    const [tipo, setTipo] = useState<'' | TipoCliente>('');
    const [page, setPage] = useState(1);
    const [seleccionado, setSeleccionado] = useState<Cliente | undefined>();
    const [abierto, setAbierto] = useState(false);

    const { clientes, isLoading, isError } = useClientes(search);


    const { ranking } = useTopCompradores();
    const comprasPorCliente = useMemo(() => {
        const map = new Map<number, { pedidos: number; total: number }>();
        for (const r of ranking) {
            map.set(r.clienteId, { pedidos: r.pedidos, total: r.total });
        }
        return map;
    }, [ranking]);

    // Filtro de tipo en cliente (el de texto ya lo aplica useClientes).
    const filtrados = useMemo(
        () => (tipo ? clientes.filter((c) => c.tipo === tipo) : clientes),
        [clientes, tipo],
    );

    const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
    const pageSafe = Math.min(page, totalPages);
    const visibles = filtrados.slice(
        (pageSafe - 1) * PAGE_SIZE,
        pageSafe * PAGE_SIZE,
    );

    const verCliente = (c: Cliente) => {
        setSeleccionado(c);
        setAbierto(true);
    };

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Clientes"
                description="Directorio de clientes institucionales y particulares. Abre una ficha para ver sus pedidos y pagos."
                breadcrumb={[{ label: 'Inicio' }, { label: 'Clientes' }]}
            />

            <div className="mt-6 flex flex-col gap-4">
                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Buscar por nombre, RUT o email…"
                        aria-label="Buscar clientes"
                        className={`${inputCls} w-full max-w-xs`}
                    />
                    <select
                        value={tipo}
                        onChange={(e) => {
                            setTipo(e.target.value as '' | TipoCliente);
                            setPage(1);
                        }}
                        aria-label="Filtrar por tipo de cliente"
                        className={inputCls}
                    >
                        <option value="">Todos los tipos</option>
                        <option value="INSTITUCIONAL">Institución</option>
                        <option value="PARTICULAR">Particular</option>
                    </select>
                </div>

                {/* Tabla / errores */}
                {isError ? (
                    <div
                        role="alert"
                        className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
                    >
                        No se pudieron cargar los clientes. Reintenta más tarde.
                    </div>
                ) : (
                    <CustomersTable
                        clientes={visibles}
                        loading={isLoading}
                        emptyText="No hay clientes que coincidan con el filtro."
                        showComuna
                        comprasPorCliente={comprasPorCliente}
                        renderAcciones={(c) => (
                            <Button variant="secondary" onClick={() => verCliente(c)}>
                                Ver
                            </Button>
                        )}
                    />
                )}

                {/* Paginación (solo si hay más de una página) */}
                {!isLoading && !isError && filtrados.length > PAGE_SIZE && (
                    <Pagination
                        page={pageSafe}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        pageSize={PAGE_SIZE}
                        totalItems={filtrados.length}
                        showInfo
                    />
                )}
            </div>

            {/* Ficha de detalle (Admin → con tab Pagos) */}
            <CustomerDetail
                cliente={seleccionado}
                open={abierto}
                onClose={() => setAbierto(false)}
                showPagos
            />
        </PageWrapper>
    );
}