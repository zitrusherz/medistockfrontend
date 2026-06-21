import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { Menu as MenuIcon } from "lucide-react"

/**
 * MainMenu — mega-menú tipo acordeón de la maqueta. Se abre al hacer clic en
 * "Menú". Una sección abierta a la vez ("Suministros" por defecto), las demás
 * con "+". Cierra con Escape (devuelve el foco al botón) y con clic-afuera.
 *
 * Los `to` de cada link son provisionales: apuntan a rutas reales donde existen
 * (catálogo, carrito, pedidos, registro) y, donde aún no hay vista, a /catalogo.
 * Re-apúntalos a medida que esas features existan.
 */
interface MenuLink {
    label: string
    to: string
}
interface MenuSection {
    title: string
    items: MenuLink[]
}

const SECTIONS: MenuSection[] = [
    {
        title: "Suministros",
        items: [
            { label: "Pedir desde el historial", to: "/cliente/pedidos" },
            { label: "Explorar suministros", to: "/catalogo" },
            { label: "Entrada rápida", to: "/catalogo" },
            { label: "Listas de compra", to: "/catalogo" },
            { label: "Mi pedido", to: "/cliente/carrito" },
            { label: "Pedidos sin enviar", to: "/cliente/pedidos" },
            { label: "Pedidos electrónicos 222 (E222)", to: "/catalogo" },
            { label: "Búsqueda de fichas (SDS)", to: "/catalogo" },
            { label: "Marca MediStock", to: "/catalogo" },
            { label: "Proveedor destacado", to: "/catalogo" },
            { label: "Ofertas destacadas", to: "/catalogo" },
            { label: "Guías de producto", to: "/catalogo" },
        ],
    },
    {
        title: "Nuestros clientes",
        items: [
            { label: "Instituciones y clínicas", to: "/catalogo" },
            { label: "Pacientes particulares", to: "/catalogo" },
            { label: "Crear una cuenta", to: "/registro" },
        ],
    },
    {
        title: "Productos",
        items: [
            { label: "Equipamiento", to: "/catalogo" },
            { label: "Laboratorio", to: "/catalogo" },
            { label: "Insumos médicos y quirúrgicos", to: "/catalogo" },
            { label: "Farmacia", to: "/catalogo" },
        ],
    },
    {
        title: "Soluciones y servicios",
        items: [
            { label: "Despacho express", to: "/catalogo" },
            { label: "Abastecimiento institucional", to: "/catalogo" },
        ],
    },
    {
        title: "Centro de recursos",
        items: [
            { label: "Guías de producto", to: "/catalogo" },
            { label: "Fichas de seguridad (SDS)", to: "/catalogo" },
        ],
    },
    {
        title: "Ayuda",
        items: [
            { label: "Contáctanos", to: "/catalogo" },
            { label: "Preguntas frecuentes", to: "/catalogo" },
        ],
    },
]

export function MainMenu() {
    const [open, setOpen] = useState(false)
    const [expanded, setExpanded] = useState<string>("Suministros")
    const ref = useRef<HTMLDivElement>(null)
    const btnRef = useRef<HTMLButtonElement>(null)

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

    const toggleSection = (title: string) =>
        setExpanded((cur) => (cur === title ? "" : title))

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
                    aria-label="Menú de suministros"
                    className="absolute left-0 top-[calc(100%+14px)] z-50 flex max-h-[72vh] w-[340px] flex-col overflow-hidden rounded-xl bg-white shadow-lift ring-1 ring-gold-300/70"
                >
                    <div className="h-1.5 shrink-0 gold-rule" />

                    <div className="flex-1 overflow-auto">
                        {SECTIONS.map((sec) => {
                            const isOpen = expanded === sec.title
                            return (
                                <div key={sec.title} className="border-b border-grape-100 last:border-b-0">
                                    <button
                                        onClick={() => toggleSection(sec.title)}
                                        aria-expanded={isOpen}
                                        className="flex w-full items-center justify-between px-5 py-3.5 text-left font-display text-[17px] font-bold text-plum-700 transition-colors hover:bg-grape-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-grape-500"
                                    >
                                        {sec.title}
                                        <span className="text-[20px] font-normal leading-none text-gold-500">
                                            {isOpen ? "−" : "+"}
                                        </span>
                                    </button>

                                    {isOpen && (
                                        <ul className="pb-3">
                                            {sec.items.map((it) => (
                                                <li key={it.label}>
                                                    <Link
                                                        to={it.to}
                                                        role="menuitem"
                                                        onClick={() => setOpen(false)}
                                                        className="block px-5 py-2 text-[13.5px] text-azure-600 transition-colors hover:text-plum-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-grape-500"
                                                    >
                                                        {it.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className="shrink-0 border-t border-grape-100 bg-grape-50 px-5 py-3.5 font-display text-[16px] font-bold text-plum-700 transition-colors hover:bg-grape-100"
                    >
                        Mi cuenta
                    </Link>
                </div>
            )}
        </div>
    )
}
