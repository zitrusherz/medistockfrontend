// src/pages/public/NotFound.tsx — ruta: * (catch-all 404)
// FIX Bug 2: ahora se monta DENTRO de PublicLayout (ver router/index.tsx), por lo
// que la pantalla 404 conserva el header/navbar de la tienda. Se usa <section>
// (no <main>) para no anidar dos <main> dentro del layout, y min-h-[70vh] en
// lugar de min-h-screen porque ya hay header sticky arriba.
// El botón vuelve a un home válido según sesión: home del rol si hay sesión, o "/".

import { useNavigate } from "react-router"
import { EmptyState } from "@/components/common/EmptyState"
import { Button } from "@/components/ui"
import { useAuthStore } from "@/store/authStore"
import { homeByRole } from "@/router/homeByRole"

export default function NotFound() {
    const rol = useAuthStore((s) => s.rol)
    const navigate = useNavigate()
    const destino = homeByRole(rol) // null → "/"

    return (
        <section className="flex min-h-[70vh] items-center justify-center px-4 py-16">
            <div className="w-full max-w-md text-center">
                <p
                    className="font-display text-7xl font-bold text-gold-gradient"
                    aria-hidden="true"
                >
                    404
                </p>
                <div className="mt-4">
                    <EmptyState
                        title="La página que buscas no existe"
                        description="Es posible que el enlace esté roto o que la página se haya movido."
                        action={
                            <Button onClick={() => navigate(destino)}>
                                Volver al inicio
                            </Button>
                        }
                    />
                </div>
            </div>
        </section>
    )
}
