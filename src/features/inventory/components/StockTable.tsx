// features/inventory/components/StockTable.tsx
// T3.3 — Vista de SOLO LECTURA del stock por bodega (consulta previa a aprobar).
// Presentacional: recibe productos ya filtrados por sucursal + la sucursal activa
// para resaltar la cantidad de ESA bodega. Reusa el Product del catálogo (M3).

import {
    Table,
    TableHead,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
} from '@/components/ui';
import { formatCLP } from '@/utils/formatCurrency';
import type { Product } from '@/types/models';

interface StockTableProps {
    productos: Product[];
    /** Sucursal activa; null = "todas" (se muestra el stock total). */
    sucursalId: number | null;
    loading?: boolean;
    emptyText?: string;
}

/** Stock del producto en la sucursal elegida (o total si no hay sucursal). */
const stockEnSucursal = (p: Product, sucursalId: number | null): number => {
    if (sucursalId == null) return p.stockTotal;
    const fila = p.stockBySucursal.find((s) => s.sucursalId === sucursalId);
    return fila?.stock ?? 0;
};

/** Pill de stock: 0 = sin stock, ≤5 = crítico, resto = ok (M3). */
function StockPill({ cantidad }: { cantidad: number }) {
    const cls =
        cantidad === 0
            ? 'bg-danger-soft text-danger'
            : cantidad <= 5
              ? 'bg-warning-soft text-warning'
              : 'bg-success-soft text-success';
    return (
        <span
            className={`inline-flex min-w-[2.5rem] items-center justify-center rounded-full px-2.5 py-1 text-[12px] font-bold ${cls}`}
        >
            {cantidad}
        </span>
    );
}

export function StockTable({
    productos,
    sucursalId,
    loading = false,
    emptyText = 'No hay productos para esta búsqueda.',
}: StockTableProps) {
    return (
        <Table loading={loading} stickyHeader>
            <TableHead>
                <TableRow>
                    <TableColumn>Producto</TableColumn>
                    <TableColumn>Marca</TableColumn>
                    <TableColumn className="text-right">Precio (IVA inc.)</TableColumn>
                    <TableColumn className="text-center">
                        {sucursalId == null ? 'Stock total' : 'Stock bodega'}
                    </TableColumn>
                    <TableColumn className="text-center">Stock total</TableColumn>
                </TableRow>
            </TableHead>

            <TableBody
                isEmpty={!loading && productos.length === 0}
                emptyText={emptyText}
            >
                {productos.map((p) => (
                    <TableRow key={p.id}>
                        <TableCell>
                            <span className="font-medium text-text">{p.name}</span>
                            <span className="ml-2 font-mono text-xs text-text-muted">
                                {p.code}
                            </span>
                        </TableCell>
                        <TableCell className="text-text-muted">{p.brand}</TableCell>
                        <TableCell className="text-right font-semibold">
                            {formatCLP(p.priceIva)}
                        </TableCell>
                        <TableCell className="text-center">
                            <StockPill cantidad={stockEnSucursal(p, sucursalId)} />
                        </TableCell>
                        <TableCell className="text-center text-text-muted">
                            {p.stockTotal}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
