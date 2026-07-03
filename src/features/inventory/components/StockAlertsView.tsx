

import { useMemo, useState } from 'react';
import {
    Badge,
    Select,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHead,
    TableRow,
    RangeSlider
} from '@/components/ui';
import { useAlertasStock } from '../hooks/useAlertasStock';
import { AlertShell, FilterSection } from './AlertShell';
import { BranchTag } from './BranchTag';
import { RadioFilter } from './RadioFilter';
import type { AlertaStock } from '../types/alerts';

type EstadoFiltro = 'criticos' | 'agotados' | 'todos';
type OrdenStock = 'faltanteDesc' | 'stockAsc' | 'stockDesc' | 'sucursal' | 'nombre';

const ordenadores: Record<OrdenStock, (a: AlertaStock, b: AlertaStock) => number> = {
    faltanteDesc: (a, b) => b.faltante - a.faltante,
    stockAsc: (a, b) => a.stock - b.stock,
    stockDesc: (a, b) => b.stock - a.stock,
    sucursal: (a, b) => a.sucursalNombre.localeCompare(b.sucursalNombre),
    nombre: (a, b) => a.productoNombre.localeCompare(b.productoNombre),
};

/** Pill de stock: agotado (danger) · crítico (warning) · ok (success). */
function StockBadge({ a }: { a: AlertaStock }) {
    if (a.agotado) return <Badge variant="danger">Agotado</Badge>;
    if (a.critico) return <Badge variant="warning">{a.stock} u</Badge>;
    return <Badge variant="success">{a.stock} u</Badge>;
}

export function StockAlertsView() {
    const { alertas, isLoading } = useAlertasStock();

    const sucursales = useMemo(
        () => ['Todas', ...Array.from(new Set(alertas.map((a) => a.sucursalNombre))).sort()],
        [alertas],
    );
    const maxFaltante = useMemo(() => Math.max(1, ...alertas.map((a) => a.faltante)), [alertas]);

    const [sucursal, setSucursal] = useState('Todas');
    const [estado, setEstado] = useState<EstadoFiltro>('criticos');

    const [rango, setRango] = useState<[number, number] | null>(null);
    const [orden, setOrden] = useState<OrdenStock>('faltanteDesc');

    const limpiar = () => {
        setSucursal('Todas');
        setEstado('criticos');
        setRango(null);
        setOrden('faltanteDesc');
    };

    const conteos = useMemo(
        () => ({
            todos: alertas.length,
            criticos: alertas.filter((a) => a.critico).length,
            agotados: alertas.filter((a) => a.agotado).length,
        }),
        [alertas],
    );

    const filas = useMemo(() => {
        const lo = rango ? rango[0] : 0;
        const hi = rango ? rango[1] : maxFaltante;
        const out = alertas.filter((a) => {
            if (sucursal !== 'Todas' && a.sucursalNombre !== sucursal) return false;
            if (estado === 'criticos' && !a.critico) return false;
            if (estado === 'agotados' && !a.agotado) return false;
            if (a.faltante < lo || a.faltante > hi) return false;
            return true;
        });
        return [...out].sort(ordenadores[orden]);
    }, [alertas, sucursal, estado, rango, maxFaltante, orden]);

    const filtros = (
        <>
            <FilterSection title="Sucursal">
                <RadioFilter
                    name="suc-stock"
                    value={sucursal}
                    onChange={setSucursal}
                    options={sucursales.map((s) => ({ value: s, label: s }))}
                />
            </FilterSection>

            <FilterSection title="Estado">
                <RadioFilter<EstadoFiltro>
                    name="estado-stock"
                    value={estado}
                    onChange={setEstado}
                    options={[
                        {
                            value: 'criticos',
                            label: (
                                <span>
                                    Críticos <span className="text-text-muted">({conteos.criticos})</span>
                                </span>
                            ),
                        },
                        {
                            value: 'agotados',
                            label: (
                                <span>
                                    Agotados <span className="text-text-muted">({conteos.agotados})</span>
                                </span>
                            ),
                        },
                        {
                            value: 'todos',
                            label: (
                                <span>
                                    Todos <span className="text-text-muted">({conteos.todos})</span>
                                </span>
                            ),
                        },
                    ]}
                />
            </FilterSection>

            <FilterSection title="Faltante para el mínimo">
                <RangeSlider
                    min={0}
                    max={maxFaltante}
                    value={rango ?? [0, maxFaltante]}
                    onChange={setRango}
                    format={(v) => `${v} u`}
                />
                <p className="mt-2 text-[11px] text-text-muted">
                    Filtra por cuántas unidades faltan para alcanzar el stock mínimo.
                </p>
            </FilterSection>
        </>
    );

    const toolbar = (
        <div className="flex items-center gap-2">
            <Badge variant="default" size="lg">
                {filas.length} ítems
            </Badge>
            <Select
                aria-label="Ordenar"
                fullWidth={false}
                value={orden}
                onChange={(e) => setOrden(e.target.value as OrdenStock)}
                options={[
                    { value: 'faltanteDesc', label: 'Mayor faltante' },
                    { value: 'stockAsc', label: 'Menor stock' },
                    { value: 'stockDesc', label: 'Mayor stock' },
                    { value: 'sucursal', label: 'Sucursal' },
                    { value: 'nombre', label: 'Nombre' },
                ]}
            />
        </div>
    );

    return (
        <AlertShell
            title="Productos bajo el mínimo"
            subtitle="Stock por sucursal frente a su umbral crítico"
            onClear={limpiar}
            filtros={filtros}
            toolbar={toolbar}
        >
            <Table loading={isLoading} stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableColumn>Producto</TableColumn>
                        <TableColumn>Sucursal</TableColumn>
                        <TableColumn className="text-center">Stock</TableColumn>
                        <TableColumn className="text-center">Mínimo</TableColumn>
                        <TableColumn className="text-center">Faltante</TableColumn>
                    </TableRow>
                </TableHead>

                <TableBody
                    isEmpty={!isLoading && filas.length === 0}
                    emptyText="Ningún producto coincide con los filtros."
                >
                    {filas.map((a) => (
                        <TableRow
                            key={a.id}
                            className={a.agotado ? 'bg-danger-soft' : a.critico ? 'bg-warning-soft' : undefined}
                        >
                            <TableCell>
                                <span className="font-medium text-text">{a.productoNombre}</span>
                                <span className="ml-2 font-mono text-xs text-text-muted">{a.productoSku}</span>
                                <span className="mt-0.5 block font-mono text-[11px] text-text-muted">
                                    Lote {a.loteCodigo}
                                </span>
                            </TableCell>
                            <TableCell>
                                <BranchTag branch={a.sucursalNombre} />
                            </TableCell>
                            <TableCell className="text-center">
                                <StockBadge a={a} />
                            </TableCell>
                            <TableCell className="text-center text-text-muted">{a.minimo}</TableCell>
                            <TableCell className="text-center font-bold text-primary">{a.faltante} u</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </AlertShell>
    );
}
