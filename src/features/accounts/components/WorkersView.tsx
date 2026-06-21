// src/features/accounts/components/WorkersView.tsx
// T4.3 — Vista de Trabajadores: alta de cuentas internas + tabla del equipo con
// activar/desactivar por fila. Reutiliza el kit (Table/Avatar/Badge) igual que
// CustomersTable. Guard clave: el admin NO puede desactivar su propia cuenta
// (se compara por email contra el perfil logueado). Solo-admin: la ruta ya está
// protegida por RoleRoute (Proxy) en el router.

import { useState } from 'react';
import {
    Table,
    TableHead,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    Avatar,
    Badge,
    Input,
    Select,
    Alert,
} from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/utils/formatDate';
import { WorkerForm } from './WorkerForm';
import { useTrabajadores } from '../hooks/useTrabajadores';
import { WORKER_ROLE_OPTIONS, rolLabel, type WorkerRol } from '../roles';
import type { TrabajadorVM } from '../types/trabajador';

export function WorkersView() {
    const [search, setSearch] = useState('');
    const [rol, setRol] = useState<WorkerRol | ''>('');

    const { trabajadores, isLoading, isEmpty, isError, toggleActivo } =
        useTrabajadores({ search, rol });

    // Email del admin logueado: PerfilMe.datos.email existe en ambas ramas del
    // union (cliente/trabajador). Sirve para bloquear la auto-desactivación.
    const miEmail = useAuthStore((s) => s.user)?.datos.email?.toLowerCase() ?? null;

    const togglingId =
        toggleActivo.isPending ? toggleActivo.variables?.id : undefined;

    return (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,400px)_1fr]">
            {/* ── Columna izquierda: alta ──────────────────────────────────── */}
            <section aria-label="Crear trabajador">
                <h2 className="mb-4 text-lg font-semibold text-text">Nuevo trabajador</h2>
                <WorkerForm />
            </section>

            {/* ── Columna derecha: equipo ──────────────────────────────────── */}
            <section aria-label="Equipo" className="min-w-0">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <Input
                            label="Buscar"
                            type="search"
                            placeholder="Nombre, correo o RUT…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="sm:w-56">
                        <Select
                            label="Rol"
                            options={[
                                { value: '', label: 'Todos los roles' },
                                ...WORKER_ROLE_OPTIONS,
                            ]}
                            value={rol}
                            onChange={(e) => setRol(e.target.value as WorkerRol | '')}
                        />
                    </div>
                </div>

                {isError && (
                    <Alert variant="error" role="alert" aria-live="polite" className="mb-4">
                        No pudimos cargar el equipo. Recarga la página e inténtalo de nuevo.
                    </Alert>
                )}

                <Table loading={isLoading} stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableColumn>Trabajador</TableColumn>
                            <TableColumn>Rol</TableColumn>
                            <TableColumn>Ingreso</TableColumn>
                            <TableColumn>Estado</TableColumn>
                            <TableColumn className="text-right">Acciones</TableColumn>
                        </TableRow>
                    </TableHead>

                    <TableBody
                        isEmpty={isEmpty}
                        emptyText="No hay trabajadores para mostrar."
                    >
                        {trabajadores.map((t) => (
                            <WorkerRow
                                key={t.id}
                                trabajador={t}
                                esMiCuenta={
                                    miEmail !== null && t.email.toLowerCase() === miEmail
                                }
                                toggling={togglingId === t.id}
                                onToggle={() =>
                                    toggleActivo.mutate({ id: t.id, activo: !t.activo })
                                }
                            />
                        ))}
                    </TableBody>
                </Table>
            </section>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Fila de trabajador                                                        */
/* -------------------------------------------------------------------------- */

interface WorkerRowProps {
    trabajador: TrabajadorVM;
    /** true si la fila es la cuenta del propio admin logueado. */
    esMiCuenta: boolean;
    /** true mientras su mutación de toggle está en vuelo. */
    toggling: boolean;
    onToggle: () => void;
}

function WorkerRow({ trabajador: t, esMiCuenta, toggling, onToggle }: WorkerRowProps) {
    const accionLabel = t.activo ? 'Desactivar' : 'Activar';

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar name={t.nombre} size="sm" />
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-text">{t.nombre}</p>
                        <p className="truncate text-[13px] text-text-muted">{t.email || '—'}</p>
                    </div>
                </div>
            </TableCell>

            <TableCell>
                {t.rol ? (
                    <Badge>{rolLabel(t.rol)}</Badge>
                ) : (
                    <span className="text-text-muted">Sin rol</span>
                )}
            </TableCell>

            <TableCell className="text-text-muted">
                {formatDate(t.fechaIngreso) || '—'}
            </TableCell>

            <TableCell>
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold ${
                        t.activo
                            ? 'bg-success-soft text-success'
                            : 'bg-grape-100 text-grape-500'
                    }`}
                >
                    {t.activo ? 'Activo' : 'Inactivo'}
                </span>
            </TableCell>

            <TableCell className="text-right">
                <button
                    type="button"
                    onClick={onToggle}
                    disabled={esMiCuenta || toggling}
                    title={
                        esMiCuenta
                            ? 'No puedes cambiar el estado de tu propia cuenta'
                            : undefined
                    }
                    className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                        t.activo
                            ? 'text-danger hover:bg-danger-soft'
                            : 'text-success hover:bg-success-soft'
                    }`}
                >
                    {toggling ? '…' : accionLabel}
                </button>
            </TableCell>
        </TableRow>
    );
}
