// features/orders/components/PedidoEditForm.tsx
// T2.10 — Edición acotada del pedido. Por contrato del caso, el cliente solo puede
// editar mientras el pedido está PENDIENTE; esta restricción la aplica la PÁGINA
// (renderiza este form solo en ese estado). El form, además, se autoprotege con `soloPendiente`.
//
// Campo editable: `observacion`. Es el único campo seguro de tocar sin reabrir el
// recálculo de stock/montos del backend (editar líneas exigiría revalidación de stock).
//
// NOTA DE SUPUESTO: se asume que `EditarPedido` admite `observacion?: string`.
// Si el tipo real difiere, ajustar el payload (1 línea) según features/orders/types.

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Textarea, useToast } from '@/components/ui';
import { makeFormErrorHandler } from '@/utils/notifyApiError';
import type { Pedido } from '@/types/models';
import type { EditarPedido } from '../types';
import { useEditarPedido } from '../hooks/useEditarPedido';

const schema = z.object({
    observacion: z.string().max(500, 'Máximo 500 caracteres.'),
});

type FormValues = z.infer<typeof schema>;

export function PedidoEditForm({ pedido }: { pedido: Pedido }) {
    const { toast } = useToast();
    const editar = useEditarPedido(String(pedido.id));

    const soloPendiente = pedido.estado === 'PENDIENTE';

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { observacion: pedido.observacion ?? '' },
    });

    const onSubmit = (values: FormValues) => {
        if (!soloPendiente) return; // guardia: nunca editar fuera de PENDIENTE
        const payload: EditarPedido = { observacion: values.observacion.trim() };
        editar.mutate(payload, {
            onSuccess: () => {
                toast({
                    title: 'Pedido actualizado',
                    description: 'Tus cambios se guardaron correctamente.',
                    variant: 'success',
                });
                form.reset(values); // limpia estado dirty con los valores guardados
            },
            onError: makeFormErrorHandler(form.setError, toast),
        });
    };

    if (!soloPendiente) {
        return (
            <p className="text-[13px] text-grape-500">
                Este pedido ya no se puede editar (solo es editable mientras está{' '}
                <span className="font-semibold text-grape-700">Pendiente</span>).
            </p>
        );
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" noValidate>
            <Textarea
                label="Observación"
                placeholder="Instrucciones de entrega, referencias, etc."
                rows={3}
                error={form.formState.errors.observacion?.message}
                {...form.register('observacion')}
            />

            <div className="flex items-center gap-3">
                <Button
                    type="submit"
                    disabled={editar.isPending || !form.formState.isDirty}
                >
                    {editar.isPending ? 'Guardando…' : 'Guardar cambios'}
                </Button>
                {form.formState.isDirty && !editar.isPending && (
                    <button
                        type="button"
                        onClick={() => form.reset()}
                        className="text-[13px] text-grape-500 hover:text-plum-700"
                    >
                        Descartar
                    </button>
                )}
            </div>
        </form>
    );
}
