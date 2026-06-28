import { useState } from 'react';
import { Badge, Button, Input } from '@/components/ui';
import { formatCLP } from '@/utils/formatCurrency';
import type { Product } from '@/types/models';
import { Link } from 'react-router';

// ─── M3: Stock Badge ──────────────────────────────────────────────────────────
export const StockBadge = ({ stock }: { stock: number }) => {
    if (stock === 0) return <Badge variant="danger">Agotado</Badge>;
    if (stock < 10) return <Badge variant="warning">Quedan {stock}</Badge>;
    return <Badge variant="success">En stock</Badge>;
};

// ─── M1/M2: Price Tag ─────────────────────────────────────────────────────────
export const PriceTag = ({ neto, iva, unit }: { neto: number; iva: number; unit: string }) => (
    <div className="text-right leading-none">
        <span className="block font-display font-bold text-plum-700 text-[18px]">
            {formatCLP(neto)} <span className="text-[12px] text-grape-500 font-normal">neto</span>
        </span>
        <span className="block text-[11px] font-semibold text-grape-600 mt-1">
            {formatCLP(iva)} con IVA · {unit}
        </span>
    </div>
);

// ─── M3: Buy Controls (Límite de Stock) ───────────────────────────────────────
export const BuyControls = ({ product, block = false }: { product: Product; block?: boolean }) => {
    const [qty, setQty] = useState(1);
    const agotado = product.stockTotal === 0;

    const handleAdd = () => {
        if (agotado) return;
        // TODO: Conectar con tu store del carrito cuando implementemos esa feature
        console.log(`Agregado ${qty} de ${product.code}`);
    };

    return (
        <div className={`flex items-center gap-2 ${block ? 'w-full' : ''}`}>
            <Input
                type="number"
                min={1}
                max={product.stockTotal} // M3: Bloqueo HTML basado en stock
                value={qty}
                onChange={(e) => setQty(Math.min(product.stockTotal, Math.max(1, parseInt(e.target.value) || 1)))}
                disabled={agotado}
                className="w-16 text-center text-sm"
            />
            <Button
                variant="primary"
                onClick={handleAdd}
                disabled={agotado}
                className="flex-1 whitespace-nowrap"
            >
                {agotado ? 'Agotado' : 'Agregar'}
            </Button>
        </div>
    );
};

// ─── Tarjetas de Producto (M14 Responsive Grid/List) ─────────────────────────
export const ProductCardGrid = ({ p }: { p: Product }) => (
    <div className="border border-grape-100 rounded-xl overflow-hidden flex flex-col hover:shadow-card hover:border-gold-300 transition-all bg-white">
        <div className="aspect-square w-full border-b border-grape-100 grid place-items-center bg-gray-50 relative overflow-hidden">
            <div className="absolute top-2 right-2"><StockBadge stock={p.stockTotal} /></div>
            {p.imageUrl ? (
                <img
                    src={p.imageUrl}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Si la URL del backend rompe (404, media mal servido), no deja un ícono roto.
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                />
            ) : null}
            <span className={`font-mono text-[11px] uppercase text-grape-400 ${p.imageUrl ? 'hidden' : ''}`}>
                Sin imagen
            </span>
        </div>
        <div className="p-4 flex-1 flex flex-col">
            {/* <-- 2. Aca cambiamos <a> por <Link> --> */}
            <Link to={`/producto/${p.code}`} className="text-[13.5px] font-bold text-azure-600 hover:text-plum-700 leading-snug line-clamp-2">
                {p.name}
            </Link>
            <p className="mt-1 text-[11.5px] text-grape-600"><span className="font-mono font-semibold text-ink">{p.code}</span> · {p.brand}</p>
            <div className="mt-auto pt-3 flex flex-col gap-3">
                <PriceTag neto={p.priceNeto} iva={p.priceIva} unit={p.unit} />
                <BuyControls product={p} block />
            </div>
        </div>
    </div>
);

export const ProductRow = ({ p }: { p: Product }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-5 bg-white">
        <div className="w-24 h-24 shrink-0 rounded-lg border border-grape-100 grid place-items-center text-center bg-gray-50 relative overflow-hidden">
            {p.imageUrl ? (
                <img
                    src={p.imageUrl}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                />
            ) : null}
            <span className={`font-mono text-[9px] uppercase text-grape-400 leading-tight px-1 ${p.imageUrl ? 'hidden' : ''}`}>
                IMG
            </span>
        </div>
        <div className="flex-1 min-w-0">
            <div className="mb-1"><StockBadge stock={p.stockTotal} /></div>
            {/* <-- 3. Aca también cambiamos <a> por <Link> --> */}
            <Link to={`/producto/${p.code}`} className="text-[14.5px] font-bold text-azure-600 hover:text-plum-700 leading-snug">{p.name}</Link>
            <p className="mt-1 text-[12px] text-grape-600"><span className="font-mono font-semibold text-ink">{p.code}</span> · {p.brand}</p>
        </div>
        <div className="flex flex-col sm:items-end gap-3 shrink-0">
            <PriceTag neto={p.priceNeto} iva={p.priceIva} unit={p.unit} />
            <BuyControls product={p} />
        </div>
    </div>
);