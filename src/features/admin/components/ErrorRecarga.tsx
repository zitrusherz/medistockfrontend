

import { Button } from '@/components/ui';

export function ErrorRecarga({
    mensaje = 'No pudimos cargar el panel. Revisa la conexión e inténtalo de nuevo.',
    onRetry,
}: {
    mensaje?: string;
    onRetry: () => void;
}) {
    return (
        <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3"
        >
            <p className="text-sm text-danger-strong">{mensaje}</p>
            <Button variant="ghost" onClick={onRetry}>
                Reintentar
            </Button>
        </div>
    );
}
