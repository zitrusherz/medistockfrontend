// src/features/accounts/hooks/useRegisterForm.ts
//
// Registro de cliente B2C/B2B en UNA sola vista. Compatibiliza el form con el
// contrato de POST /accounts/registro/cliente/ (ClienteCreateSerializer) sin
// tocar el backend. Reglas que replica el schema/builder:
//   - tipo_cliente: PARTICULAR | INSTITUCIONAL
//   - documento: rut XOR pasaporte (nunca ambos, nunca ninguno)
//   - INSTITUCIONAL exige rut (no pasaporte) + datos_institucion
//   - PARTICULAR no lleva institución
//   - direccion_entrega siempre obligatoria
// El registro público NO lista instituciones, así que el caso institucional
// SIEMPRE envía datos_institucion (el backend hace get_or_create por rut_empresa);
// no se usa institucion_id.

import { useState } from 'react';
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
import { isPhoneCL, isValidRut, isEmail, formatRut, isStrongPassword } from '@/utils/validators';
import type { ApiError } from '@/lib/axios';
import type { RegistroClienteRequest } from '../types';

/* -------------------------------------------------------------------------- */
/*  Aviso global de envío                                                     */
/*                                                                            */
/*  Se muestra cuando el registro falla por algo que el usuario NO necesita   */
/*  detallar (correo/RUT ya existentes, conflicto, 5xx, etc.). El backend     */
/*  devuelve esos casos como `detail`, `non_field_errors` o anidados bajo     */
/*  `usuario`, ninguno mapeable a un campo del formulario; aquí solo          */
/*  comunicamos que falló, sin exponer el motivo concreto.                    */
/* -------------------------------------------------------------------------- */

const GENERIC_SUBMIT_ERROR =
    'No pudimos completar el registro. Revisa tus datos e inténtalo nuevamente.';

const NETWORK_SUBMIT_ERROR =
    'Sin conexión. Revisa tu red e inténtalo nuevamente.';

/* -------------------------------------------------------------------------- */
/*  Esquema de validación (zod)                                               */
/* -------------------------------------------------------------------------- */

/**
 * `region`/`comuna` guardan IDs como string (los `value` de los selects siempre
 * son string). La región es solo filtro para poblar comunas: NO viaja al
 * backend; lo que viaja es `comuna` (su ID convertido a number).
 *
 * `rut`, `pasaporte`, `razon_social` y `rut_empresa` son opcionales en la forma
 * base porque su obligatoriedad depende de `tipo_cliente`/`tipo_documento`. Las
 * reglas cruzadas viven en el `superRefine`.
 *
 * `pass` usa mínimo 8 + letra/número para quedar más cerca de los validadores
 * típicos de Django y evitar 400 por claves demasiado débiles.
 */
export const registerSchema = z
    .object({
        // Tipo de cuenta
        tipo_cliente: z.enum(['PARTICULAR', 'INSTITUCIONAL']),
        // Solo aplica a PARTICULAR (institucional siempre va con RUT)
        tipo_documento: z.enum(['RUT', 'PASAPORTE']),

        // Datos personales
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

        // Documento (validados condicionalmente en superRefine)
        rut: z.string().trim().optional(),
        pasaporte: z.string().trim().optional(),

        // Datos de la institución (solo INSTITUCIONAL)
        razon_social: z.string().trim().optional(),
        rut_empresa: z.string().trim().optional(),
        giro: z.string().trim().optional(),
        email_contacto: z
            .string()
            .trim()
            .optional()
            .refine((v) => !v || isEmail(v), 'Correo de la institución inválido'),

        // Dirección de entrega
        region: z.string().min(1, 'Selecciona una región'),
        comuna: z.string().min(1, 'Selecciona una comuna'),
        calle: z.string().trim().min(1, 'Ingresa la dirección'),
        numero: z.string().trim().min(1, 'Ingresa el número'),
        detalle: z.string().trim().optional(),
        referencia: z.string().trim().optional(),

        // Credenciales
        pass: z
            .string()
            .min(8, 'La contraseña debe tener al menos 8 caracteres')
            .refine(
                isStrongPassword,
                'La contraseña debe incluir al menos una letra y un número',
            ),
        pass2: z.string().min(1, 'Repite tu contraseña'),
    })
    .superRefine((d, ctx) => {
        // Contraseñas
        if (d.pass !== d.pass2) {
            ctx.addIssue({
                code: 'custom',
                path: ['pass2'],
                message: 'Las contraseñas no coinciden',
            });
        }

        if (d.tipo_cliente === 'PARTICULAR') {
            // PARTICULAR: rut XOR pasaporte según el documento elegido.
            if (d.tipo_documento === 'PASAPORTE') {
                if (!d.pasaporte || d.pasaporte.trim().length === 0) {
                    ctx.addIssue({
                        code: 'custom',
                        path: ['pasaporte'],
                        message: 'Ingresa tu pasaporte',
                    });
                }
            } else {
                if (!d.rut || d.rut.trim().length === 0) {
                    ctx.addIssue({ code: 'custom', path: ['rut'], message: 'Ingresa tu RUT' });
                } else if (!isValidRut(d.rut)) {
                    ctx.addIssue({ code: 'custom', path: ['rut'], message: 'RUT inválido' });
                }
            }
        }

        if (d.tipo_cliente === 'INSTITUCIONAL') {
            // RUT personal del responsable: obligatorio (el backend lo exige).
            if (!d.rut || d.rut.trim().length === 0) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['rut'],
                    message: 'El RUT es obligatorio para cuentas institucionales',
                });
            } else if (!isValidRut(d.rut)) {
                ctx.addIssue({ code: 'custom', path: ['rut'], message: 'RUT inválido' });
            }

            // Datos de la institución
            if (!d.razon_social || d.razon_social.trim().length === 0) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['razon_social'],
                    message: 'Ingresa la razón social',
                });
            }
            if (!d.rut_empresa || d.rut_empresa.trim().length === 0) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['rut_empresa'],
                    message: 'Ingresa el RUT de la empresa',
                });
            } else if (!isValidRut(d.rut_empresa)) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['rut_empresa'],
                    message: 'RUT de empresa inválido',
                });
            }
        }
    });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/* -------------------------------------------------------------------------- */
