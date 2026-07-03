// src/features/admin/components/InicioBanner.tsx
// T4.1 (visual) — Franja superior del Inicio del Admin: saludo + SantiagoClock
// sobre fondo degradado plum→grape, calcado del banner "PANEL OPERATIVO" de la
// maqueta (admin-home.jsx). El nombre sale del authStore con el mismo patrón
// que ya usa AppShell.tsx (datosBasicosPerfil), así que si el usuario no tiene
// nombre cargado cae a "Administrador" en vez de mostrar vacío.
//
// Usa <SantiagoClock dark /> (variante agregada a SantiagoClock.tsx) para que
// la hora/fecha sean legibles sobre este fondo oscuro; el modo claro original
// del componente no cambió.

import { SantiagoClock } from '@/components/common/SantiagoClock';
import { useAuthStore } from '@/store/authStore.ts';
import { datosBasicosPerfil } from '@/types/auth.ts';

export interface InicioBannerProps {
    /** Pedidos pendientes de revisión (de useAdminKpis). */
    pedidosPendientes: number;
}

export function InicioBanner({ pedidosPendientes }: InicioBannerProps) {
    const user = useAuthStore((s) => s.user);
    const { first_name } = user ? datosBasicosPerfil(user) : { first_name: '' };
    const nombre = first_name.trim() || 'Administrador';

    const mensaje =
        pedidosPendientes === 0
            ? 'No hay pedidos pendientes de revisión.'
            : `${pedidosPendientes} ${pedidosPendientes === 1 ? 'pedido espera' : 'pedidos esperan'} tu revisión.`;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-plum-800 via-plum-700 to-grape-600 shadow-lift ring-1 ring-gold-400/40">
            <div className="gold-rule absolute inset-x-0 top-0 h-[3px]" aria-hidden="true" />
            <div className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-gold-400/10" aria-hidden="true" />
            <div className="relative flex flex-col justify-between gap-5 px-7 py-6 sm:flex-row sm:items-center">
                <div>
                    <p className="text-[12px] font-bold tracking-[0.18em] text-gold-300">
                        PANEL OPERATIVO
                    </p>
                    <h2 className="mt-1 font-display text-[28px] font-bold leading-tight text-white">
                        Buen día, {nombre} 👋
                    </h2>
                    <p className="mt-1 text-[13px] text-grape-100/80">{mensaje}</p>
                </div>
                <div className="sm:text-right">
                    <SantiagoClock dark />
                </div>
            </div>
        </div>
    );
}
