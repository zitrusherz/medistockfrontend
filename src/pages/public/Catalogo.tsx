// src/pages/public/Catalogo.tsx
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useCatalogo } from '@/features/catalog/hooks/useCatalogo';
import { useQuery } from '@tanstack/react-query';
import { catalogService } from '@/features/catalog/services/catalogService';
import { ProductCardGrid, ProductRow } from '@/features/catalog/components/CatalogItems';
import { Spinner, Checkbox, Badge, Input, SkeletonCard } from '@/components/ui';

const PAGE_SIZE = 12;


function Pager({
                   page,
                   totalPages,
                   onChange,
               }: {
    page: number;
    totalPages: number;
    onChange: (p: number) => void;
}) {
    if (totalPages <= 1) return null;

    const around = 1;
    const nums: number[] = [];
    for (let i = Math.max(1, page - around); i <= Math.min(totalPages, page + around); i++) {
        nums.push(i);
    }
    const first = nums[0] ?? 1;
    const last = nums[nums.length - 1] ?? totalPages;

    const cell = (active: boolean) =>
        `min-w-9 h-9 px-3 rounded-lg text-[13.5px] font-semibold transition-colors ${
            active ? 'bg-plum-700 text-white' : 'text-grape-600 ring-1 ring-grape-200 hover:bg-grape-50'
        }`;
    const arrow =
        'h-9 px-3 rounded-lg text-[13.5px] font-semibold text-grape-600 ring-1 ring-grape-200 hover:bg-grape-50 disabled:opacity-40 disabled:cursor-not-allowed';

    return (
        <nav className="flex items-center justify-center flex-wrap gap-1.5 mt-8" aria-label="Paginación">
            <button onClick={() => onChange(page - 1)} disabled={page <= 1} className={arrow}>
                Anterior
            </button>

            {first > 1 && (
                <>
                    <button onClick={() => onChange(1)} className={cell(false)}>1</button>
                    {first > 2 && <span className="px-1 text-grape-400">…</span>}
                </>
            )}

            {nums.map((n) => (
                <button
                    key={n}
                    onClick={() => onChange(n)}
                    className={cell(n === page)}
                    aria-current={n === page ? 'page' : undefined}
                >
                    {n}
                </button>
            ))}

            {last < totalPages && (
                <>
                    {last < totalPages - 1 && <span className="px-1 text-grape-400">…</span>}
                    <button onClick={() => onChange(totalPages)} className={cell(false)}>{totalPages}</button>
                </>
            )}

            <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className={arrow}>
                Siguiente
            </button>
        </nav>
    );
}

