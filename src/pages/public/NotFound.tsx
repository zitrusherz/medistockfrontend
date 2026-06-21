// src/pages/public/NotFound.tsx — ruta: * (catch-all 404)
// Apéndice D #2 — Pantalla 404 del catch-all. Sin chrome interno (no DashboardLayout).
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
        <main className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
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
        </main>
    )
}
