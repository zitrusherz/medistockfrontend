// src/features/admin/components/PendingActionCard.tsx
// T4.1 (visual) — Tarjeta de acción pendiente para el Inicio del Admin, calcada
// del `PendingCard` de la maqueta (admin-home.jsx). Es DISTINTA del StatCard
// genérico a propósito: acá el tono vive en un icono cuadrado degradado (no en
// un borde izquierdo) y la tarjeta completa es clickeable cuando recibe onClick.
// No reemplaza a StatCard en el resto de la app — solo se usa en Inicio.

import type { ReactNode } from 'react';

export type PendingActionTone = 'plum' | 'gold' | 'azure' | 'rose' | 'neutral';

const TONES: Record<PendingActionTone, string> = {
    plum: 'from-plum-700 to-grape-600',
    gold: 'from-gold-400 to-gold-500',
    azure: 'from-azure-600 to-azure-500',
    rose: 'from-rose-400 to-rose-500',
    neutral: 'from-grape-300 to-grape-400',
};

export interface PendingActionCardProps {
    icon: ReactNode;
    label: string;
    value: ReactNode;
    hint?: string;
    tone?: PendingActionTone;
    /** Si se pasa, la tarjeta completa se vuelve un <button> navegable. */
    onClick?: () => void;
}

export function PendingActionCard({
    icon,
    label,
    value,
    hint,
    tone = 'plum',
    onClick,
}: PendingActionCardProps) {
    const interactive = Boolean(onClick);
    const Tag = interactive ? 'button' : 'div';

    return (
        <Tag
            type={interactive ? 'button' : undefined}
            onClick={onClick}
            className={[
                'group rounded-2xl border border-border bg-surface p-5 text-left shadow-card transition-shadow',
                interactive ? 'cursor-pointer hover:shadow-lift' : '',
            ].join(' ')}
        >
            <div className="flex items-start justify-between">
                <div
                    className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${TONES[tone]} text-white`}
                    aria-hidden="true"
                >
                    {icon}
                </div>
                {interactive && (
                    <span className="text-[18px] text-grape-300 transition-colors group-hover:text-gold-500">
                        →
                    </span>
                )}
            </div>
            <p className="mt-4 font-display text-[30px] font-bold leading-none text-plum-700">
                {value}
            </p>
            <p className="mt-1.5 text-[13px] font-semibold text-grape-600">{label}</p>
            {hint && <p className="mt-0.5 text-[11.5px] text-grape-400">{hint}</p>}
        </Tag>
    );
}
