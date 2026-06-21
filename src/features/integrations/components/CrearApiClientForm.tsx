// src/features/integrations/components/CrearApiClientForm.tsx
// T4.5 — Formulario de alta de API Key (espejo de WorkerForm). Presentacional:
// la lógica (zod, payload, mutación, errores) vive en useCrearApiClient. El
// selector de institución REUTILIZA useClientes (solo INSTITUCIONAL) → reúso de
// servicios = IL3.1. Al crear con éxito, el contenedor recibe la respuesta (con
// `api_key`) por onCreated y abre el modal "copia ahora".

import { useMemo } from 'react';
import { Input, Select, Button, Alert } from '@/components/ui';
import { useClientes } from '@/features/accounts/hooks/useClientes';
import { useCrearApiClient } from '../hooks/useCrearApiClient';
import type { CrearApiClientResponse } from '../types';

interface CrearApiClientFormProps {
    onCreated: (res: CrearApiClientResponse) => void;
}

export function CrearApiClientForm({ onCreated }: CrearApiClientFormProps) {
    const { form, onSubmit, isSubmitting } = useCrearApiClient({ onCreated });
    const {
        register,
        formState: { errors },
    } = form;

    const {
        clientes,
        isLoading: cargandoClientes,
        isError: errorClientes,
    } = useClientes();

    // Solo las instituciones pueden tener integración B2B por API Key.
    const institucionOptions = useMemo(
        () =>
            clientes
                .filter((c) => c.tipo === 'INSTITUCIONAL')
                .map((c) => ({ value: String(c.id), label: c.nombre })),
        [clientes],
    );

    const sinInstituciones =
        !cargandoClientes && !errorClientes && institucionOptions.length === 0;

    return (
        <form
            onSubmit={onSubmit}
            noValidate
            aria-label="Crear API Key"
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
        >
            <div className="space-y-4 p-6">
                <div>
                    <h2 className="text-lg font-semibold text-text">Nueva API Key</h2>
                    <p className="mt-1 text-[13px] text-text-muted">
                        Genera una credencial para que el ERP de una clínica consuma la
                        API con el header <code className="font-mono">X-Api-Key</code>.
                    </p>
                </div>

                {errorClientes && (
                    <Alert variant="error" role="alert">
                        No pudimos cargar las instituciones. Recarga e inténtalo de nuevo.
                    </Alert>
                )}
                {sinInstituciones && (
                    <Alert variant="info" role="alert">
                        No hay instituciones registradas. Crea un cliente institucional
                        antes de emitir una API Key.
                    </Alert>
                )}

                <Select
                    label="Institución"
                    required
                    placeholder={
                        cargandoClientes ? 'Cargando…' : 'Selecciona una institución'
                    }
                    options={institucionOptions}
                    disabled={cargandoClientes || sinInstituciones}
                    error={errors.institucionId?.message}
                    {...register('institucionId')}
                />

                <Input
                    label="Nombre de la integración"
                    required
                    placeholder="Ej: ERP Clínica Las Condes"
                    error={errors.nombre?.message}
                    {...register('nombre')}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="Límite diario de requests"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        placeholder="Opcional · 1000 por defecto"
                        error={errors.limite?.message}
                        {...register('limite')}
                    />
                    <Input
                        label="Fecha de expiración"
                        type="date"
                        placeholder="Opcional · sin vencimiento"
                        error={errors.expira?.message}
                        {...register('expira')}
                    />
                </div>

                <Button
                    type="submit"
                    fullWidth
                    loading={isSubmitting}
                    disabled={isSubmitting || sinInstituciones}
                    className="mt-2"
                >
                    {isSubmitting ? 'Generando key…' : 'Generar API Key'}
                </Button>
            </div>
        </form>
    );
}
