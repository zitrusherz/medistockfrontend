import { useForm } from 'react-hook-form';
import type { Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { accountsService } from '../services/accountsService';
import { useRegionesConComunas } from '@/features/locations/hooks/useRegionesConComunas';
import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui';
import { notifyApiError } from '@/utils/notifyApiError';
import { isPhoneCL, isValidRut, formatRut } from '@/utils/validators';
import type { ApiError } from '@/lib/axios';
import type { RegistroClienteRequest } from '../types';

/* -------------------------------------------------------------------------- */
/*  Esquema de validación (zod)                                               */
/* -------------------------------------------------------------------------- */

/**
 * `region` y `comuna` guardan IDs como string (los `value` de un <select> son
 * siempre string). La región es solo filtro para poblar comunas: NO se envía
 * al backend; lo que viaja es `comuna` (su ID, convertido a number).
 *
 * `pass` usa mínimo 6 (criterio del caso/maqueta). Si el backend exige más,
 * ajusta el `.min()` aquí y el placeholder del campo en RegisterForm.
 */
export const registerSchema = z
    .object({
        nombre: z.string().trim().min(1, 'Ingresa tu nombre'),
        apellido: z.string().trim().min(1, 'Ingresa tu apellido'),
        correo: z
            .string()
            .trim()
            .min(1, 'Ingresa tu correo')
            .email('Ingresa un correo válido'),
        telefono: z
            .string()
            .trim()
            .min(1, 'Ingresa tu teléfono')
            .refine(isPhoneCL, 'Teléfono chileno inválido (ej: +56912345678)'),
        rut: z
            .string()
            .trim()
            .min(1, 'Ingresa tu RUT')
            .refine(isValidRut, 'RUT inválido'),
        region: z.string().min(1, 'Selecciona una región'),
        comuna: z.string().min(1, 'Selecciona una comuna'),
        calle: z.string().trim().min(1, 'Ingresa la dirección'),
        numero: z.string().trim().min(1, 'Ingresa el número'),
        detalle: z.string().trim().optional(),
        referencia: z.string().trim().optional(),
        pass: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
        pass2: z.string().min(1, 'Repite tu contraseña'),
    })
    .refine((d) => d.pass === d.pass2, {
        path: ['pass2'],
        message: 'Las contraseñas no coinciden',
    });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/* -------------------------------------------------------------------------- */
/*  Builder del payload (form plano → request anidado de la API)              */
/* -------------------------------------------------------------------------- */

/**
 * Arma el cuerpo de POST /accounts/registro/cliente/ a partir del form plano.
 *
 * Decisiones (documentadas en T2.6_NOTAS.md):
 *  - `username = correo`: el form B2C no pide username y la API lo exige.
 *  - `tipo_cliente = 'PARTICULAR'`: registro de paciente particular (B2C).
 *  - `rut` se envía formateado ("12.345.678-9"). Si tu backend guarda limpio,
 *    cambia `formatRut(v.rut)` por `cleanRut(v.rut)`.
 *  - `comuna` viaja como ID (number); la región NO se envía (es derivable).
 */
function buildRegistroCliente(v: RegisterFormValues): RegistroClienteRequest {
    return {
        usuario: {
            username: v.correo.trim(),
            email: v.correo.trim(),
            first_name: v.nombre.trim(),
            last_name: v.apellido.trim(),
            password: v.pass,
            password2: v.pass2,
        },
        tipo_cliente: 'PARTICULAR',
        rut: formatRut(v.rut),
        telefono: v.telefono.trim(),
        direccion_entrega: {
            direccion: v.calle.trim(),
            num_direccion: v.numero.trim(),
            detalle_direccion: v.detalle?.trim() || undefined,
            comuna: Number(v.comuna),
            referencia: v.referencia?.trim() || undefined,
            es_principal: true,
        },
    };
}

/* -------------------------------------------------------------------------- */
/*  Mapeo de errores del backend → campos del formulario                      */
/* -------------------------------------------------------------------------- */

/**
 * Traduce claves de error que el backend devuelve a nivel "plano" hacia los
 * nombres de campo del formulario. Si el backend devuelve errores ANIDADOS
 * (p. ej. `{ usuario: { email: [...] } }`), `toApiError` no los aplana, así que
 * caerán a un toast genérico; ajusta este mapa si confirmas la forma real.
 */
const SERVER_TO_FORM: Record<string, Path<RegisterFormValues>> = {
    email: 'correo',
    username: 'correo',
    rut: 'rut',
    telefono: 'telefono',
    password: 'pass',
    password2: 'pass2',
    first_name: 'nombre',
    last_name: 'apellido',
    comuna: 'comuna',
    direccion: 'calle',
    num_direccion: 'numero',
};

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

export function useRegisterForm() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const login = useAuthStore((s) => s.login);
    const loadProfile = useAuthStore((s) => s.loadProfile);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            nombre: '',
            apellido: '',
            correo: '',
            telefono: '',
            rut: '',
            region: '',
            comuna: '',
            calle: '',
            numero: '',
            detalle: '',
            referencia: '',
            pass: '',
            pass2: '',
        },
    });

    const {
        regiones,
        getComunas,
        isLoading: loadingRegiones,
        isError: errorRegiones,
    } = useRegionesConComunas();

    // Select dependiente: las comunas dependen de la región elegida.
    const regionValue = form.watch('region');
    const regionSelected = Boolean(regionValue);
    const comunas = getComunas(regionValue ? Number(regionValue) : null);

    const mutation = useMutation({
        mutationFn: (values: RegisterFormValues) =>
            accountsService.registrarCliente(buildRegistroCliente(values)),

        onSuccess: async (_res, values) => {
            // Auto-login: registramos con username = correo, así que iniciamos
            // sesión con esas mismas credenciales. Si falla (p. ej. el backend
            // pide verificación de correo), la cuenta YA quedó creada: avisamos
            // y mandamos a /login.
            try {
                const tokens = await authService.login({
                    username: values.correo.trim(),
                    password: values.pass,
                });
                login(tokens.access, tokens.refresh);
                await loadProfile();

                if (useAuthStore.getState().status === 'authenticated') {
                    navigate('/catalogo', { replace: true });
                    return;
                }
            } catch {
                /* sigue al fallback de abajo */
            }

            toast({
                title: 'Cuenta creada',
                description: 'Tu cuenta se creó correctamente. Inicia sesión para continuar.',
            });
            navigate('/login', { replace: true });
        },

        onError: (err) => {
            const apiErr = err as ApiError;

            // 400 con errores por campo → pintarlos junto al input.
            if (apiErr.hasFieldErrors && apiErr.fieldErrors) {
                let firstField: Path<RegisterFormValues> | null = null;
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
                    toast({
                        title: 'Revisa los datos',
                        description: unmapped.join(' '),
                    });
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
        // Datos para los selects dependientes
        regiones,
        comunas,
        regionSelected,
        loadingRegiones,
        errorRegiones,
    };
}
