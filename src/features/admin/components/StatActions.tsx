

import { Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui';

export interface StatActionsProps {
    /** Abre el modal de detalle. Si se omite, no se muestra el botón. */
    onDetalle?: () => void;
    /** Dispara la descarga del CSV. */
    onExport: () => void;
}

export function StatActions({ onDetalle, onExport }: StatActionsProps) {
    return (
        <div className="flex items-center gap-2">
            {onDetalle && (
                <Button variant="ghost" size="sm" onClick={onDetalle}>
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    Detalles
                </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Exportar CSV
            </Button>
        </div>
    );
}
