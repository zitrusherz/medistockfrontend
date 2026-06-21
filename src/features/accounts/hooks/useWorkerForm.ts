// src/features/accounts/hooks/useWorkerForm.ts
// T4.3 — Lógica del alta de trabajador (espejo de useRegisterForm). Valida con
// zod, arma el payload de POST /accounts/registro/trabajador/ y, al éxito,
// invalida la lista para que la tabla muestre la nueva cuenta. Los errores 400
// por campo se pintan junto al input; el resto cae a toast.

import { useForm } from 'react-hook-form';
import type { Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { accountsService } from '../services/accountsService';
import { WORKER_ROLES, rolLabel, type WorkerRol } from '../roles';
import { useToast } from '@/components/ui';
import { notifyApiError } from '@/utils/notifyApiError';
import { isPhoneCL, isValidRut, formatRut } from '@/utils/validators';
import type { ApiError } from '@/lib/axios';
import type { RegistroTrabajadorRequest } from '../types';

/* -------------------------------------------------------------------------- */
/*  Esquema de validación (zod)                                               */
/* -------------------------------------------------------------------------- */

/**
 * `rol` se valida como string (los `value` de un <select> son siempre string).
 * `pass` usa mínimo 6 (criterio del
 * caso). Si tu backend exige más, ajusta el `.min()` aquí y el placeholder.
 *
 * NOTA contraseña: el tipo `UsuarioRegistro` exige password + password2, así que
 * el alta pide clave en el POST. Si tu backend en cambio envía invitación por
 * correo (el trabajador define su clave), elimina pass/pass2 de este esquema y
 * del builder, y quita los campos del WorkerForm.
 */
export const workerSchema = z
    .object({
        nombre: z.string().trim().min(1, 'Ingresa el nombre'),
        apellido: z.string().trim().min(1, 'Ingresa el apellido'),
        correo: z
            .string()
            .trim()
            .min(1, 'Ingresa el correo corporativo')
            .email('Ingresa un correo válido'),
        rut: z
            .string()
            .trim()
            .min(1, 'Ingresa el RUT')
            .refine(isValidRut, 'RUT inválido'),
        rol: z
            .string()
            .min(1, 'Selecciona un rol')
            // NO usar el type-guard `isWorkerRol` aquí: su firma `v is WorkerRol`
            // hace que zod ESTRECHE el output a la unión, dejando z.input='' (string)
            // y z.output=WorkerRol distintos → rompe DEFAULTS y el Resolver de RHF.
            // `.includes` devuelve boolean puro: input === output === string.
            .refine((v) => (WORKER_ROLES as readonly string[]).includes(v), 'Rol inválido'),
        telefono: z
            .string()
            .trim()
            .optional()
            .refine((v) => !v || isPhoneCL(v), 'Teléfono chileno inválido (ej: +56912345678)'),
        pass: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
        pass2: z.string().min(1, 'Repite la contraseña'),
    })
    .refine((d) => d.pass === d.pass2, {
        path: ['pass2'],
        message: 'Las contraseñas no coinciden',
    });

export type WorkerFormValues = z.infer<typeof workerSchema>;

/* -------------------------------------------------------------------------- */
/*  Builder del payload (form plano → request de la API)                      */
/*                                                                            */
/*  ⭐ M4 — AQUÍ se decide cómo viaja el rol. Mandamos `rol` explícito (enum   */
/*  del caso) y, por compatibilidad, `cargo` con su etiqueta humana. Si tu     */
/*  backend espera el rol anidado en `usuario`, como `grupo`, o lo deriva del   */
/*  `cargo`, este es el ÚNICO lugar a cambiar.                                  */
/* -------------------------------------------------------------------------- */

function buildRegistroTrabajador(v: WorkerFormValues): RegistroTrabajadorRequest {
    const rol = v.rol as WorkerRol;
    return {
        usuario: {
            // username = correo (el form no pide username y la API lo exige).
            username: v.correo.trim(),
            email: v.correo.trim(),
            first_name: v.nombre.trim(),
            last_name: v.apellido.trim(),
            password: v.pass,
            password2: v.pass2,
        },
        rut: formatRut(v.rut),
        telefono: v.telefono?.trim() || undefined,
        rol, // carrier principal del rol (M4)
        cargo: rolLabel(rol), // respaldo si el backend mapea por cargo
    };
}

/* -------------------------------------------------------------------------- */
/*  Mapeo de errores del backend → campos del formulario                      */
/* -------------------------------------------------------------------------- */

const SERVER_TO_FORM: Record<string, Path<WorkerFormValues>> = {
    email: 'correo',
    username: 'correo',
    first_name: 'nombre',
    last_name: 'apellido',
    rut: 'rut',
    telefono: 'telefono',
    rol: 'rol',
    cargo: 'rol',
    password: 'pass',
    password2: 'pass2',
};

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

const DEFAULTS: WorkerFormValues = {
    nombre: '',
    apellido: '',
    correo: '',
    rut: '',
    rol: '',
    telefono: '',
    pass: '',
    pass2: '',
};

export function useWorkerForm() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const form = useForm<WorkerFormValues>({
        resolver: zodResolver(workerSchema),
        defaultValues: DEFAULTS,
    });

    const mutation = useMutation({
        mutationFn: (values: WorkerFormValues) =>
            accountsService.registrarTrabajador(buildRegistroTrabajador(values)),

        onSuccess: (_res, values) => {
            // Refresca la tabla: la nueva cuenta debe aparecer con su rol.
            queryClient.invalidateQueries({ queryKey: ['trabajadores'] });
            toast({
                title: 'Trabajador creado',
                description: `${values.nombre} ${values.apellido} ya puede iniciar sesión como ${rolLabel(values.rol as WorkerRol)}.`,
            });
            form.reset(DEFAULTS);
        },

        onError: (err) => {
            const apiErr = err as ApiError;

            // 400 con errores por campo → pintarlos junto al input.
            if (apiErr.hasFieldErrors && apiErr.fieldErrors) {
                let firstField: Path<WorkerFormValues> | null = null;
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
        /** Opciones del select, ya listas para el <Select> del kit. */
        roleOptions: WORKER_ROLES.map((r) => ({ value: r, label: rolLabel(r) })),
    };
}
