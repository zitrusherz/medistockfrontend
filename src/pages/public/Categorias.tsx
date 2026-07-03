// src/pages/public/Categorias.tsx
import { useNavigate, useParams, Link, Navigate } from 'react-router';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { useCategoriasArbol } from '@/features/catalog/hooks/useCategoriasArbol';
import type { CategoriaArbol } from '@/features/catalog/types';



// ─── Helpers de árbol ─────────────────────────────────────────────────────────
function findNode(nodes: CategoriaArbol[], id: number): CategoriaArbol | null {
    for (const n of nodes) {
        if (n.id === id) return n;
        const hit = findNode(n.subcategorias, id);
        if (hit) return hit;
    }
    return null;
}

/** Devuelve el camino raíz→nodo (ancestros incluidos) para el breadcrumb. */
function findPath(
    nodes: CategoriaArbol[],
    id: number,
    trail: CategoriaArbol[] = [],
): CategoriaArbol[] | null {
    for (const n of nodes) {
        const next = [...trail, n];
        if (n.id === id) return next;
        const hit = findPath(n.subcategorias, id, next);
        if (hit) return hit;
    }
    return null;
}

// ─── Card de categoría (caja fija + imagen que se adapta) ─────────────────────
function CategoryTile({
    cat,
    onOpen,
}: {
    cat: CategoriaArbol;
    onOpen: (c: CategoriaArbol) => void;
}) {
    const hasChildren = cat.subcategorias.length > 0;
    return (
        <button
            type="button"
            onClick={() => onOpen(cat)}
            className="group flex flex-col overflow-hidden rounded-lg bg-white text-left ring-1 ring-grape-100 transition hover:shadow-card hover:ring-gold-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-grape-500"
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-grape-50">
                {cat.imagenUrl ? (
                    <img
                        src={cat.imagenUrl}
                        alt={cat.nombre}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div
                        role="img"
                        aria-label={cat.nombre}
                        className="ph-stripes absolute inset-0 flex items-center justify-center"
                    >
                        <span className="px-2 text-center font-mono text-[10px] uppercase tracking-wider text-grape-700/55">
                            {cat.nombre}
                        </span>
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="text-[13.5px] font-semibold text-plum-700 transition-colors group-hover:text-gold-600">
                    {cat.nombre}
                </span>
                {hasChildren && (
                    <ChevronRight className="h-4 w-4 shrink-0 text-grape-400" />
                )}
            </div>
        </button>
    );
}

function TileSkeleton() {
    return (
        <div className="overflow-hidden rounded-lg ring-1 ring-grape-100">
            <div className="aspect-[4/3] w-full animate-pulse bg-grape-100" />
            <div className="px-3 py-2.5">
                <div className="h-3 w-2/3 animate-pulse rounded bg-grape-100" />
            </div>
        </div>
    );
}

export default function Categorias() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: tree = [], isLoading, isError } = useCategoriasArbol();

    const currentId = id ? Number(id) : null;
    const node = currentId != null ? findNode(tree, currentId) : null;
    const path = currentId != null ? findPath(tree, currentId) ?? [] : [];

    // Nivel a mostrar: raíces en /categorias, subcategorias del nodo en /categorias/:id
    const children = currentId == null ? tree : node?.subcategorias ?? [];

    // Hoja alcanzada por URL directa (sin hijas) → al catálogo filtrado.
    if (!isLoading && currentId != null && node && node.subcategorias.length === 0) {
        return <Navigate to={`/catalogo?cat=${currentId}`} replace />;
    }

    const open = (c: CategoriaArbol) => {
        if (c.subcategorias.length > 0) navigate(`/categorias/${c.id}`);
        else navigate(`/catalogo?cat=${c.id}`);
    };

    const title = node ? node.nombre : 'Categorías';

    return (
        <main className="mx-auto max-w-[1320px] px-5 py-6">
            {/* ─── Breadcrumb ─── */}
            <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-[13px] text-grape-500" aria-label="Ruta de categorías">
                <Link to="/categorias" className="transition-colors hover:text-plum-700">
                    Categorías
                </Link>
                {path.map((p, i) => (
                    <span key={p.id} className="flex items-center gap-1.5">
                        <ChevronRight className="h-3.5 w-3.5 text-grape-300" />
                        {i < path.length - 1 ? (
                            <Link to={`/categorias/${p.id}`} className="transition-colors hover:text-plum-700">
                                {p.nombre}
                            </Link>
                        ) : (
                            <span className="font-semibold text-plum-700">{p.nombre}</span>
                        )}
                    </span>
                ))}
            </nav>

            {/* ─── Encabezado ─── */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="font-display text-[28px] font-bold text-plum-700">{title}</h1>
                {currentId != null && (
                    <Link
                        to={`/catalogo?cat=${currentId}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-plum-700 px-4 py-2 text-[13.5px] font-semibold text-white transition-colors hover:bg-plum-800"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Ver productos de {node?.nombre ?? 'esta categoría'}
                    </Link>
                )}
            </div>

            <div className="flex flex-col gap-6 lg:flex-row">
                {/* ─── Rail lateral: lista del nivel actual (estilo "Product Categories") ─── */}
                {children.length > 0 && (
                    <aside className="w-full shrink-0 lg:w-[240px]">
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="bg-plum-700 px-4 py-3 font-bold text-white">
                                {node ? node.nombre : 'Todas las categorías'}
                            </div>
                            <ul className="max-h-[420px] overflow-y-auto p-2">
                                {children.map((c) => (
                                    <li key={c.id}>
                                        <button
                                            type="button"
                                            onClick={() => open(c)}
                                            className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13.5px] text-azure-600 transition-colors hover:bg-grape-50 hover:text-plum-700"
                                        >
                                            <span className="truncate">{c.nombre}</span>
                                            {c.subcategorias.length > 0 && (
                                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-grape-400" />
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                )}

                {/* ─── Grilla de cards ─── */}
                <section className="min-w-0 flex-1">
                    {isLoading ? (
                        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <TileSkeleton key={i} />
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="rounded-2xl border border-gray-100 bg-white p-16 text-center">
                            <p className="text-grape-500">
                                No pudimos cargar las categorías. Intenta de nuevo más tarde.
                            </p>
                        </div>
                    ) : currentId != null && !node ? (
                        // ID inexistente en el árbol.
                        <div className="rounded-2xl border border-gray-100 bg-white p-16 text-center">
                            <p className="text-grape-500">Esa categoría no existe.</p>
                            <Link to="/categorias" className="mt-4 inline-block font-semibold text-plum-700 hover:underline">
                                Volver a todas las categorías
                            </Link>
                        </div>
                    ) : children.length === 0 ? (
                        <div className="rounded-2xl border border-gray-100 bg-white p-16 text-center">
                            <p className="text-grape-500">Esta categoría no tiene subcategorías.</p>
                            {currentId != null && (
                                <Link
                                    to={`/catalogo?cat=${currentId}`}
                                    className="mt-4 inline-block font-semibold text-plum-700 hover:underline"
                                >
                                    Ver sus productos
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
                            {children.map((c) => (
                                <CategoryTile key={c.id} cat={c} onOpen={open} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
