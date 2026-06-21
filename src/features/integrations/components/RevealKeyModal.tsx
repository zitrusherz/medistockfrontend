// src/features/integrations/components/RevealKeyModal.tsx
// T4.5 — Modal "copia la key AHORA". Es la ÚNICA vez que se ve la key en texto
// plano (al crear o al rotar). Incluye botón copiar, advertencia destacada y un
// snippet cURL listo para la demo: POST /integrations/pedidos/ con header
// X-Api-Key (sin JWT) → demuestra que un ERP externo se abastece solo (201).
// No cierra por overlay para evitar perder la key sin querer.

import { useState } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Alert,
    useToast,
} from '@/components/ui';

interface RevealKeyModalProps {
    open: boolean;
    onClose: () => void;
    institucion: string;
    /** nombre_cliente_api (puede no venir al rotar). */
    nombre?: string;
    /** La key en texto plano. null = nada que mostrar (modal cerrado). */
    apiKey: string | null;
    /** Advertencia del backend ("esta key no se volverá a mostrar"). */
    advertencia?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
const TITLE_ID = 'reveal-key-title';

export function RevealKeyModal({
    open,
    onClose,
    institucion,
    nombre,
    apiKey,
    advertencia,
}: RevealKeyModalProps) {
    const { toast } = useToast();
    const [copiado, setCopiado] = useState<'key' | 'curl' | null>(null);

    const curl = apiKey
        ? [
              `curl -X POST "${API_BASE}/integrations/pedidos/" \\`,
              `  -H "X-Api-Key: ${apiKey}" \\`,
              `  -H "Content-Type: application/json" \\`,
              `  -d '{`,
              `    "sucursal_id": 1,`,
              `    "referencia_erp": "OC-ERP-001",`,
              `    "lineas": [{ "producto_sku": "SKU-001", "cantidad": 2 }]`,
              `  }'`,
          ].join('\n')
        : '';

    async function copiar(texto: string, cual: 'key' | 'curl') {
        try {
            await navigator.clipboard.writeText(texto);
            setCopiado(cual);
            toast({ title: 'Copiado', description: 'Listo en tu portapapeles.' });
            setTimeout(() => setCopiado(null), 2000);
        } catch {
            toast({
                title: 'No se pudo copiar',
                description: 'Selecciona el texto y usa Ctrl/Cmd + C.',
                variant: 'destructive',
            });
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="xl"
            closeOnOverlay={false}
            titleId={TITLE_ID}
        >
            <ModalHeader id={TITLE_ID}>API Key de {institucion}</ModalHeader>

            <ModalBody className="space-y-5">
                <Alert variant="warning" role="alert">
                    {advertencia ??
                        'Copia esta key ahora. Por seguridad no se volverá a mostrar; si la pierdes, deberás rotarla.'}
                </Alert>

                {nombre && (
                    <p className="text-sm text-text-muted">
                        Integración:{' '}
                        <span className="font-semibold text-text">{nombre}</span>
                    </p>
                )}

                {/* La key en texto plano */}
                <div>
                    <span className="mb-1 block text-[13px] font-semibold text-text">
                        API Key
                    </span>
                    <div className="flex items-stretch gap-2">
                        <code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-border bg-surface-muted px-3 py-2.5 font-mono text-sm text-text">
                            {apiKey ?? '—'}
                        </code>
                        <button
                            type="button"
                            onClick={() => apiKey && copiar(apiKey, 'key')}
                            disabled={!apiKey}
                            className="shrink-0 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text transition hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                        >
                            {copiado === 'key' ? 'Copiada ✓' : 'Copiar'}
                        </button>
                    </div>
                </div>

                {/* Snippet de demo (Postman / cURL) */}
                {apiKey && (
                    <div>
                        <div className="mb-1 flex items-center justify-between gap-3">
                            <span className="text-[13px] font-semibold text-text">
                                Probar como ERP (Postman / cURL)
                            </span>
                            <button
                                type="button"
                                onClick={() => copiar(curl, 'curl')}
                                className="rounded text-[13px] font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {copiado === 'curl' ? 'Copiado ✓' : 'Copiar snippet'}
                            </button>
                        </div>
                        <pre className="overflow-x-auto rounded-lg border border-border bg-ink/95 px-3 py-3 font-mono text-[12px] leading-relaxed text-grape-50">
                            {curl}
                        </pre>
                        <p className="mt-2 text-[12px] text-text-muted">
                            Sin JWT: la autenticación es solo el header{' '}
                            <code className="font-mono">X-Api-Key</code>. Responde{' '}
                            <span className="font-semibold">201</span> creando el pedido
                            B2B.
                        </p>
                    </div>
                )}
            </ModalBody>

            <ModalFooter>
                <Button type="button" onClick={onClose}>
                    Ya la copié
                </Button>
            </ModalFooter>
        </Modal>
    );
}
