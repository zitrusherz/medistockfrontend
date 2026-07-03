// src/components/common/SantiagoClock.tsx
// T4.1 — Reloj en vivo en zona America/Santiago (independiente de la zona del
// navegador). Tic cada segundo, limpia el intervalo al desmontar. Pensado para
// el banner de Inicio del Admin, pero es genérico (acepta className).
//
// EDICIÓN VISUAL — se agrega la prop `dark`: variante para fondos oscuros
// (banner degradado plum→grape del Inicio admin), calcada del SantiagoClock de
// la maqueta (admin-ui.jsx): hora grande en blanco, fecha en gold-200 + "·
// Santiago, Chile", SIN ícono de reloj (la maqueta no lo trae en esa
// variante). El modo claro (dark=false, default) queda EXACTAMENTE igual que
// antes — cero impacto en otros usos existentes del componente.
//
// Antes se intentaba sobrescribir el color solo con `className` concatenado a
// mano (`text-text ${className}`), lo que no resuelve conflictos de Tailwind
// de forma confiable. Ahora se usa `cn()` (twMerge) y, para el caso oscuro, un
// bloque de estilos propio en vez de intentar "forzar" el claro por encima.

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/utils/cn.ts';

const TZ = 'America/Santiago';

const fmtHora = new Intl.DateTimeFormat('es-CL', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
});

const fmtFecha = new Intl.DateTimeFormat('es-CL', {
    timeZone: TZ,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
});

/** Mayúscula inicial ("sábado" → "Sábado"). */
const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export interface SantiagoClockProps {
    className?: string;
    /** Oculta la línea de fecha y deja solo la hora. */
    soloHora?: boolean;
    /**
     * Variante para fondos oscuros (banner plum→grape del Inicio admin): hora
     * grande en blanco, fecha en gold-200, sin ícono. Default false = estilo
     * claro original (con ícono, para fondos blancos/superficie).
     */
    dark?: boolean;
}

export function SantiagoClock({ className = '', soloHora = false, dark = false }: SantiagoClockProps) {
    const [ahora, setAhora] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setAhora(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    if (dark) {
        return (
            <div className={cn('leading-none', className)} aria-label="Hora de Santiago de Chile">
                <p className="font-display text-[32px] font-bold tabular-nums tracking-tight text-white sm:text-[38px]">
                    {fmtHora.format(ahora)}
                </p>
                {!soloHora && (
                    <p className="mt-1.5 text-[13px] text-gold-200">
                        {capitalizar(fmtFecha.format(ahora))} · Santiago, Chile
                    </p>
                )}
            </div>
        );
    }

    return (
        <div
            className={cn('flex items-center gap-2 text-text', className)}
            aria-label="Hora de Santiago de Chile"
        >
            <Clock className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
            <div className="leading-tight">
                <p className="font-display text-lg font-bold tabular-nums">
                    {fmtHora.format(ahora)}
                </p>
                {!soloHora && (
                    <p className="text-xs text-text-muted">
                        {capitalizar(fmtFecha.format(ahora))}
                    </p>
                )}
            </div>
        </div>
    );
}
