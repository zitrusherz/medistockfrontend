

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
