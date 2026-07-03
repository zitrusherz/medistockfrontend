// src/components/layout/AuthTopbar.tsx
// Barra superior para pantallas de autenticación (login, registro).
//
// Por qué existe aparte del `Navbar` genérico y del `StoreHeader` de
// PublicLayout: ninguno de los dos calza aquí. `Navbar.tsx` es de propósito
// general (paneles internos) y `StoreHeader` trae buscador + carrito + menú
// de cuenta, que no tienen sentido en la pantalla donde justamente se está
// iniciando sesión. `AuthTopbar` reutiliza el mismo logo/tokens de marca que
// `PublicLayout` (mismo degradado, misma tipografía) para que se sienta como
// una continuación del navbar público, pero reducido a lo que aplica acá:
// marca + volver al inicio.
import { useNavigate, Link } from "react-router"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui"

interface AuthTopbarProps {
    /** Ruta de inicio a la que vuelve el logo y el botón. Por defecto "/". */
    homePath?: string
}

export function AuthTopbar({ homePath = "/" }: AuthTopbarProps) {
    const navigate = useNavigate()

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-surface">
            <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5">
                {/* Logo — mismo patrón visual que <Logo /> en PublicLayout.tsx */}
                <Link
                    to={homePath}
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
                    <span className="font-display text-[21px] font-bold tracking-tight text-plum-700 leading-none">
                        Medi<span className="text-gold-gradient">Stock</span>
                    </span>
                </Link>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    leftSlot={<ArrowLeft className="h-4 w-4" />}
                    onClick={() => navigate(homePath)}
                    aria-label="Volver al inicio"
                >
                    Volver al inicio
                </Button>
            </div>
        </header>
    )
}

export default AuthTopbar
