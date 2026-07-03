

import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';

import { formatCLP } from '@/utils/formatCurrency';
import { notifyApiError } from '@/utils/notifyApiError';
import { useToast } from '@/components/ui';
import type { ApiError } from '@/lib/axios';

import {
    useCartItems,
    useCartCount,
    useCartTotal,
} from '@/features/cart/hooks/useCart';
import { useMisDirecciones } from '@/features/accounts/hooks/useMisDirecciones';
import { accountsService } from '@/features/accounts/services/accountsService';
import type { DireccionEntregaInput } from '@/features/accounts/types';
import { useRegionesConComunas } from '@/features/locations/hooks/useRegionesConComunas';
import { useCotizacionEnvio, type OpcionEnvio } from '@/features/logistics/hooks/useCotizacionEnvio';

import { checkoutService } from '../services/checkoutService';
import type { TipoDespacho, PrioridadMedica } from '../types';
import type { Pedido } from '@/types/models';

/* -------------------------------------------------------------------------- */
/*  Esquema                                                                    */
/* -------------------------------------------------------------------------- */

const checkoutSchema = z
    .object({
        modo: z.enum(['existente', 'nueva']),
        direccionId: z.string(),
        na_region: z.string(),
        na_comuna: z.string(),
        na_direccion: z.string(),
        na_num: z.string(),
        na_detalle: z.string().optional(),
        na_referencia: z.string().optional(),
        na_receptor: z.string().optional(),
        na_telefono: z.string().optional(),
        na_principal: z.boolean().optional(),
        despacho: z.enum(['NORMAL', 'EXPRESS']),
        prioridad: z.enum(['NORMAL', 'ALTA', 'CRITICA']),
        observacion: z.string().trim().max(255, 'Máximo 255 caracteres').optional(),
    })
    .superRefine((v, ctx) => {
        if (v.modo === 'existente') {
            if (!v.direccionId) {
                ctx.addIssue({ code: 'custom', path: ['direccionId'], message: 'Selecciona una dirección de entrega' });
            }
            return;
        }
        if (!v.na_comuna) {
            ctx.addIssue({ code: 'custom', path: ['na_comuna'], message: 'Selecciona la comuna' });
        }
        if (!v.na_direccion.trim()) {
            ctx.addIssue({ code: 'custom', path: ['na_direccion'], message: 'Ingresa la calle' });
        }
        if (!v.na_num.trim()) {
            ctx.addIssue({ code: 'custom', path: ['na_num'], message: 'Ingresa el número' });
        }
    });

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const DESPACHOS: { value: TipoDespacho; label: string; hint: string }[] = [
    { value: 'NORMAL', label: 'Normal', hint: 'Plazo estándar' },
    { value: 'EXPRESS', label: 'Express', hint: 'Entrega prioritaria' },
];

const PRIORIDADES: { value: PrioridadMedica; label: string }[] = [
    { value: 'NORMAL', label: 'Normal' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'CRITICA', label: 'Crítica' },
];

const NUEVA_DIR = '__nueva__';

const inputCls =
    'w-full rounded-lg border border-grape-200 bg-white px-3.5 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-grape-400';

/** Extrae el id de producto de un mensaje del backend ("Producto id=5: ..."). */
const extractProductId = (msg: string): number | null => {
    const m = msg.match(/id=(\d+)/i);
    return m ? Number(m[1]) : null;
};

/** Mapea un servicio Chilexpress al enum de despacho que acepta el pedido. */
const mapDespacho = (o: OpcionEnvio | null): TipoDespacho =>
    o && /express|prior|urg|mismo\s*d[ií]a|same.?day/i.test(o.serviceDescription)
        ? 'EXPRESS'
        : 'NORMAL';

/* -------------------------------------------------------------------------- */
/*  Datos que consume la mutación                                              */
/* -------------------------------------------------------------------------- */

interface SubmitVars {
    modo: 'existente' | 'nueva';
    direccionId?: number;
    nueva?: DireccionEntregaInput;
    sucursalId: number;
    despacho: TipoDespacho;
    prioridad: PrioridadMedica;
    observacion?: string;
}

/* -------------------------------------------------------------------------- */
/*  Componente                                                                 */
/* -------------------------------------------------------------------------- */