/*  Builder del payload (form plano → request anidado de la API)              */
/* -------------------------------------------------------------------------- */

/**
 * Arma el cuerpo de POST /accounts/registro/cliente/ según el tipo de cliente.
 *
 * Contrato del backend (ClienteCreateSerializer):
 *   {
 *     usuario: { username, email, first_name, last_name, password, password2 },
 *     rut?, pasaporte?, tipo_cliente, telefono?,
 *     institucion_id?, datos_institucion?, direccion_entrega
 *   }
 *
 * IMPORTANTE — no enviar la plantilla "completa" con strings vacíos:
 *  - `rut` y `pasaporte` son UNIQUE en el modelo. Mandar `pasaporte: ""` en un
 *    registro con RUT (o `rut: ""` en uno con pasaporte) hace que el SEGUNDO
 *    registro choque contra la unicidad del string vacío → el backend responde
 *    "algunos datos ya existen". Por eso se envía SOLO el documento que aplica
 *    y nunca vacío.
 *  - `datos_institucion` solo va en INSTITUCIONAL. Para PARTICULAR debe ir
 *    ausente; un objeto vacío lo rechaza el backend ("Un cliente particular no
 *    debe tener institución.").
 *
 * Decisiones:
 *  - `username = correo`: el form no pide username y la API lo exige (EmailField).
 *    Por eso el correo viaja dos veces (username y email), con el mismo valor.
 *  - `comuna` viaja como ID (number); la región NO se envía (derivable).
 *  - rut/rut_empresa se envían con formato estándar (`formatRut`), no como
 *    string limpio. El backend actual compara duplicados por string exacto y tu
 *    BD ya tiene RUTs con separadores; enviar el valor visual evita varios
 *    falsos negativos de unicidad desde el front. La solución definitiva sería
 *    normalizar también en backend antes de guardar/comparar.
 *  - INSTITUCIONAL → siempre `datos_institucion` (sin institucion_id). El backend
 *    hace get_or_create por rut_empresa, así que reusar una institución existente
 *    funciona sin endpoint de listado.
 */
function buildRegistroCliente(v: RegisterFormValues): RegistroClienteRequest {
    const usuario = {
        username: v.correo.trim(),
        email: v.correo.trim(),
        first_name: v.nombre.trim(),
        last_name: v.apellido.trim(),
        password: v.pass,
        password2: v.pass2,
    };

    const direccion_entrega = {
        direccion: v.calle.trim(),
        num_direccion: v.numero.trim(),
        detalle_direccion: v.detalle?.trim() || undefined,
        comuna: Number(v.comuna),
        referencia: v.referencia?.trim() || undefined,
        es_principal: true,
    };

    const base = {
        usuario,
        tipo_cliente: v.tipo_cliente,
        telefono: v.telefono.trim(),
        direccion_entrega,
    };

    // INSTITUCIONAL: RUT personal + institución nueva (get_or_create por rut_empresa).
    if (v.tipo_cliente === 'INSTITUCIONAL') {
        return {
            ...base,
            rut: formatRut(v.rut!.trim()),
            datos_institucion: {
                razon_social: v.razon_social!.trim(),
                rut_empresa: formatRut(v.rut_empresa!.trim()),
                giro: v.giro?.trim() || undefined,
                email_contacto: v.email_contacto?.trim() || undefined,
            },
        };
    }

    // PARTICULAR con pasaporte (cliente extranjero): rut XOR pasaporte.
    if (v.tipo_documento === 'PASAPORTE') {
        return { ...base, pasaporte: v.pasaporte!.trim() };
    }

    // PARTICULAR con RUT (caso por defecto).
    return { ...base, rut: formatRut(v.rut!.trim()) };
}

/* -------------------------------------------------------------------------- */
/*  Mapeo de errores del backend → campos del formulario                      */
/* -------------------------------------------------------------------------- */

