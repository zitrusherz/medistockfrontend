// features/orders/components/RechazoModal.tsx
// T3.2 — Captura el motivo obligatorio del rechazo. DoD: rechazo exige comentario
// no vacío. Valida en cliente antes de disparar la mutación; el botón Rechazar
// queda deshabilitado mientras el campo esté vacío o la mutación esté en curso.

import { useState } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Textarea,
} from '@/components/ui';

interface RechazoModalProps {
    open: boolean;
    pedidoId?: string | number;
    loading?: boolean;
    onClose: () => void;
    onConfirm: (comentario: string) => void;
}

export function RechazoModal({
    open,
    pedidoId,
    loading = false,
    onClose,
    onConfirm,
}: RechazoModalProps) {
    const [comentario, setComentario] = useState('');
    const [touched, setTouched] = useState(false);
    const vacio = comentario.trim().length === 0;

    function handleConfirm() {
        setTouched(true);
        if (vacio) return;
        onConfirm(comentario.trim());
    }

    function handleClose() {
        setComentario('');
        setTouched(false);
        onClose();
    }

    return (
        <Modal open={open} onClose={handleClose} size="md" titleId="rechazo-title">
            <ModalHeader id="rechazo-title">Rechazar pedido #{pedidoId}</ModalHeader>

            <ModalBody>
                <p className="mb-3 text-sm text-text-muted">
                    Indica el motivo del rechazo. Queda registrado para trazabilidad.
                </p>
                <Textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    onBlur={() => setTouched(true)}
                    rows={4}
                    placeholder="Ej: stock insuficiente, datos de la institución incompletos…"
                    aria-invalid={touched && vacio}
                />
                {touched && vacio && (
                    <p role="alert" className="mt-1.5 text-xs text-danger">
                        El motivo es obligatorio.
                    </p>
                )}
            </ModalBody>

            <ModalFooter>
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    onClick={handleConfirm}
                    loading={loading}
                    disabled={vacio}
                >
                    Rechazar
                </Button>
            </ModalFooter>
        </Modal>
    );
}
