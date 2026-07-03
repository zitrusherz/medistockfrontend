

import { Select } from '@/components/ui';
import type { EstadoPago, MetodoPago } from '@/types/models';
import type { TodosPagosFilters } from '../types';

/** Opciones de estado. value '' = "todos" (limpia el filtro). */
const ESTADOS: { value: EstadoPago | ''; label: string }[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'CONFIRMADO', label: 'Confirmado' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'INICIADO', label: 'Iniciado' },
    { value: 'AUTORIZADO', label: 'Autorizado' },
    { value: 'RECHAZADO', label: 'Rechazado' },
    { value: 'ANULADO', label: 'Anulado' },
    { value: 'REEMBOLSADO', label: 'Reembolsado' },
    { value: 'ERROR', label: 'Error' },
];

/** Opciones de método. value '' = "todos". */
const METODOS: { value: MetodoPago | ''; label: string }[] = [
    { value: '', label: 'Todos los métodos' },
    { value: 'WEBPAY', label: 'Webpay' },
    { value: 'MERCADOPAGO', label: 'MercadoPago' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' },
    { value: 'CREDITO_INSTITUCIONAL', label: 'Crédito institucional' },
];

interface Props {
    filtros: TodosPagosFilters;
    onChange: (f: TodosPagosFilters) => void;
}

export function PagosFilters({ filtros, onChange }: Props) {
    const setEstado = (v: string) =>
        onChange({
            ...filtros,
            estado_pago: v === '' ? undefined : (v as EstadoPago),
        });

    const setMetodo = (v: string) =>
        onChange({
            ...filtros,
            metodo_pago: v === '' ? undefined : (v as MetodoPago),
        });

    return (
        <div className="flex flex-wrap items-end gap-3">
            <Select
                label="Estado"
                fullWidth={false}
                options={ESTADOS}
                value={filtros.estado_pago ?? ''}
                onChange={(e) => setEstado(e.target.value)}
                className="min-w-44"
            />
            <Select
                label="Método"
                fullWidth={false}
                options={METODOS}
                value={filtros.metodo_pago ?? ''}
                onChange={(e) => setMetodo(e.target.value)}
                className="min-w-44"
            />
        </div>
    );
}
