import { Navigate, Outlet, useLocation } from "react-router"
import { useAuthStore } from "@/store/authStore"
import { Spinner } from "@/components/ui"


export function PrivateRoute() {
    const status   = useAuthStore((s) => s.status)
    const location = useLocation()

    if (status === "idle" || status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        )
    }

    if (status === "guest") {
        // `from` permite volver a donde iba tras loguear (lo usa useLogin)
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <Outlet />
}