// src/pages/public/Producto.tsx
import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { catalogService } from '@/features/catalog/services/catalogService';
import {
    PriceTag,
    StockBadge,
    ProductCardGrid,
} from '@/features/catalog/components/CatalogItems';
import { QtyStepper } from '@/features/catalog/components/QtyStepper';
import { useCatalogo } from '@/features/catalog/hooks/useCatalogo';
import { useCartActions, useCartSucursal } from '@/features/cart/hooks/useCart';
import { Spinner, Accordion, AccordionItem, Button, Badge } from '@/components/ui';

const Warn = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BD9233" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="inline-block shrink-0">
        <path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17h.01" />
    </svg>
);

/* ──────────────────────────────────────────────────────────────────────────
   OPCIONAL · Productos relacionados (simula los "complementarios")
   El caso NO expone endpoint de complementarios. Se simula con la misma
   categoria reutilizando el hook del catalogo (Repository + Observer).
   Para quitarlo: borra este componente y su uso en el JSX (1 linea).
   ────────────────────────────────────────────────────────────────────────── */
function RelatedProducts({ categoryName, excludeCode }: { categoryName?: string; excludeCode: string }) {
    // name -> id: el producto trae nombres de categoria; el filtro necesita el id.
    const { data: categorias = [] } = useQuery({
        queryKey: ['cats'],
        queryFn: catalogService.getCategorias,
    });
    const categoriaId = categorias.find(
        (c: { id: number | string; nombre: string }) => c.nombre === categoryName,
    )?.id;

    const { productos } = useCatalogo({
        search: '',
        categoria_id: categoriaId != null ? String(categoriaId) : undefined,
        marca_id: undefined,
        sucursal_id: undefined,
    });

    const relacionados = productos
        .filter((x) => String(x.code) !== String(excludeCode))
        .slice(0, 3);

    if (!categoryName || relacionados.length === 0) return null;

    return (
        <section className="mt-10">
            <h2 className="font-display font-bold text-plum-700 text-[20px] mb-4">Productos relacionados</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {relacionados.map((rp) => <ProductCardGrid key={rp.id} p={rp} />)}
            </div>
        </section>
    );
}

