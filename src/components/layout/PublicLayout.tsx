import { useState, useEffect, useRef, type FormEvent } from "react"
import { Link, Outlet, useNavigate } from "react-router"
import { Search, Store, User, Phone, HelpCircle } from "lucide-react"
import { CartMenu } from "@/features/cart/components/CartMenu"
import { MainMenu } from "@/components/layout/MainMenu"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { useCartTotal } from "@/features/cart/hooks/useCart"
import { useAuthStore } from "@/store/authStore"
import { homeByRole } from "@/router/homeByRole"
import { formatCLP } from "@/utils/formatCurrency"

/**
 * PublicLayout — chrome de la TIENDA pública (TopBar + Header + Outlet).
 *
 * Reutiliza los componentes ya existentes:
 *   · <CartMenu/>  → mini-carrito con apertura por HOVER (ver CartMenu.tsx).
 *   · <LoginForm/> → form real de login dentro de un popover (AccountMenu).
 *
 * Se monta como LAYOUT ROUTE en router/index.tsx envolviendo /, /catalogo y
 * /producto/:codigo. El header es `sticky`, así que las páginas no necesitan
 * padding-top.
 */
export function PublicLayout() {
    return (
        <div className="min-h-screen bg-background text-text">
            <StoreHeader />
            <main>
                <Outlet />
            </main>
        </div>
    )
}

/* ── Logo: portado tal cual de la maqueta (components.jsx).
   Grilla 2×2 rotada 45° (TL oro, TR plum, BL grape, BR oro) + wordmark con
   "Stock" en degradado oro (.text-gold-gradient, definido en index.css).
   Los degradados van con `style` inline porque en Tailwind v4 `bg-gradient-to-br`
   pasó a llamarse `bg-linear-to-br`; el inline funciona igual sin depender del nombre. */
function Logo() {
    return (
        <Link
            to="/"
            className="flex shrink-0 select-none items-center gap-2.5"
            aria-label="MediStock, ir al inicio"
        >
            <div className="grid h-8 w-8 grid-cols-2 gap-0.5 rotate-45">
                <span
                    className="rounded-[3px]"
                    style={{ background: "linear-gradient(to bottom right, #E6CC83, #BD9233)" }}
                />
                <span className="rounded-[3px] bg-plum-700" />
                <span className="rounded-[3px] bg-grape-500" />
                <span
                    className="rounded-[3px]"
                    style={{ background: "linear-gradient(to bottom right, #D4AF52, #9C7522)" }}
                />
            </div>
            <span className="leading-none">
                <span className="block font-display text-[26px] font-bold tracking-tight text-plum-700">
                    Medi<span className="text-gold-gradient font-bold">Stock</span>
                </span>
                <span className="block text-[9.5px] font-semibold tracking-[0.26em] text-gold-600">
                    SUMINISTROS MÉDICOS
                </span>
            </span>
        </Link>
    )
}

