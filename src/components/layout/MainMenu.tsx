// src/components/layout/MainMenu.tsx
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { Menu as MenuIcon, ChevronRight } from "lucide-react"
import { useCategoriasArbol } from "@/features/catalog/hooks/useCategoriasArbol"
import type { CategoriaArbol } from "@/features/catalog/types"

/**
 * MainMenu — mega-menú del navbar al estilo "Browse Supplies": al hacer clic en
 * "Menú" se despliega una grilla de CARDS de categorías reales, traídas del
 * backend con `useCategoriasArbol()` (GET /inventory/public/categorias/arbol/).
 *
 * Drill-down: una card con subcategorías abre el NAVEGADOR de categorías en su
 * nivel (/categorias/:id); una hoja salta directo al catálogo (/catalogo?cat=).
 *
 * Reglas de imagen: cada card tiene TAMAÑO PREDEFINIDO; la imagen llena la caja
 * con object-cover, así cualquier proporción de archivo se adapta y se recorta.
 * Sin imagen → placeholder rayado (.ph-stripes).
 *
 * Cierra con Escape (devuelve el foco al botón) y con clic-afuera.
 */

// ─── Card de categoría (caja de tamaño fijo + imagen que se adapta) ───────────
function CategoryCard({
    cat,
    onNavigate,
}: {
    cat: CategoriaArbol
    onNavigate: () => void
}) {
    const hasChildren = cat.subcategorias.length > 0
    const to = hasChildren ? `/categorias/${cat.id}` : `/catalogo?cat=${cat.id}`

    return (
        <Link
            to={to}
            role="menuitem"
            onClick={onNavigate}
            className="group flex flex-col overflow-hidden rounded-lg ring-1 ring-grape-100 transition-colors hover:ring-gold-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-grape-500"
        >
            {/* Caja de imagen: tamaño predefinido por aspect-ratio + ancho completo */}
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

            <p className="flex items-center justify-between gap-1 px-2.5 py-2 text-[12.5px] font-semibold leading-tight text-plum-700 transition-colors group-hover:text-gold-600">
                <span className="truncate">{cat.nombre}</span>
                {hasChildren && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-grape-400" />}
            </p>
        </Link>
    )
}

// ─── Skeleton de una card mientras carga el árbol ─────────────────────────────
function CardSkeleton() {
    return (
        <div className="overflow-hidden rounded-lg ring-1 ring-grape-100">
            <div className="aspect-[4/3] w-full animate-pulse bg-grape-100" />
            <div className="px-2.5 py-2">
                <div className="h-3 w-2/3 animate-pulse rounded bg-grape-100" />
            </div>
        </div>
    )
}

export function MainMenu() {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const btnRef = useRef<HTMLButtonElement>(null)

    const { data: categorias = [], isLoading, isError } = useCategoriasArbol()

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) {
                setOpen(false)
                btnRef.current?.focus()
            }
        }
        document.addEventListener("mousedown", onClick)
        document.addEventListener("keydown", onKey)
        return () => {
            document.removeEventListener("mousedown", onClick)
            document.removeEventListener("keydown", onKey)
        }
    }, [open])

    const close = () => setOpen(false)

    return (
        <div className="relative" ref={ref}>
            <button
                ref={btnRef}
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={open}
                className="flex flex-col items-center gap-0.5 rounded-md text-grape-700 transition-colors hover:text-plum-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-grape-500"
            >
                <MenuIcon className="h-5 w-5" />
                <span className="text-[11px] font-semibold">Menú</span>
            </button>

            {open && (
                <div
                    role="menu"
                    aria-label="Categorías de suministros"
                    className="absolute left-0 top-[calc(100%+14px)] z-50 flex max-h-[72vh] w-[min(880px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl bg-white shadow-lift ring-1 ring-gold-300/70"
                >
                    <div className="h-1.5 shrink-0 gold-rule" />

                    {/* Cabecera */}
                    <div className="flex items-center justify-between px-5 pb-1 pt-4">
                        <h3 className="font-display text-[18px] font-bold text-plum-700">
                            Explorar por categoría
                        </h3>
                        <Link
                            to="/categorias"
                            onClick={close}
                            className="text-[13px] font-semibold text-azure-600 transition-colors hover:text-plum-700"
                        >
                            Ver todas las categorías →
                        </Link>
                    </div>

                    {/* Grilla de categorías */}
                    <div className="flex-1 overflow-auto px-5 py-4">
                        {isLoading ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <CardSkeleton key={i} />
                                ))}
                            </div>
                        ) : isError ? (
                            <p className="py-10 text-center text-[13.5px] text-grape-500">
                                No pudimos cargar las categorías. Intenta de nuevo más tarde.
                            </p>
                        ) : categorias.length === 0 ? (
                            <p className="py-10 text-center text-[13.5px] text-grape-500">
                                Aún no hay categorías disponibles.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {categorias.map((cat) => (
                                    <CategoryCard key={cat.id} cat={cat} onNavigate={close} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pie */}
                    <Link
                        to="/login"
                        onClick={close}
                        className="shrink-0 border-t border-grape-100 bg-grape-50 px-5 py-3.5 font-display text-[16px] font-bold text-plum-700 transition-colors hover:bg-grape-100"
                    >
                        Mi cuenta
                    </Link>
                </div>
            )}
        </div>
    )
}
