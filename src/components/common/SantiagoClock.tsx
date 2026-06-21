// components/common/SantiagoClock.tsx
// T4.1 — Reloj en vivo en zona America/Santiago (independiente de la zona del
// navegador). Tic cada segundo, limpia el intervalo al desmontar. Pensado para
// el banner de Inicio del Admin, pero es genérico (acepta className).

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

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
}

export function SantiagoClock({ className = '', soloHora = false }: SantiagoClockProps) {
    const [ahora, setAhora] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setAhora(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <div
            className={`flex items-center gap-2 text-text ${className}`}
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
