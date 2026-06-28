// src/components/common/BackButton.tsx
// Botón "Volver" reusable. Usa el historial del router para devolver al usuario
// a la URL anterior exacta (incluye query string: filtros, paginación, etc.).
//
// Por qué `location.key === 'default'` decide el fallback:
//   En React Router cada navegación SPA produce una `key` distinta. Cuando el
//   usuario abre /producto/X directo (deep link, pestaña nueva, refresh tras
//   navegar fuera), `location.key === 'default'` → no hay historial SPA al que
//   volver, así que `navigate(-1)` saldría del sitio. En ese caso vamos al
//   fallback (por defecto, /catalogo).

import { useLocation, useNavigate } from 'react-router';
import { cn } from '@/utils/cn';

interface BackButtonProps {
    /** Ruta a la que ir si no hay historial SPA. Por defecto /catalogo. */
    fallback?: string;
    /** Texto del botón. */
    label?: string;
    /** Clases extra para el contenedor del botón. */
    className?: string;
}

export function BackButton({
                               fallback = '/catalogo',
                               label = 'Volver',
                               className,
                           }: BackButtonProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = () => {
        if (location.key === 'default') {
            navigate(fallback);
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                'inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-grape-600 hover:text-plum-700 transition-colors',
                className,
            )}
            aria-label={label}
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
            </svg>
            {label}
        </button>
    );
}
