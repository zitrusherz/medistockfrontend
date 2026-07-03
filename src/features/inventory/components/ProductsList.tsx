

import { useMemo, useState } from 'react';
import {
    Badge,
    Input,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHead,
    TableRow,
} from '@/components/ui';
import { useProductosAdmin } from '../hooks/useProductosAdmin';
import { formatCLP } from '@/utils/formatCurrency';
import type { Product } from '@/types/models';

/** Pill de stock: agotado (danger) · bajo ≤10 (warning) · ok (success). */
function StockBadge({ stock }: { stock: number }) {
    if (stock <= 0) return <Badge variant="danger">Agotado</Badge>;
    if (stock <= 10) return <Badge variant="warning">{stock} u</Badge>;
    return <Badge variant="success">{stock} u</Badge>;
}

/** Miniatura de respaldo (la API de catálogo no expone imagen). */
function ProductThumb({ name }: { name: string }) {
    const inicial = name.trim().charAt(0).toUpperCase() || '?';
    return (
        <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border bg-surface-muted text-sm font-semibold text-text-muted"
            aria-hidden="true"
        >
            {inicial}
        </div>
    );
}

export function ProductsList() {
    const { productos, isLoading, isError, refetch } = useProductosAdmin();
    const [q, setQ] = useState('');

    const filtrados = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return productos;
        return productos.filter(
            (p) =>
                p.name.toLowerCase().includes(term) ||
                p.code.toLowerCase().includes(term),
        );
    }, [productos, q]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:max-w-xs">
                    <Input
                        type="search"
                        placeholder="Buscar por nombre o código…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        aria-label="Buscar productos"
                    />
                </div>
                <Badge variant="default" size="lg">
                    {filtrados.length} producto{filtrados.length === 1 ? '' : 's'}
                </Badge>
            </div>

            {isError ? (
                <div className="rounded-lg border border-border bg-surface px-6 py-10 text-center">
                    <p className="text-sm text-text-muted">
                        No pudimos cargar los productos.
                    </p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="mt-3 text-sm font-semibold text-primary hover:underline"
                    >
                        Reintentar
                    </button>
                </div>
            ) : (
                <Table loading={isLoading} stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableColumn className="w-12">
                                <span className="sr-only">Imagen</span>
                            </TableColumn>
                            <TableColumn>Producto</TableColumn>
                            <TableColumn>Marca</TableColumn>
                            <TableColumn className="text-center">Stock</TableColumn>
                            <TableColumn className="text-right">Precio neto</TableColumn>
                        </TableRow>
                    </TableHead>

                    <TableBody
                        isEmpty={!isLoading && filtrados.length === 0}
                        emptyText={
                            q
                                ? 'Ningún producto coincide con la búsqueda.'
                                : 'Aún no hay productos cargados.'
                        }
                    >
                        {filtrados.map((p: Product) => (
                            <TableRow key={p.id}>
                                <TableCell>
                                    <ProductThumb name={p.name} />
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium text-text">{p.name}</span>
                                    <span className="mt-0.5 block font-mono text-xs text-text-muted">
                                        {p.code}
                                    </span>
                                </TableCell>
                                <TableCell className="text-text-muted">{p.brand}</TableCell>
                                <TableCell className="text-center">
                                    <StockBadge stock={p.stockTotal} />
                                </TableCell>
                                <TableCell className="text-right font-medium text-text">
                                    {formatCLP(p.priceNeto)}
                                    <span className="mt-0.5 block text-[11px] font-normal text-text-muted">
                                        IVA incl. {formatCLP(p.priceIva)}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