/* ── Menú de cuenta: con sesión → al panel del rol · sin sesión → login en popover ─ */
function AccountMenu() {
    const status = useAuthStore((s) => s.status)
    const rol = useAuthStore((s) => s.rol)
    const [open, setOpen] = useState(false)
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

    // Con sesión iniciada no tiene sentido mostrar el login: va al panel del rol.
    if (status === "authenticated") {
        return (
            <Link
                to={homeByRole(rol)}
                className="flex flex-col items-center gap-0.5 text-grape-700 transition-colors hover:text-plum-700"
            >
                <User className="h-5 w-5" />
                <span className="text-[11px] font-semibold">Mi cuenta</span>
            </Link>
        )
    }

    return (
        <div className="relative" ref={ref}>
            <button
                ref={btnRef}
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="dialog"
                aria-expanded={open}
                className="flex flex-col items-center gap-0.5 rounded-md text-grape-700 transition-colors hover:text-plum-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-grape-500"
            >
                <User className="h-5 w-5" />
                <span className="text-[11px] font-semibold">Mi cuenta</span>
            </button>

            {open && (
                <div
                    role="dialog"
                    aria-label="Iniciar sesión"
                    className="absolute right-0 top-[calc(100%+14px)] z-50 w-[360px] overflow-hidden rounded-xl bg-white shadow-lift ring-1 ring-gold-300/70"
                >
                    <div className="h-1.5 gold-rule" />
                    <div className="p-5">
                        <LoginForm />
                        <p className="mt-4 text-center text-[13px] text-grape-600">
                            ¿No tienes cuenta?{" "}
                            <Link
                                to="/registro"
                                onClick={() => setOpen(false)}
                                className="font-bold text-gold-600 hover:text-plum-700"
                            >
                                Crear una cuenta
                            </Link>
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

function StoreHeader() {
    const navigate = useNavigate()
    const [term, setTerm] = useState("")
    const { total } = useCartTotal()

    const onSearch = (e: FormEvent) => {
        e.preventDefault()
        const q = term.trim()
        navigate(q ? `/catalogo?search=${encodeURIComponent(q)}` : "/catalogo")
    }

    return (
        <header className="sticky top-0 z-40 shadow-card">
            {/* ── Barra utilitaria ─────────────────────────────────────────── */}
            <div className="bg-plum-800 text-[12.5px] text-white/80">
                <div className="mx-auto flex h-9 max-w-[1280px] items-center justify-end gap-5 px-5">
                    <span className="flex items-center gap-1.5">
                        <button type="button" className="font-semibold text-white">Español</button>
                        <span className="text-white/30">|</span>
                        <button type="button" className="transition-colors hover:text-white">English</button>
                    </span>
                    <a href="#" className="hidden items-center gap-1.5 transition-colors hover:text-white sm:flex">
                        <Phone className="h-3.5 w-3.5" /> Contáctanos
                    </a>
                    <a href="#" className="flex items-center gap-1.5 transition-colors hover:text-white">
                        <HelpCircle className="h-3.5 w-3.5" /> Ayuda
                    </a>
                </div>
            </div>

            {/* ── Barra principal: logo + buscador + accesos ───────────────── */}
            <div className="border-b border-border bg-surface">
                <div className="mx-auto flex h-[68px] max-w-[1280px] items-center gap-4 px-5 sm:gap-8">
                    <Logo />

                    <form onSubmit={onSearch} className="hidden flex-1 items-center md:flex">
                        <div className="flex w-full items-stretch overflow-hidden rounded-lg bg-white ring-1 ring-grape-200 focus-within:ring-2 focus-within:ring-plum-500">
                            <input
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                                placeholder="¿Qué suministro necesitas hoy?"
                                aria-label="Buscar productos"
                                className="flex-1 px-4 text-[14px] outline-none placeholder:text-grape-400"
                            />
                            <button
                                type="submit"
                                aria-label="Buscar"
                                className="grid place-items-center bg-plum-700 px-5 text-white transition-colors hover:bg-plum-800"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </div>
                    </form>

                    <nav className="ml-auto flex items-center gap-5 text-grape-700 sm:gap-7">
                        <MainMenu />
                        <Link to="/catalogo" className="flex flex-col items-center gap-0.5 transition-colors hover:text-plum-700">
                            <Store className="h-5 w-5" />
                            <span className="text-[11px] font-semibold">Tienda</span>
                        </Link>
                        <AccountMenu />
                    </nav>
                </div>
            </div>

            {/* ── Sub-barra: sesión + pedido (con mini-carrito en hover) ───── */}
            <div className="border-b border-border bg-surface">
                <div className="mx-auto flex h-11 max-w-[1280px] items-center justify-between px-5 text-[13px]">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="flex items-center gap-2 rounded-md bg-plum-700 px-3.5 py-1.5 font-semibold text-white transition-colors hover:bg-plum-800"
                        >
                            <User className="h-4 w-4" /> Ingresar
                        </Link>
                        <Link to="/registro" className="font-medium text-plum-700 transition-colors hover:text-gold-600">
                            Crear una cuenta en línea
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-grape-600">
                            Mi pedido: <span className="font-bold text-plum-700">{formatCLP(total)}</span>
                        </span>
                        <CartMenu />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default PublicLayout