export default function Catalogo() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [view, setView] = useState<'grid' | 'list'>('grid');


    const filtros = {
        search: searchParams.get('search') || '',
        categoria_id: searchParams.get('cat') || undefined,
        marca_id: searchParams.get('man') || undefined,
        sucursal_id: searchParams.get('suc') || undefined,
    };
    const page = Math.max(1, Number(searchParams.get('page')) || 1);

    // T2.2 Hook en acción (servidor: cat/marca/sucursal · cliente: texto)
    const { productos, isLoading, isEmpty, isFetching } = useCatalogo(filtros);

    // Carga de filtros dinámicos
    const { data: categorias = [] } = useQuery({ queryKey: ['cats'], queryFn: catalogService.getCategorias });
    const { data: marcas = [] } = useQuery({ queryKey: ['brands'], queryFn: catalogService.getMarcas });
    const { data: sucursales = [] } = useQuery({ queryKey: ['sucursales'], queryFn: catalogService.getSucursales });

    // ─── Paginación en CLIENTE sobre el set ya filtrado ───
    const totalPages = Math.max(1, Math.ceil(productos.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages); // clamp por si el set encogió
    const start = (safePage - 1) * PAGE_SIZE;
    const visibles = productos.slice(start, start + PAGE_SIZE);


    const updateFilter = (key: string, value: string | null) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value);
        else next.delete(key);
        // Cambiar filtro siempre resetea a página 1.
        next.delete('page');
        setSearchParams(next);
    };

    const goToPage = (p: number) => {
        const next = new URLSearchParams(searchParams);
        // URL más limpia: omitir ?page=1.
        if (p <= 1) next.delete('page');
        else next.set('page', String(p));
        setSearchParams(next);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSearchParams(new URLSearchParams());
    };

    // Nombres de los filtros activos para los Badges
    const activeCategory = categorias.find(c => String(c.id) === filtros.categoria_id);
    const activeBrand = marcas.find(m => String(m.id) === filtros.marca_id);
    const activeSucursal = sucursales.find(s => String(s.id) === filtros.sucursal_id);
    const hasActiveFilters = filtros.search || activeCategory || activeBrand || activeSucursal;

    return (
        <main className="mx-auto max-w-[1320px] px-5 py-6">
            <div className="flex flex-col lg:flex-row gap-6">

                {/* ─── BARRA LATERAL DE FILTROS ─── */}
                <aside className="w-full lg:w-[260px] shrink-0 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-plum-700 px-4 py-3 text-white font-bold">Filtros</div>
                        <div className="p-4 space-y-6">
                            <div>
                                <label className="text-sm font-semibold mb-2 block">Búsqueda</label>
                                <Input
                                    placeholder="Buscar producto..."
                                    value={filtros.search}
                                    onChange={(e) => updateFilter('search', e.target.value)}
                                />
                            </div>

                            {/* ─── Selector de Sucursal (filtro de servidor) ─── */}
                            <div>
                                <label className="text-sm font-semibold mb-2 block">Sucursal</label>
                                <select
                                    value={filtros.sucursal_id ?? ''}
                                    onChange={(e) => updateFilter('suc', e.target.value || null)}
                                    className="w-full rounded-lg ring-1 ring-grape-200 px-3 py-2 text-[14px] text-ink bg-white outline-none focus:ring-2 focus:ring-grape-500"
                                >
                                    <option value="">Todas las sucursales</option>
                                    {sucursales.map(s => (
                                        <option key={s.id} value={String(s.id)}>{s.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* FIX BUG VISUAL: `flex flex-col gap-2` fuerza a que cada Checkbox
                                ocupe su propia fila. Con `space-y-2` los checkboxes (inline-flex)
                                fluían en línea y se mostraban varios por renglón. */}
                            <div>
                                <label className="text-sm font-semibold mb-2 block">Categorías</label>
                                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                                    {categorias.map(c => (
                                        <Checkbox
                                            key={c.id}
                                            label={c.nombre}
                                            checked={filtros.categoria_id === String(c.id)}
                                            onChange={() => updateFilter('cat', filtros.categoria_id === String(c.id) ? null : String(c.id))}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold mb-2 block">Marcas</label>
                                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                                    {marcas.map(m => (
                                        <Checkbox
                                            key={m.id}
                                            label={m.nombre}
                                            checked={filtros.marca_id === String(m.id)}
                                            onChange={() => updateFilter('man', filtros.marca_id === String(m.id) ? null : String(m.id))}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ─── CONTENIDO CENTRAL (Resultados) ─── */}
                <section className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <h1 className="font-display font-bold text-plum-700 text-[26px] flex items-center gap-2">
                            Catálogo {isFetching && <Spinner size="sm" className="ml-2 text-grape-400" />}
                        </h1>
                        <div className="flex items-center gap-2">
                            <div className="flex rounded-lg ring-1 ring-grape-200 overflow-hidden bg-white">
                                <button onClick={() => setView('grid')} className={`px-3 py-2 ${view === 'grid' ? 'bg-plum-700 text-white' : 'text-gray-500'}`}>G</button>
                                <button onClick={() => setView('list')} className={`px-3 py-2 ${view === 'list' ? 'bg-plum-700 text-white' : 'text-gray-500'}`}>L</button>
                            </div>
                        </div>
                    </div>

                    {/* ─── CHIPS DE FILTROS ACTIVOS ─── */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            {filtros.search && (
                                <Badge variant="primary" className="flex items-center gap-1 cursor-pointer" onClick={() => updateFilter('search', null)}>
                                    Búsqueda: {filtros.search} ✕
                                </Badge>
                            )}
                            {activeSucursal && (
                                <Badge variant="primary" className="flex items-center gap-1 cursor-pointer" onClick={() => updateFilter('suc', null)}>
                                    {activeSucursal.nombre} ✕
                                </Badge>
                            )}
                            {activeCategory && (
                                <Badge variant="primary" className="flex items-center gap-1 cursor-pointer" onClick={() => updateFilter('cat', null)}>
                                    {activeCategory.nombre} ✕
                                </Badge>
                            )}
                            {activeBrand && (
                                <Badge variant="primary" className="flex items-center gap-1 cursor-pointer" onClick={() => updateFilter('man', null)}>
                                    {activeBrand.nombre} ✕
                                </Badge>
                            )}
                            <button onClick={clearFilters} className="text-[13px] font-semibold text-azure-600 hover:text-plum-700 ml-2">
                                Limpiar todos los filtros
                            </button>
                        </div>
                    )}

                    {/* Conteo de resultados (apoya el DoD: paginación legible) */}
                    {!isLoading && !isEmpty && (
                        <p className="text-[13px] text-grape-500 mb-3">
                            Mostrando {start + 1}–{Math.min(start + PAGE_SIZE, productos.length)} de {productos.length} productos
                        </p>
                    )}

                    {/* M12: Skeleton inicial */}
                    {isLoading ? (
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                        </div>
                    ) : isEmpty ? (
                        /* M12: Empty State */
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                            <p className="text-grape-500">No hay productos que coincidan con tu búsqueda o filtros actuales.</p>
                            <button onClick={clearFilters} className="mt-4 text-plum-700 font-semibold hover:underline">Ver todo el catálogo</button>
                        </div>
                    ) : (
                        <>
                            <div className={`
                                ${view === 'grid' ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'flex flex-col divide-y divide-gray-100 bg-white rounded-2xl shadow-sm border border-gray-100 px-4'}
                                ${isFetching ? 'opacity-60 pointer-events-none transition-opacity' : 'opacity-100 transition-opacity'}
                            `}>
                                {visibles.map(p => view === 'grid' ? (
                                    <ProductCardGrid key={p.id} p={p} />
                                ) : (
                                    <ProductRow key={p.id} p={p} />
                                ))}
                            </div>

                            <Pager page={safePage} totalPages={totalPages} onChange={goToPage} />
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}
