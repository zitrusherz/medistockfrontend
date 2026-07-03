

import { useForm } from 'react-hook-form';
import type { Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { integrationsService } from '../services/integrationsService';
import { useToast } from '@/components/ui';
import { notifyApiError } from '@/utils/notifyApiError';
import type { ApiError } from '@/lib/axios';
import type {
    CrearApiClientRequest,
    CrearApiClientResponse,
} from '../types';

/* -------------------------------------------------------------------------- */
/*  Esquema (zod)                                                             */
/*  Los <select>/<input> entregan SIEMPRE string; validamos string y          */
/*  convertimos en el builder (mismo criterio que useWorkerForm con el rol).  */
/* -------------------------------------------------------------------------- */

export const crearApiClientSchema = z.object({
    institucionId: z.string().min(1, 'Selecciona una institución'),
    nombre: z
        .string()
        .trim()
        .min(1, 'Ingresa un nombre para identificar la integración')
        .max(120, 'Máximo 120 caracteres'),
    // Opcional. Si viene, debe ser entero > 0.
    limite: z
        .string()
        .trim()
        .optional()
        .refine(
            (v) => !v || (/^\d+$/.test(v) && Number(v) > 0),
            'Debe ser un número entero mayor a 0',
        ),
    // type="date" → "YYYY-MM-DD". Vacío = sin expiración.
    expira: z.string().trim().optional(),
});

export type CrearApiClientFormValues = z.infer<typeof crearApiClientSchema>;

/* -------------------------------------------------------------------------- */
/*  Builder (form plano → request de la API)                                  */
/* -------------------------------------------------------------------------- */

function buildCrearApiClient(
    v: CrearApiClientFormValues,
): CrearApiClientRequest {
    return {
        institucion_id: Number(v.institucionId),
        nombre_cliente_api: v.nombre.trim(),
        limite_requests_diario: v.limite ? Number(v.limite) : undefined,
        // Fin del día local → ISO 8601 (UTC). Sin valor = key sin expiración.
        fecha_expiracion: v.expira
            ? new Date(`${v.expira}T23:59:59`).toISOString()
            : undefined,
    };
}

/* -------------------------------------------------------------------------- */
/*  Mapeo de errores backend → campos del formulario                          */
/* -------------------------------------------------------------------------- */

const SERVER_TO_FORM: Record<string, Path<CrearApiClientFormValues>> = {
    institucion_id: 'institucionId',
    institucion: 'institucionId',
    nombre_cliente_api: 'nombre',
    limite_requests_diario: 'limite',
    fecha_expiracion: 'expira',
};

const DEFAULTS: CrearApiClientFormValues = {
    institucionId: '',
    nombre: '',
    limite: '',
    expira: '',
};

interface UseCrearApiClientArgs {
    /** Se invoca con la respuesta (incluye `api_key`) tras crear con éxito. */
    onCreated?: (res: CrearApiClientResponse) => void;
}

export function useCrearApiClient({ onCreated }: UseCrearApiClientArgs = {}) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const form = useForm<CrearApiClientFormValues>({
        resolver: zodResolver(crearApiClientSchema),
        defaultValues: DEFAULTS,
    });

    const mutation = useMutation({
        mutationFn: (values: CrearApiClientFormValues) =>
            integrationsService.crearApiClient(buildCrearApiClient(values)),

        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['apiClients'] });
            toast({
                title: 'API Key creada',
                description: `${res.institucion}: cópiala ahora, no se vuelve a mostrar.`,
            });
            form.reset(DEFAULTS);
            onCreated?.(res);
        },

        onError: (err) => {
            const apiErr = err as ApiError;

            // 400 con errores por campo → pintarlos junto al input.
            if (apiErr.hasFieldErrors && apiErr.fieldErrors) {
                let firstField: Path<CrearApiClientFormValues> | null = null;
                const unmapped: string[] = [];

                Object.entries(apiErr.fieldErrors).forEach(([serverKey, msgs]) => {
                    const formField = SERVER_TO_FORM[serverKey];
                    const message = msgs?.[0] ?? 'Dato inválido';
                    if (formField) {
                        form.setError(formField, { type: 'server', message });
                        if (!firstField) firstField = formField;
                    } else {
                        unmapped.push(message);
                    }
                });

                if (firstField) form.setFocus(firstField);
                if (unmapped.length > 0) {
                    toast({ title: 'Revisa los datos', description: unmapped.join(' ') });
                }
                return;
            }

            // Todo lo demás (red, 409, 500, 502, etc.) → toast.
            notifyApiError(apiErr, toast);
        },
    });

    const onSubmit = form.handleSubmit((values) => mutation.mutate(values));

    return {
        form,
        onSubmit,
        isSubmitting: mutation.isPending,
    };
}
