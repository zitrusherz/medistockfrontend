// src/features/integrations/components/ApiClientsTable.tsx
// T4.5 — Tabla de API Keys (espejo de WorkersView): listado por institución con
// estado y acciones por fila (rotar / revocar / reactivar). La key NUNCA se
// muestra aquí (la API no la expone en el listado): solo al crear o al rotar, vía
// el modal "copia ahora". Solo-admin: la ruta ya está protegida por RoleRoute
// (Proxy) en el router. La rotación devuelve `nueva_api_key` → se sube por
// onRotated para que el contenedor abra el reveal.

import { useState } from 'react';
import {
    Table,
    TableHead,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    Input,
    Alert,
} from '@/components/ui';
import { formatDate } from '@/utils/formatDate';
import { useApiClients } from '../hooks/useApiClients';
import { ConfirmRevocarModal } from './ConfirmRevocarModal';
import type { ApiClientVM, EstadoApiKey } from '../types/apiClient';
import type { ActualizarApiClientResponse } from '../types';

interface ApiClientsTableProps {
    /** Tras rotar con éxito: trae `nueva_api_key` para el modal reveal. */
    onRotated: (res: ActualizarApiClientResponse) => void;
}

const ESTADO_PILL: Record<EstadoApiKey, string> = {
    ACTIVA: 'bg-success-soft text-success',
    VENCIDA: 'bg-warning-soft text-warning',
    REVOCADA: 'bg-grape-100 text-grape-500',
};

const ESTADO_LABEL: Record<EstadoApiKey, string> = {
    ACTIVA: 'Activa',
    VENCIDA: 'Vencida',
    REVOCADA: 'Revocada',
};

export function ApiClientsTable({ onRotated }: ApiClientsTableProps) {
    const [search, setSearch] = useState('');
    const [revocarTarget, setRevocarTarget] = useState<ApiClientVM | null>(null);

    const { apiClients, isLoading, isEmpty, isError, rotar, revocar, reactivar } =
        useApiClients(search);

    const rotandoId = rotar.isPending ? rotar.variables : undefined;
    const cambiandoId = revocar.isPending
        ? revocar.variables
        : reactivar.isPending
          ? reactivar.variables
          : undefined;

    function confirmarRevocar() {
        if (!revocarTarget) return;
        revocar.mutate(revocarTarget.id, {
            onSettled: () => setRevocarTarget(null),
        });
    }

    return (
        <section aria-label="API Keys emitidas" className="min-w-0">
            <div className="mb-4 sm:max-w-sm">
                <Input
                    label="Buscar"
                    type="search"
                    placeholder="Institución o nombre…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {isError && (
                <Alert variant="error" role="alert" aria-live="polite" className="mb-4">
                    No pudimos cargar las API Keys. Recarga la página e inténtalo de nuevo.
                </Alert>
            )}

            <Table loading={isLoading} stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableColumn>Institución</TableColumn>
                        <TableColumn>Integración</TableColumn>
                        <TableColumn>Límite diario</TableColumn>
                        <TableColumn>Creada</TableColumn>
                        <TableColumn>Expira</TableColumn>
                        <TableColumn>Estado</TableColumn>
                        <TableColumn className="text-right">Acciones</TableColumn>
                    </TableRow>
                </TableHead>

                <TableBody isEmpty={isEmpty} emptyText="Aún no hay API Keys emitidas.">
                    {apiClients.map((c) => (
                        <ApiClientRow
                            key={c.id}
                            cliente={c}
                            rotando={rotandoId === c.id}
                            cambiando={cambiandoId === c.id}
                            onRotar={() => rotar.mutate(c.id, { onSuccess: onRotated })}
                            onRevocar={() => setRevocarTarget(c)}
                            onReactivar={() => reactivar.mutate(c.id)}
                        />
                    ))}
                </TableBody>
            </Table>

            <ConfirmRevocarModal
                target={revocarTarget}
                loading={revocar.isPending}
                onCancel={() => setRevocarTarget(null)}
                onConfirm={confirmarRevocar}
            />
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/*  Fila                                                                      */
/* -------------------------------------------------------------------------- */

interface ApiClientRowProps {
    cliente: ApiClientVM;
    rotando: boolean;
    cambiando: boolean;
    onRotar: () => void;
    onRevocar: () => void;
    onReactivar: () => void;
}

function ApiClientRow({
    cliente: c,
    rotando,
    cambiando,
    onRotar,
    onRevocar,
    onReactivar,
}: ApiClientRowProps) {
    const ocupado = rotando || cambiando;

    return (
        <TableRow>
            <TableCell>
                <p className="font-semibold text-text">{c.institucion}</p>
                <p className="text-[12px] text-text-muted">
                    <span aria-hidden="true">••••••••</span>{' '}
                    <span className="italic">key oculta</span>
                </p>
            </TableCell>

            <TableCell className="text-text-muted">{c.nombre || '—'}</TableCell>

            <TableCell className="text-text-muted">
                {c.limiteRequestsDiario.toLocaleString('es-CL')} / día
            </TableCell>

            <TableCell className="text-text-muted">
                {formatDate(c.fechaCreacion) || '—'}
            </TableCell>

            <TableCell className="text-text-muted">
                {c.fechaExpiracion ? formatDate(c.fechaExpiracion) : 'Sin vencimiento'}
            </TableCell>

            <TableCell>
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold ${ESTADO_PILL[c.estado]}`}
                >
                    {ESTADO_LABEL[c.estado]}
                </span>
            </TableCell>

            <TableCell className="text-right">
                <div className="inline-flex items-center gap-1">
                    {c.activo ? (
                        <>
                            <button
                                type="button"
                                onClick={onRotar}
                                disabled={ocupado}
                                title="Genera una key nueva e invalida la actual"
                                className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-azure-600 transition hover:bg-info-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {rotando ? '…' : 'Rotar'}
                            </button>
                            <button
                                type="button"
                                onClick={onRevocar}
                                disabled={ocupado}
                                className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-danger transition hover:bg-danger-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Revocar
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={onReactivar}
                            disabled={ocupado}
                            className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-success transition hover:bg-success-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {cambiando ? '…' : 'Reactivar'}
                        </button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}