export function CheckoutForm() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const items = useCartItems();
    const count = useCartCount();
    const { neto, iva, total } = useCartTotal();

    const {
        data: direcciones = [],
        isLoading: cargandoDirecciones,
        isError: errorDirecciones,
    } = useMisDirecciones();

    const { regiones } = useRegionesConComunas();

    const [lineErrors, setLineErrors] = useState<string[]>([]);
    const [blockError, setBlockError] = useState<string | null>(null);
    const [servicioSel, setServicioSel] = useState<number | null>(null);

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            modo: 'existente',
            direccionId: '',
            na_region: '',
            na_comuna: '',
            na_direccion: '',
            na_num: '',
            na_detalle: '',
            na_referencia: '',
            na_receptor: '',
            na_telefono: '',
            na_principal: false,
            despacho: 'NORMAL',
            prioridad: 'NORMAL',
            observacion: '',
        },
    });

    const modo = form.watch('modo');
    const direccionId = form.watch('direccionId');
    const naRegion = form.watch('na_region');
    const naComuna = form.watch('na_comuna');

    // Preseleccionar la dirección principal cuando llegan las direcciones.
    useEffect(() => {
        if (!direcciones.length || form.getValues('direccionId')) return;
        const principal = direcciones.find((d) => d.es_principal) ?? direcciones[0];
        if (principal) {
            form.setValue('modo', 'existente');
            form.setValue('direccionId', String(principal.id));
        }
    }, [direcciones, form]);

    // Sin direcciones guardadas → el único camino es ingresar una nueva.
    const sinDirecciones = !cargandoDirecciones && !errorDirecciones && direcciones.length === 0;
    useEffect(() => {
        if (sinDirecciones) form.setValue('modo', 'nueva');
    }, [sinDirecciones, form]);

    // Comunas de la región elegida en el formulario de dirección nueva.
    const comunasDeRegion = useMemo(() => {
        if (!naRegion) return [];
        return regiones.find((r) => r.id === Number(naRegion))?.comunas ?? [];
    }, [naRegion, regiones]);

    /** Mapea un id de comuna → county_code Chilexpress (para cotizar). */
    const countyCodeDe = useMemo(() => {
        const idx = new Map<number, string>();
        for (const r of regiones) {
            for (const c of r.comunas) {
                if (c.chilexpress?.county_code) idx.set(c.id, c.chilexpress.county_code);
            }
        }
        return (comunaId: number | null): string | null =>
            comunaId == null ? null : idx.get(comunaId) ?? null;
    }, [regiones]);

    // Comuna de destino según la dirección elegida (existente o nueva).
    const destinoComunaId = useMemo<number | null>(() => {
        if (modo === 'nueva') return naComuna ? Number(naComuna) : null;
        const dir = direcciones.find((d) => String(d.id) === direccionId);
        return dir ? Number(dir.comuna) : null;
    }, [modo, naComuna, direccionId, direcciones]);

    const countyCode = countyCodeDe(destinoComunaId);

    // Errores de stock por línea.
    const erroresPorProducto = useMemo(() => {
        const map = new Map<number, string[]>();
        for (const msg of lineErrors) {
            const pid = extractProductId(msg);
            if (pid != null) map.set(pid, [...(map.get(pid) ?? []), msg]);
        }
        return map;
    }, [lineErrors]);
    const erroresSinLinea = useMemo(
        () => lineErrors.filter((m) => extractProductId(m) == null),
        [lineErrors],
    );

    // ── Cotización de envío EN VIVO (una llamada por sucursal candidata) ──────
    const {
        opciones,
        isLoading: cotizandoRaw,
        sinCobertura,
        hasCounty,
        mejorSucursal,
    } = useCotizacionEnvio(countyCode);

    // Preseleccionar el servicio más barato (y fijar el despacho del pedido).
    useEffect(() => {
        if (opciones.length === 0) return;

        const pick =
            servicioSel == null
                ? opciones[0]
                : opciones.find((o) => o.serviceTypeCode === servicioSel) ?? opciones[0];

        if (!pick) return;

        const valid = pick.serviceTypeCode === servicioSel;

        if (!valid) {
            setServicioSel(pick.serviceTypeCode);
        }

        form.setValue('despacho', mapDespacho(pick));
    }, [opciones, servicioSel, form]);

    const opcionSel = opciones.find((o) => o.serviceTypeCode === servicioSel) ?? null;

    const origenSucursalId = opcionSel?.sucursalId ?? mejorSucursal?.id ?? null;
    const cotizando = hasCounty && !sinCobertura && cotizandoRaw;
    const showServices = opciones.length > 0;


    const mutation = useMutation({
        mutationFn: async (vars: SubmitVars): Promise<Pedido> => {
            // CAMBIO 6: si es dirección nueva, se crea primero para obtener su id.
            let dirId = vars.direccionId;
            if (vars.modo === 'nueva' && vars.nueva) {
                const creada = await accountsService.crearMiDireccion(vars.nueva);
                dirId = creada.id;
            }
            if (dirId == null) {
                throw new Error('No se resolvió la dirección de entrega.');
            }
            return checkoutService.crearDesdeCarrito({
                direccionId: dirId,
                sucursalId: vars.sucursalId,
                despacho: vars.despacho,
                prioridad: vars.prioridad,
                observacion: vars.observacion,
            });
        },
        onSuccess: (pedido, vars) => {

            checkoutService.limpiarCarrito();
            setLineErrors([]);
            setBlockError(null);
            queryClient.invalidateQueries({ queryKey: ['pedidos', 'mis'] });
            if (vars.modo === 'nueva') {
                queryClient.invalidateQueries({ queryKey: ['accounts', 'mis-direcciones'] });
            }

            navigate(`/cliente/pago/${pedido.id}`, { replace: true });
        },
        onError: (err) => {
            const e = err as ApiError;

            if (e.status === 400 && e.fieldErrors?.detalles?.length) {
                setLineErrors(e.fieldErrors.detalles);
                toast({
                    title: 'Revisa tu pedido',
                    description: 'Hay líneas con stock insuficiente.',
                    variant: 'destructive',
                });
                return;
            }

            if (e.status === 403) {
                setBlockError(
                    e.message ||
                    'Tu cuenta no tiene un perfil de cliente, por lo que no puede crear pedidos.',
                );
                return;
            }

            notifyApiError(e, toast);
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        setLineErrors([]);
        setBlockError(null);

        // El backend exige sucursal de origen. Sin stock en ningún local no se puede.
        if (origenSucursalId == null) {
            toast({
                title: 'Sin sucursal disponible',
                description: 'No hay un local con stock para tu pedido en este momento.',
                variant: 'destructive',
            });
            return;
        }

        if (values.modo === 'nueva') {
            const comunaId = Number(values.na_comuna);
            const nueva: DireccionEntregaInput = {
                direccion: values.na_direccion.trim(),
                num_direccion: values.na_num.trim() || undefined,
                detalle_direccion: values.na_detalle?.trim() || undefined,
                comuna: comunaId,
                referencia: values.na_referencia?.trim() || undefined,
                nombre_receptor: values.na_receptor?.trim() || undefined,
                telefono_receptor: values.na_telefono?.trim() || undefined,
                es_principal: values.na_principal || false,
            };
            mutation.mutate({
                modo: 'nueva',
                nueva,
                sucursalId: origenSucursalId,
                despacho: values.despacho,
                prioridad: values.prioridad,
                observacion: values.observacion,
            });
            return;
        }

        mutation.mutate({
            modo: 'existente',
            direccionId: Number(values.direccionId),
            sucursalId: origenSucursalId,
            despacho: values.despacho,
            prioridad: values.prioridad,
            observacion: values.observacion,
        });
    });

    /* ── Bloqueo por rol (403) ─────────────────────────────────────────────── */
    if (blockError) {
        return (
            <div className="bg-white rounded-2xl shadow-card ring-gold p-8">
                <h2 className="font-display font-bold text-plum-700 text-[24px]">No puedes finalizar</h2>
                <p className="mt-2 text-[14px] text-rose-600">{blockError}</p>
                <Link
                    to="/catalogo"
                    className="mt-6 inline-block text-[14px] font-semibold text-azure-600 hover:text-plum-700"
                >
                    Volver al catálogo
                </Link>
            </div>
        );
    }

    /* ── Formulario ────────────────────────────────────────────────────────── */
    const puedeEnviar = !mutation.isPending && items.length > 0;
    const envioResumen = cotizando
        ? 'Cotizando…'
        : opcionSel
            ? formatCLP(opcionSel.value)
            : !hasCounty
                ? 'Elige dirección'
                : 'Pendiente';

    return (
        <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
            {/* Columna izquierda: datos de entrega */}
            <div className="space-y-6">
                {/* Dirección */}
                <section className="bg-white rounded-2xl shadow-card p-6">
                    <h2 className="font-display font-bold text-plum-700 text-[20px]">Dirección de entrega</h2>

                    {cargandoDirecciones && (
                        <p className="mt-3 text-[14px] text-grape-500">Cargando tus direcciones…</p>
                    )}

                    {errorDirecciones && (
                        <p className="mt-3 text-[14px] text-rose-600">
                            No pudimos cargar tus direcciones. Recarga la página.
                        </p>
                    )}

                    {!cargandoDirecciones && (
                        <div className="mt-3">
                            {/* CAMBIO 6: direcciones guardadas + "ingresar nueva". */}
                            <select
                                value={modo === 'nueva' ? NUEVA_DIR : direccionId}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    if (v === NUEVA_DIR) {
                                        form.setValue('modo', 'nueva');
                                    } else {
                                        form.setValue('modo', 'existente');
                                        form.setValue('direccionId', v);
                                    }
                                }}
                                className={inputCls}
                            >
                                {!sinDirecciones && <option value="">Selecciona una dirección…</option>}
                                {direcciones.map((d) => {
                                    const comuna = (d.comuna_detalle as { nombre?: string } | undefined)?.nombre;
                                    const label = [
                                        `${d.direccion} ${d.num_direccion}`.trim(),
                                        comuna,
                                        d.referencia || undefined,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ');
                                    return (
                                        <option key={d.id} value={String(d.id)}>
                                            {d.es_principal ? '★ ' : ''}
                                            {label}
                                        </option>
                                    );
                                })}
                                <option value={NUEVA_DIR}>＋ Ingresar una dirección nueva…</option>
                            </select>

                            {modo === 'existente' && form.formState.errors.direccionId && (
                                <p role="alert" className="mt-1.5 text-[13px] text-rose-600">
                                    {form.formState.errors.direccionId.message}
                                </p>
                            )}

                            {/* Formulario de dirección nueva */}
                            {modo === 'nueva' && (
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-[11.5px] font-bold text-grape-700 mb-1">Región</label>
                                        <select
                                            value={naRegion}
                                            onChange={(e) => {
                                                form.setValue('na_region', e.target.value);
                                                form.setValue('na_comuna', '');
                                            }}
                                            className={inputCls}
                                        >
                                            <option value="">Selecciona…</option>
                                            {regiones.map((r) => (
                                                <option key={r.id} value={String(r.id)}>{r.nombre}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[11.5px] font-bold text-grape-700 mb-1">Comuna</label>
                                        <select
                                            {...form.register('na_comuna')}
                                            disabled={!naRegion}
                                            className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <option value="">{naRegion ? 'Selecciona…' : 'Elige región primero'}</option>
                                            {comunasDeRegion.map((c) => (
                                                <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                                            ))}
                                        </select>
                                        {form.formState.errors.na_comuna && (
                                            <p role="alert" className="mt-1 text-[12.5px] text-rose-600">
                                                {form.formState.errors.na_comuna.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[11.5px] font-bold text-grape-700 mb-1">Calle</label>
                                        <input {...form.register('na_direccion')} placeholder="Ej: Av. Providencia" className={inputCls} />
                                        {form.formState.errors.na_direccion && (
                                            <p role="alert" className="mt-1 text-[12.5px] text-rose-600">
                                                {form.formState.errors.na_direccion.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[11.5px] font-bold text-grape-700 mb-1">Número</label>
                                        <input {...form.register('na_num')} placeholder="Ej: 1234" className={inputCls} />
                                        {form.formState.errors.na_num && (
                                            <p role="alert" className="mt-1 text-[12.5px] text-rose-600">
                                                {form.formState.errors.na_num.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[11.5px] font-bold text-grape-700 mb-1">Depto / Oficina (opcional)</label>
                                        <input {...form.register('na_detalle')} placeholder="Ej: Depto 501" className={inputCls} />
                                    </div>

                                    <div>
                                        <label className="block text-[11.5px] font-bold text-grape-700 mb-1">Referencia (opcional)</label>
                                        <input {...form.register('na_referencia')} placeholder="Ej: Frente a la plaza" className={inputCls} />
                                    </div>

                                    <div>
                                        <label className="block text-[11.5px] font-bold text-grape-700 mb-1">Nombre de quien recibe (opcional)</label>
                                        <input {...form.register('na_receptor')} placeholder="Ej: Salvador Allende" className={inputCls} />
                                    </div>

                                    <div>
                                        <label className="block text-[11.5px] font-bold text-grape-700 mb-1">Teléfono de contacto (opcional)</label>
                                        <input {...form.register('na_telefono')} placeholder="Ej: +56 9 1234 5678" className={inputCls} />
                                    </div>

                                    <label className="sm:col-span-2 flex items-center gap-2 text-[13px] text-grape-700">
                                        <input type="checkbox" {...form.register('na_principal')} className="accent-plum-700" />
                                        Guardar como mi dirección principal
                                    </label>
                                    <p className="sm:col-span-2 text-[12px] text-grape-400">
                                        La dirección se guardará en tu cuenta al confirmar el pedido.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Tipo de despacho — servicios reales de Chilexpress (cotización en vivo) */}
                <section className="bg-white rounded-2xl shadow-card p-6">
                    <h2 className="font-display font-bold text-plum-700 text-[20px]">Tipo de despacho</h2>

                    {cotizando ? (
                        <p className="mt-3 text-[14px] text-grape-500">Cotizando el envío con Chilexpress…</p>
                    ) : showServices ? (
                        <div className="mt-3 space-y-2">
                            {opciones.map((o, idx) => {
                                const active = servicioSel === o.serviceTypeCode;
                                return (
                                    <button
                                        type="button"
                                        key={o.serviceTypeCode}
                                        onClick={() => {
                                            setServicioSel(o.serviceTypeCode);
                                            form.setValue('despacho', mapDespacho(o));
                                        }}
                                        aria-pressed={active}
                                        className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                                            active ? 'border-plum-500 bg-plum-50 ring-gold' : 'border-grape-200 hover:border-grape-300'
                                        }`}
                                    >
                                        <span className="min-w-0">
                                            <span className="block text-[14px] font-semibold text-ink">
                                                {o.serviceDescription}
                                                {idx === 0 && (
                                                    <span className="ml-2 text-[11px] font-bold text-emerald-600">más económico</span>
                                                )}
                                            </span>
                                            <span className="block text-[12px] text-grape-500 truncate">
                                                Despacha desde {o.sucursalNombre}
                                            </span>
                                        </span>
                                        <span className="ml-3 shrink-0 text-[15px] font-bold text-plum-700">
                                            {formatCLP(o.value)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <>
                            {/* Fallback: sin dirección o sin cotización → Normal/Express manual. */}
                            <Controller
                                control={form.control}
                                name="despacho"
                                render={({ field }) => (
                                    <div className="mt-3 grid grid-cols-2 gap-3">
                                        {DESPACHOS.map((o) => {
                                            const active = field.value === o.value;
                                            return (
                                                <button
                                                    type="button"
                                                    key={o.value}
                                                    onClick={() => field.onChange(o.value)}
                                                    aria-pressed={active}
                                                    className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                                                        active ? 'border-plum-500 bg-plum-50 ring-gold' : 'border-grape-200 hover:border-grape-300'
                                                    }`}
                                                >
                                                    <span className="block text-[14px] font-semibold text-ink">{o.label}</span>
                                                    <span className="block text-[12.5px] text-grape-500">{o.hint}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            />
                            {!hasCounty ? (
                                <p className="mt-2 text-[12.5px] text-grape-500">
                                    Elige una dirección para ver las tarifas de envío de Chilexpress.
                                </p>
                            ) : (
                                <p className="mt-2 text-[12.5px] text-amber-600">
                                    No pudimos cotizar el envío ahora; quedará pendiente y se pagará después.
                                </p>
                            )}
                        </>
                    )}
                </section>

                {/* Prioridad médica */}
                <section className="bg-white rounded-2xl shadow-card p-6">
                    <h2 className="font-display font-bold text-plum-700 text-[20px]">Prioridad médica</h2>
                    <Controller
                        control={form.control}
                        name="prioridad"
                        render={({ field }) => (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {PRIORIDADES.map((o) => {
                                    const active = field.value === o.value;
                                    return (
                                        <button
                                            type="button"
                                            key={o.value}
                                            onClick={() => field.onChange(o.value)}
                                            aria-pressed={active}
                                            className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${
                                                active ? 'bg-plum-700 text-white' : 'bg-grape-50 text-grape-700 hover:bg-grape-100'
                                            }`}
                                        >
                                            {o.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    />
                </section>

                {/* Observación */}
                <section className="bg-white rounded-2xl shadow-card p-6">
                    <h2 className="font-display font-bold text-plum-700 text-[20px]">Observación (opcional)</h2>
                    <textarea
                        {...form.register('observacion')}
                        rows={3}
                        placeholder="Ej: Entregar en portería."
                        className="mt-3 w-full rounded-lg border border-grape-200 bg-white px-3.5 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-grape-400"
                    />
                    {form.formState.errors.observacion && (
                        <p role="alert" className="mt-1.5 text-[13px] text-rose-600">
                            {form.formState.errors.observacion.message}
                        </p>
                    )}
                </section>
            </div>

            {/* Columna derecha: resumen del pedido */}
            <aside className="bg-white rounded-2xl shadow-card p-6 lg:sticky lg:top-6">
                <h2 className="font-display font-bold text-plum-700 text-[20px]">Resumen</h2>

                {erroresSinLinea.length > 0 && (
                    <div role="alert" className="mt-3 rounded-lg bg-rose-50 px-3.5 py-2.5">
                        {erroresSinLinea.map((m, i) => (
                            <p key={i} className="text-[13px] text-rose-700">{m}</p>
                        ))}
                    </div>
                )}

                <ul className="mt-4 divide-y divide-grape-100">
                    {items.map((it) => {
                        const errs = erroresPorProducto.get(it.productId);
                        return (
                            <li key={it.code} className="py-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[13.5px] font-semibold text-ink truncate">{it.name}</p>
                                        <p className="text-[12.5px] text-grape-500">
                                            {it.quantity} × {formatCLP(it.priceIva)}
                                        </p>
                                    </div>
                                    <span className="text-[13.5px] font-semibold text-ink whitespace-nowrap">
                                        {formatCLP(it.priceIva * it.quantity)}
                                    </span>
                                </div>
                                {errs && (
                                    <div role="alert" className="mt-1.5">
                                        {errs.map((m, i) => (
                                            <p key={i} className="text-[12.5px] text-rose-600">{m}</p>
                                        ))}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-4 space-y-1.5 border-t border-grape-100 pt-4">
                    <div className="flex items-center justify-between text-[13.5px] text-grape-700">
                        <span>Neto ({count} art.)</span>
                        <span className="font-semibold text-ink">{formatCLP(neto)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13.5px] text-grape-700">
                        <span>IVA (19%)</span>
                        <span className="font-semibold text-ink">{formatCLP(iva)}</span>
                    </div>
                    {/* CAMBIO 5: envío cotizado en vivo (Chilexpress) según la dirección. */}
                    <div className="flex items-center justify-between text-[13.5px] text-grape-700">
                        <span>Envío{opcionSel ? ` · ${opcionSel.serviceDescription}` : ''}</span>
                        <span className={opcionSel ? 'font-semibold text-ink' : 'text-grape-500'}>{envioResumen}</span>
                    </div>
                    <div className="h-px gold-rule my-1" />
                    <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-grape-700">Total estimado</span>
                        <span className="font-display font-bold text-plum-700 text-[26px] leading-none">
                            {formatCLP(total + (opcionSel?.value ?? 0))}
                        </span>
                    </div>
                    {/* CAMBIO 7: se eliminó el texto "El total definitivo lo confirma el backend…". */}
                </div>

                <button
                    type="submit"
                    disabled={!puedeEnviar}
                    className="mt-5 w-full bg-gradient-to-r from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 text-plum-800 font-extrabold text-[15px] px-7 py-3.5 rounded-lg shadow-lift transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {mutation.isPending ? 'Creando pedido…' : 'Confirmar y pagar'}
                </button>
            </aside>
        </form>
    );
}
