

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
import { formatDate } from '@/utils/formatDate';
import { useAlertasVencimiento } from '../hooks/useAlertasVencimiento';
import { AlertShell, FilterSection } from './AlertShell';
import type { AlertaVencimiento } from '../types/alerts';

type OrdenVenc = 'diasAsc' | 'diasDesc' | 'lote' | 'nombre';

const ordenadores: Record<OrdenVenc, (a: AlertaVencimiento, b: AlertaVencimiento) => number> = {
    diasAsc: (a, b) => a.diasParaVencer - b.diasParaVencer,
    diasDesc: (a, b) => b.diasParaVencer - a.diasParaVencer,
    lote: (a, b) => a.loteCodigo.localeCompare(b.loteCodigo),
    nombre: (a, b) => a.productoNombre.localeCompare(b.productoNombre),
};

/** Badge de días: vencido/≤10 (danger) · 11–25 (warning) · resto (success). */
function DiasBadge({ a }: { a: AlertaVencimiento }) {
    if (a.vencido) return <Badge variant="danger">Vencido</Badge>;
    if (a.critico) return <Badge variant="danger">{a.diasParaVencer} días</Badge>;
    if (a.advertencia) return <Badge variant="warning">{a.diasParaVencer} días</Badge>;
    return <Badge variant="success">{a.diasParaVencer} días</Badge>;
}

export function ExpiryAlertsView() {
    const { alertas, isLoading } = useAlertasVencimiento();

    const lotes = useMemo(
        () => Array.from(new Set(alertas.map((a) => a.loteCodigo))).sort(),
        [alertas],
    );
    // El piso baja a 0 (o menos si hay vencidos); el techo, a lo más lejano.
    const diasMin = useMemo(() => Math.min(0, ...alertas.map((a) => a.diasParaVencer)), [alertas]);
    const diasMax = useMemo(() => Math.max(1, ...alertas.map((a) => a.diasParaVencer)), [alertas]);

    const [lote, setLote] = useState('todos');
    const [rango, setRango] = useState<[number, number] | null>(null);
    const [orden, setOrden] = useState<OrdenVenc>('diasAsc');

    const limpiar = () => {
        setLote('todos');
        setRango(null);
        setOrden('diasAsc');
    };

    const criticos = useMemo(() => alertas.filter((a) => a.critico).length, [alertas]);

    const filas = useMemo(() => {
        const lo = rango ? rango[0] : diasMin;
        const hi = rango ? rango[1] : diasMax;
        const out = alertas.filter((a) => {
            if (lote !== 'todos' && a.loteCodigo !== lote) return false;
            if (a.diasParaVencer < lo || a.diasParaVencer > hi) return false;
            return true;
        });
        return [...out].sort(ordenadores[orden]);
    }, [alertas, lote, rango, diasMin, diasMax, orden]);

    const filtros = (
        <>
            <FilterSection title="Lote">
                <Select
                    aria-label="Lote"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    options={[
                        { value: 'todos', label: 'Todos los lotes' },
                        ...lotes.map((l) => ({ value: l, label: l })),
                    ]}
                />
            </FilterSection>

            <FilterSection title="Días para vencer">
                <RangeSlider
                    min={diasMin}
                    max={diasMax}
                    value={rango ?? [diasMin, diasMax]}
                    onChange={setRango}
                    format={(v) => `${v} d`}
                />
                <p className="mt-2 text-[11px] text-text-muted">
                    Filtra por cuántos días faltan para el vencimiento (negativo = ya vencido).
                </p>
            </FilterSection>
        </>
    );

    const toolbar = (
        <div className="flex items-center gap-2">
            {criticos > 0 && (
                <Badge variant="danger" size="lg">
                    {criticos} críticos
                </Badge>
            )}
            <Badge variant="default" size="lg">
                {filas.length} lotes
            </Badge>
            <Select
                aria-label="Ordenar"
                fullWidth={false}
                value={orden}
                onChange={(e) => setOrden(e.target.value as OrdenVenc)}
                options={[
                    { value: 'diasAsc', label: 'Vence antes' },
                    { value: 'diasDesc', label: 'Vence después' },
                    { value: 'lote', label: 'Lote' },
                    { value: 'nombre', label: 'Nombre' },
                ]}
            />
        </div>
    );

    return (
        <AlertShell
            title="Lotes próximos a vencer"
            subtitle="Vencimientos por lote; se resaltan los críticos (≤ 10 días o vencidos)"
            onClear={limpiar}
            filtros={filtros}
            toolbar={toolbar}
        >
            <Table loading={isLoading} stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableColumn>Producto</TableColumn>
                        <TableColumn>Lote</TableColumn>
                        <TableColumn>Marca</TableColumn>
                        <TableColumn className="text-center">Vence</TableColumn>
                        <TableColumn className="text-center">Restantes</TableColumn>
                    </TableRow>
                </TableHead>

                <TableBody
                    isEmpty={!isLoading && filas.length === 0}
                    emptyText="Ningún lote coincide con los filtros."
                >
                    {filas.map((a) => (
                        <TableRow
                            key={a.id}
                            className={
                                a.vencido || a.critico ? 'bg-danger-soft' : a.advertencia ? 'bg-warning-soft' : undefined
                            }
                        >
                            <TableCell>
                                <span className="font-medium text-text">{a.productoNombre}</span>
                                <span className="ml-2 font-mono text-xs text-text-muted">{a.productoSku}</span>
                            </TableCell>
                            <TableCell className="font-mono text-text-muted">{a.loteCodigo}</TableCell>
                            <TableCell className="text-text-muted">{a.marca}</TableCell>
                            <TableCell className="text-center text-text-muted">
                                {formatDate(a.fechaVencimiento)}
                            </TableCell>
                            <TableCell className="text-center">
                                <DiasBadge a={a} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </AlertShell>
    );
}
