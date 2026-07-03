// src/features/catalog/components/CatalogItems.tsx
import { useState } from 'react';
import { Badge, Button, Input } from '@/components/ui';
import { formatCLP } from '@/utils/formatCurrency';
import type { Product } from '@/types/models';
import { Link } from 'react-router';
import { useCartActions } from '@/features/cart/hooks/useCart';

// ─── M3: Stock Badge ──────────────────────────────────────────────────────────
export const StockBadge = ({ stock }: { stock: number }) => {
    if (stock === 0) return <Badge variant="danger">Agotado</Badge>;
    if (stock < 10) return <Badge variant="warning">Quedan {stock}</Badge>;
    return <Badge variant="success">En stock</Badge>;
};


export const PriceTag = ({ neto, iva, unit }: { neto: number; iva: number; unit: string }) => (
    <div className="text-right leading-none">
        <span className="block font-display font-extrabold text-plum-800 text-[22px]">
            {formatCLP(iva)}{' '}
            <span className="text-[11px] text-grape-500 font-normal">con IVA · {unit}</span>
        </span>
        <span className="block text-[12px] font-semibold text-grape-500 mt-1.5">
            {formatCLP(neto)} neto
        </span>
    </div>
);

// ─── M3: Buy Controls (Límite de Stock) ───────────────────────────────────────
export const BuyControls = ({ product, block = false }: { product: Product; block?: boolean }) => {
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addItem } = useCartActions();
    const agotado = product.stockTotal === 0;

    const handleAdd = () => {
        if (agotado) return;
        const res = addItem(product, qty);
        if (!res.ok) {
            setError(res.error ?? 'No se pudo agregar al carrito.');
            setAdded(false);
            return;
        }
        setError(null);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1500);
    };

    return (
        <div className={block ? 'w-full' : ''}>
            <div className="flex items-center gap-2">
                <Input
                    type="number"
                    min={1}
                    max={product.stockTotal}
                    value={qty}
                    onChange={(e) =>
                        setQty(Math.min(product.stockTotal, Math.max(1, parseInt(e.target.value) || 1)))
                    }
                    disabled={agotado}
                    className="w-16 text-center text-sm"
                />
                <Button
                    variant="primary"
                    onClick={handleAdd}
                    disabled={agotado}
                    className={`flex-1 whitespace-nowrap ${added ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                >
                    {agotado ? 'Agotado' : added ? '\u2713 Agregado' : 'Agregar'}
                </Button>
            </div>
            {error && (
                <p className="mt-1.5 text-[11.5px] text-rose-600" role="alert">
                    {error}
                </p>
            )}
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
            <Link to={`/producto/${p.code}`} className="text-[14.5px] font-bold text-azure-600 hover:text-plum-700 leading-snug">{p.name}</Link>
            <p className="mt-1 text-[12px] text-grape-600"><span className="font-mono font-semibold text-ink">{p.code}</span> · {p.brand}</p>
        </div>
        <div className="flex flex-col sm:items-end gap-3 shrink-0">
            <PriceTag neto={p.priceNeto} iva={p.priceIva} unit={p.unit} />
            <BuyControls product={p} />
        </div>
    </div>
);