export default function Producto() {
    // Ruta confirmada en router/index.tsx: /producto/:codigo
    const { codigo } = useParams<{ codigo: string }>();
    const { addItem } = useCartActions();
    const cartSucursalId = useCartSucursal();

    const [qty, setQty] = useState(1);
    const [chosenSucursalId, setChosenSucursalId] = useState<number | null>(null);
    const [added, setAdded] = useState(false);
    const [cartError, setCartError] = useState<string | null>(null);

    const { data: p, isLoading, isError } = useQuery({
        queryKey: ['producto', codigo],
        queryFn: () => catalogService.getProducto(codigo as string),
        enabled: !!codigo,
    });

    // Sucursal por defecto:
    //  1) si el carrito ya tiene sucursal y el producto tiene stock ahi -> esa (continuidad)
    //  2) la primera CON stock
    //  3) la primera disponible
    const defaultSucursalId = useMemo(() => {
        if (!p) return null;
        if (cartSucursalId != null) {
            const enCarrito = p.stockBySucursal.find((s) => s.sucursalId === cartSucursalId);
            if (enCarrito && enCarrito.stock > 0) return cartSucursalId;
        }
        const conStock = p.stockBySucursal.find((s) => s.stock > 0);
        return (conStock ?? p.stockBySucursal[0])?.sucursalId ?? null;
    }, [p, cartSucursalId]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner size="xl" /></div>;
    }

    if (isError || !p) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-bold text-plum-700 mb-2">Producto no encontrado</h2>
                <p className="text-grape-600 mb-6">El código {codigo} no existe o no está disponible.</p>
                <Link to="/catalogo"><Button variant="primary">Volver al catálogo</Button></Link>
            </div>
        );
    }

    // ── Estado derivado de la sucursal seleccionada (nucleo de M3) ──
    const sucursalId = chosenSucursalId ?? defaultSucursalId;
    const sucursalSel = p.stockBySucursal.find((s) => s.sucursalId === sucursalId) ?? null;
    const maxStock = sucursalSel?.stock ?? 0;

    const globalmenteAgotado = p.stockTotal === 0;
    const sinStockEnSucursal = !globalmenteAgotado && maxStock === 0;
    const puedeAgregar = !globalmenteAgotado && maxStock > 0 && qty >= 1 && qty <= maxStock;

    // "Una sola sucursal por carrito": el carrito ya tiene items de OTRA sucursal.
    const conflictoSucursal = cartSucursalId != null && cartSucursalId !== sucursalId;

    // El reset/clamp de cantidad vive en el EVENTO (como en Catalogo.tsx), no en un effect.
    const elegirSucursal = (id: number) => {
        setChosenSucursalId(id);
        setCartError(null);
        const stock = p.stockBySucursal.find((s) => s.sucursalId === id)?.stock ?? 0;
        setQty((q) => Math.min(Math.max(1, q), Math.max(1, stock)));
    };

    const handleAdd = () => {
        if (!sucursalId || !puedeAgregar) return;
        // Firma real del store: addItem(product, qty, sucursalId) -> AddItemResult.
        // El store es la autoridad: valida stock acumulado y "una sola sucursal por carrito".
        const res = addItem(p, qty, sucursalId);
        if (!res.ok) {
            setCartError(res.error ?? 'No se pudo agregar al carrito.');
            setAdded(false);
            return;
        }
        setCartError(null);
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
    };

    const labelBoton = added
        ? '\u2713 Agregado'
        : globalmenteAgotado
            ? 'Agotado'
            : sinStockEnSucursal
                ? 'Sin stock en esta sucursal'
                : 'Agregar al carrito';

    return (
        <>
            <main className="mx-auto max-w-[1280px] px-5 py-7 pb-28">
                {/* Breadcrumb */}
                <nav className="text-[12.5px] text-grape-500 mb-5 flex flex-wrap items-center gap-1.5">
                    <Link to="/" className="hover:text-plum-700">Inicio</Link><span className="text-grape-300">/</span>
                    <Link to="/catalogo" className="hover:text-plum-700">Catálogo</Link><span className="text-grape-300">/</span>
                    <span className="text-plum-700 font-semibold">{p.name}</span>
                </nav>

                <div className="grid lg:grid-cols-[1fr_320px] gap-6">
                    {/* Columna Principal */}
                    <div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                            <div className="absolute top-4 right-4 z-10"><StockBadge stock={p.stockTotal} /></div>

                            <div className="grid md:grid-cols-2 gap-6 p-6">
                                {/* Imagen Placeholder */}
                                <div className="aspect-square w-full rounded-xl border border-grape-100 bg-gray-50 flex items-center justify-center">
                                    <span className="font-mono text-xs text-grape-400">IMAGEN {p.code}</span>
                                </div>

                                {/* Info Base */}
                                <div>
                                    <h1 className="font-display font-bold text-plum-700 text-[28px] leading-tight">{p.name}</h1>
                                    <p className="mt-1 text-[13px] text-grape-600">
                                        <span className="font-mono font-bold text-ink">{p.code}</span> {' '} {p.brand}
                                    </p>

                                    <p className="mt-4 text-[12px] font-bold tracking-wide text-grape-700">DESCRIPCIÓN</p>
                                    <p className="text-[14px] text-ink/90 mt-1 line-clamp-4">{p.description || 'Sin descripción detallada.'}</p>

                                    <div className="mt-6 bg-grape-50/50 p-4 rounded-xl border border-grape-100">
                                        {/* ── Selector de sucursal (siempre visible, tambien en movil) ── */}
                                        {p.stockBySucursal.length > 0 && (
                                            <div className="mb-4">
                                                <label htmlFor="sucursal" className="block text-[12px] font-bold tracking-wide text-grape-700 mb-1">
                                                    DESPACHA DESDE
                                                </label>
                                                <select
                                                    id="sucursal"
                                                    value={sucursalId ?? ''}
                                                    onChange={(e) => elegirSucursal(Number(e.target.value))}
                                                    className="w-full rounded-lg ring-1 ring-grape-200 px-3 py-2 text-[14px] text-ink bg-white outline-none focus:ring-2 focus:ring-grape-500"
                                                >
                                                    {p.stockBySucursal.map((s) => (
                                                        <option key={s.sucursalId} value={s.sucursalId}>
                                                            {s.sucursalNombre} {' \u2014 '} {s.stock > 0 ? `${s.stock} disp.` : 'sin stock'}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-end gap-4">
                                            <div className="flex-1 min-w-[200px]">
                                                <PriceTag neto={p.priceNeto} iva={p.priceIva} unit={p.unit} />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {/* M3: el maximo es el stock de la SUCURSAL seleccionada */}
                                                <QtyStepper
                                                    value={qty}
                                                    onChange={setQty}
                                                    min={1}
                                                    max={maxStock}
                                                    disabled={maxStock === 0}
                                                    unit={p.unit}
                                                />
                                                <Button
                                                    variant="primary"
                                                    onClick={handleAdd}
                                                    disabled={!puedeAgregar}
                                                    className={`w-full ${added ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                                                >
                                                    {labelBoton}
                                                </Button>
                                            </div>
                                        </div>

                                        {sinStockEnSucursal && (
                                            <p className="text-[12px] text-gold-700 mt-2 flex items-start gap-1.5">
                                                <Warn /> Sin stock en esta sucursal. Elige otra con disponibilidad.
                                            </p>
                                        )}
                                        {conflictoSucursal && !sinStockEnSucursal && !cartError && (
                                            <p className="text-[12px] text-gold-700 mt-2 flex items-start gap-1.5">
                                                <Warn /> Tu carrito ya tiene productos de otra sucursal.
                                            </p>
                                        )}
                                        {cartError && (
                                            <p className="text-[12px] text-rose-600 mt-2 flex items-start gap-1.5" role="alert">
                                                <Warn /> {cartError}
                                            </p>
                                        )}
                                    </div>

                                    {p.requiereControlVencimiento && (
                                        <div className="mt-4 space-y-1.5">
                                            <p className="text-[12.5px] text-gold-700 flex items-start gap-2">
                                                <Warn /> Este artículo requiere control estricto de fechas de vencimiento.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Meta Inferior */}
                            <div className="border-t border-grape-100 px-6 py-4 grid sm:grid-cols-2 gap-4 text-[13px] bg-gray-50/50">
                                <div>
                                    <p className="font-bold text-grape-700 text-[11.5px] tracking-wide">CATEGORÍAS</p>
                                    <div className="flex gap-1 mt-1 flex-wrap">
                                        {p.categories.map((c, i) => <Badge key={i} variant="neutral">{c}</Badge>)}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-grape-700 text-[11.5px] tracking-wide">REGISTRO SANITARIO (ISP)</p>
                                    <p className="text-ink mt-0.5">{p.registroSanitario || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Acordeones de Detalles Reales */}
                        <div className="mt-5">
                            <Accordion>
                                <AccordionItem value="desc" title="Descripción extendida" subtitle="Información detallada del producto">
                                    <div className="p-4 text-sm text-ink/90 leading-relaxed">
                                        {p.description || 'No hay descripción extendida disponible para este producto.'}
                                    </div>
                                </AccordionItem>
                                <AccordionItem value="specs" title="Especificaciones técnicas" subtitle="Atributos de sistema e inventario">
                                    <div className="rounded-lg overflow-hidden ring-1 ring-grape-100 m-4">
                                        {[
                                            ['Marca', p.brand],
                                            ['Unidad de medida', p.unit],
                                            ['¿Es caja/bulto cerrado?', p.esCaja ? 'Sí' : 'No'],
                                            ['Control de vencimiento', p.requiereControlVencimiento ? 'Requerido' : 'No requerido'],
                                        ].map((row, i) => (
                                            <div key={row[0]} className={`grid grid-cols-2 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                                <span className="px-4 py-2.5 text-[13px] font-bold text-plum-700">{row[0]}</span>
                                                <span className="px-4 py-2.5 text-[13px] text-ink">{row[1]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionItem>
                            </Accordion>
                        </div>

                        {/* Complementarios simulados (ver nota arriba) */}
                        <RelatedProducts categoryName={p.categories?.[0]} excludeCode={p.code} />
                    </div>

                    {/* Columna Secundaria - Stock por bodega (clic = seleccionar sucursal) */}
                    <aside className="hidden lg:block">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                            <div className="bg-plum-700 px-4 py-3 text-white font-bold">Disponibilidad por bodega</div>
                            <div className="p-3 space-y-1">
                                {p.stockBySucursal.length > 0 ? (
                                    p.stockBySucursal.map((suc) => {
                                        const activa = suc.sucursalId === sucursalId;
                                        return (
                                            <button
                                                key={suc.sucursalId}
                                                onClick={() => elegirSucursal(suc.sucursalId)}
                                                aria-pressed={activa}
                                                className={`w-full flex justify-between items-center text-sm rounded-lg px-3 py-2.5 transition-colors text-left ${
                                                    activa ? 'bg-grape-50 ring-1 ring-grape-300' : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <span className="text-grape-700 flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${activa ? 'bg-plum-700' : 'bg-grape-200'}`} />
                                                    {suc.sucursalNombre}
                                                </span>
                                                <span className={`font-bold ${suc.stock === 0 ? 'text-gray-400' : 'text-plum-700'}`}>
                                                    {suc.stock} u.
                                                </span>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-gray-500 px-3 py-2">Sin stock registrado en sucursales.</p>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Barra Fija Inferior (StickyBar) - comparte estado con la ficha */}
            <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
                <div className="mx-auto max-w-[1280px] px-5 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1 hidden sm:block">
                        <p className="text-[14px] font-bold text-plum-700 truncate">{p.name}</p>
                        <p className="text-[12px] text-grape-600">
                            <span className="font-mono font-semibold text-ink">{p.code}</span>
                            {sucursalSel && <> {' \u00b7 '} {sucursalSel.sucursalNombre}: {maxStock} u.</>}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <PriceTag neto={p.priceNeto} iva={p.priceIva} unit={p.unit} />
                        <div className="flex items-center gap-2">
                            <QtyStepper
                                value={qty}
                                onChange={setQty}
                                min={1}
                                max={maxStock}
                                disabled={maxStock === 0}
                            />
                            <Button variant="primary" onClick={handleAdd} disabled={!puedeAgregar}>
                                {globalmenteAgotado ? 'Agotado' : sinStockEnSucursal ? 'Sin stock' : 'Agregar'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}