/**
 * Traduce claves de error del backend hacia campos visibles del formulario.
 * `axios.ts` ahora aplana errores anidados de DRF con notación de punto:
 *   { usuario: { username: [...] } } → "usuario.username"
 */
const SERVER_TO_FORM: Record<string, Path<RegisterFormValues>> = {
    // Usuario anidado
    'usuario.email': 'correo',
    'usuario.username': 'correo',
    'usuario.password': 'pass',
    'usuario.password2': 'pass2',
    'usuario.first_name': 'nombre',
    'usuario.last_name': 'apellido',

    // Fallback por si algún endpoint devuelve errores planos
    email: 'correo',
    username: 'correo',
    password: 'pass',
    password2: 'pass2',
    first_name: 'nombre',
    last_name: 'apellido',

    // Cliente
    rut: 'rut',
    pasaporte: 'pasaporte',
    telefono: 'telefono',
    tipo_cliente: 'tipo_cliente',

    // Dirección anidada
    'direccion_entrega.direccion': 'calle',
    'direccion_entrega.num_direccion': 'numero',
    'direccion_entrega.detalle_direccion': 'detalle',
    'direccion_entrega.comuna': 'comuna',
    'direccion_entrega.referencia': 'referencia',
    direccion: 'calle',
    num_direccion: 'numero',
    comuna: 'comuna',

    // Institución anidada
    'datos_institucion.razon_social': 'razon_social',
    'datos_institucion.rut_empresa': 'rut_empresa',
    'datos_institucion.giro': 'giro',
    'datos_institucion.email_contacto': 'email_contacto',
    razon_social: 'razon_social',
    rut_empresa: 'rut_empresa',

    // Errores agrupados de institución
    datos_institucion: 'rut_empresa',
    institucion: 'razon_social',
};

function submitMessageFromApiError(error: ApiError): string {
    if (error.isNetworkError) return NETWORK_SUBMIT_ERROR;

    // Si el backend trae un mensaje global real, úsalo. Si solo dice
    // "Datos inválidos.", mantenemos el copy amable del formulario.
    if (error.message && error.message !== 'Datos inválidos.') {
        return error.message;
    }

    return GENERIC_SUBMIT_ERROR;
}


/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

export function useRegisterForm() {
    const navigate = useNavigate();
    const { toast } = useToast();

    // Aviso global visible en el propio formulario (no depende del toast).
    const [submitError, setSubmitError] = useState<string | null>(null);

    const login = useAuthStore((s) => s.login);
    const loadProfile = useAuthStore((s) => s.loadProfile);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            tipo_cliente: 'PARTICULAR',
            tipo_documento: 'RUT',
            nombre: '',
            apellido: '',
            correo: '',
            telefono: '',
            rut: '',
            pasaporte: '',
            razon_social: '',
            rut_empresa: '',
            giro: '',
            email_contacto: '',
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
            setSubmitError(null);

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

            if (import.meta.env.DEV) {
                // Esto es intencional: mientras depuramos el 400 necesitamos ver
                // el cuerpo real de DRF, no solo "Bad Request" en la terminal.
                console.group('[registro cliente] error');
                console.log('status:', apiErr.status);
                console.log('message:', apiErr.message);
                console.log('fieldErrors:', apiErr.fieldErrors);
                console.log('raw:', apiErr.raw);
                console.groupEnd();
            }

            // 400 con errores por campo → pintarlos junto al input correspondiente.
            if (apiErr.hasFieldErrors && apiErr.fieldErrors) {
                let firstField: Path<RegisterFormValues> | null = null;
                let hadUnmapped = false;

                Object.entries(apiErr.fieldErrors).forEach(([serverKey, msgs]) => {
                    const formField = SERVER_TO_FORM[serverKey];
                    const message = msgs?.[0] ?? 'Dato inválido';

                    if (formField) {
                        form.setError(formField, { type: 'server', message });
                        if (!firstField) firstField = formField;
                    } else {
                        hadUnmapped = true;
                        if (import.meta.env.DEV) {
                            console.warn('[registro cliente] error sin mapear:', serverKey, msgs);
                        }
                    }
                });

                if (firstField) {
                    form.setFocus(firstField);
                    setSubmitError(hadUnmapped ? submitMessageFromApiError(apiErr) : null);
                } else {
                    // Ningún error pudo asociarse a un campo visible → aviso global.
                    setSubmitError(submitMessageFromApiError(apiErr));
                }

                return;
            }

            // Resto: red, 409, 5xx, 400 global con `detail`/`non_field_errors`, etc.
            setSubmitError(submitMessageFromApiError(apiErr));
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        setSubmitError(null); // limpia el aviso previo antes de reintentar
        mutation.mutate(values);
    });

    return {
        form,
        onSubmit,
        isSubmitting: mutation.isPending,
        submitError,
        // Datos para los selects dependientes
        regiones,
        comunas,
        regionSelected,
        loadingRegiones,
        errorRegiones,
    };
}
