// src/features/integrations/components/ConfirmRevocarModal.tsx
// T4.5 — Confirmación de acción destructiva: revocar una API Key. Revocar
// desactiva la key de inmediato; cualquier ERP que la use dejará de poder
// consumir la API (401/403). Por eso se pide confirmación explícita.

import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Alert,
} from '@/components/ui';
import type { ApiClientVM } from '../types/apiClient';

interface ConfirmRevocarModalProps {
    /** La key a revocar, o null si el modal está cerrado. */
    target: ApiClientVM | null;
    onCancel: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

const TITLE_ID = 'confirm-revocar-title';

export function ConfirmRevocarModal({
    target,
    onCancel,
    onConfirm,
    loading = false,
}: ConfirmRevocarModalProps) {
    return (
        <Modal open={target !== null} onClose={onCancel} size="md" titleId={TITLE_ID}>
            <ModalHeader id={TITLE_ID}>Revocar API Key</ModalHeader>

            <ModalBody className="space-y-4">
                <Alert variant="error" role="alert">
                    Esta acción es inmediata. La key dejará de funcionar al instante;
                    podrás reactivarla después, pero no recuperar la misma cadena.
                </Alert>
                {target && (
                    <p className="text-sm text-text">
                        Vas a revocar la key de{' '}
                        <span className="font-semibold">{target.institucion}</span>
                        {target.nombre ? ` (${target.nombre})` : ''}. Cualquier ERP que la
                        esté usando dejará de poder consumir la API.
                    </p>
                )}
            </ModalBody>

            <ModalFooter>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text transition hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                    {loading ? 'Revocando…' : 'Sí, revocar'}
                </button>
            </ModalFooter>
        </Modal>
    );
}
