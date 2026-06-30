// src/features/orders/components/CheckoutForm.tsx
// T2.8 ⭐ — Formulario de checkout (evolución de "Finalizar pedido" de OrderPage).
//
// Captura: dirección de entrega · tipo de despacho · prioridad médica ·
// observación. Al confirmar arma el payload (Builder) vía checkoutService
// (Facade) y crea el pedido.
//
// La sucursal NO se captura: el backend asigna la bodega de origen por stock
// (y dispara traslados internos si hace falta). Decisión de negocio.
//
// Reglas (M12):
//  - SOLO se vacía el carrito tras 201 (onSuccess). 400/409 dejan el carrito intacto.
//  - 400 { detalles:[...] } (stock) → se pintan inline en la(s) línea(s); no toast.
//  - 409 { error:"Sin stock..." } → toast de conflicto; no vaciar.
//  - 403 { detail:"...no tiene perfil de cliente..." } → mensaje claro de rol.
//
// Handoff: tras crear, muestra montos REALES del backend y un botón "Pagar con
// Webpay" que enlaza a la ruta de pago (T2.9).
//
// Patrón: Facade (checkoutService) + Builder (buildPedido) + Observer (cartStore).

import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
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

import { checkoutService } from '../services/checkoutService';
import type { TipoDespacho, PrioridadMedica } from '../types';
import type { Pedido } from '@/types/models';

/* -------------------------------------------------------------------------- */
/*  Esquema                                                                    */
/* -------------------------------------------------------------------------- */

const checkoutSchema = z.object({
    // value de un <select> es siempre string; lo convertimos a number al armar payload.
    direccionId: z.string().min(1, 'Selecciona una dirección de entrega'),
    despacho: z.enum(['NORMAL', 'EXPRESS']),
    prioridad: z.enum(['NORMAL', 'ALTA', 'CRITICA']),
    observacion: z.string().trim().max(255, 'Máximo 255 caracteres').optional(),
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

/** Extrae el id de producto de un mensaje del backend ("Producto id=5: ..."). */
const extractProductId = (msg: string): number | null => {
    const m = msg.match(/id=(\d+)/i);
    return m ? Number(m[1]) : null;
};

/* -------------------------------------------------------------------------- */
/*  Componente                                                                 */
/* -------------------------------------------------------------------------- */

export function CheckoutForm() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const items = useCartItems();
    const count = useCartCount();
    const { neto, iva, total } = useCartTotal();

    const {
        data: direcciones = [],
        isLoading: cargandoDirecciones,
        isError: errorDirecciones,
    } = useMisDirecciones();

    // Errores de stock por línea (400 detalles) y bloqueo por rol (403).
    const [lineErrors, setLineErrors] = useState<string[]>([]);
    const [blockError, setBlockError] = useState<string | null>(null);
    const [created, setCreated] = useState<Pedido | null>(null);

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: { direccionId: '', despacho: 'NORMAL', prioridad: 'NORMAL', observacion: '' },
    });

    // Preseleccionar la dirección principal cuando llegan las direcciones.
    useEffect(() => {
        if (!direcciones.length || form.getValues('direccionId')) return;
        const principal = direcciones.find((d) => d.es_principal) ?? direcciones[0];
        if (principal) form.setValue('direccionId', String(principal.id));
    }, [direcciones, form]);

    // Mapa productId → mensajes (para pintar en la línea correspondiente).
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

    const mutation = useMutation({
        mutationFn: checkoutService.crearDesdeCarrito,
        onSuccess: (pedido) => {
            // 201: ahora sí vaciamos el carrito y mostramos confirmación con montos reales.
            checkoutService.limpiarCarrito();
            setLineErrors([]);
            setBlockError(null);
            setCreated(pedido);
        },
        onError: (err) => {
            const e = err as ApiError;

            // 400 con stock por línea → inline, sin toast, sin vaciar.
            if (e.status === 400 && e.fieldErrors?.detalles?.length) {
                setLineErrors(e.fieldErrors.detalles);
                toast({
                    title: 'Revisa tu pedido',
                    description: 'Hay líneas con stock insuficiente.',
                    variant: 'destructive',
                });
                return;
            }

            // 403 → rol equivocado / sin perfil de cliente.
            if (e.status === 403) {
                setBlockError(
                    e.message ||
                    'Tu cuenta no tiene un perfil de cliente, por lo que no puede crear pedidos.',
                );
                return;
            }

            // 409 y todo lo demás → toast. Nunca vaciamos el carrito.
            notifyApiError(e, toast);
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        setLineErrors([]);
        setBlockError(null);
        mutation.mutate({
            direccionId: Number(values.direccionId),
            despacho: values.despacho,
            prioridad: values.prioridad,
            observacion: values.observacion,
        });
    });

    /* ── Confirmación (post-201): montos REALES + handoff a pago ───────────── */
    if (created) {
        return (
            <div className="bg-white rounded-2xl shadow-card ring-gold overflow-hidden">
                <div className="h-1.5 gold-rule" />
                <div className="px-6 py-8 sm:px-8">
                    <p className="text-[13px] font-semibold text-emerald-600 uppercase tracking-wide">
                        Pedido creado
                    </p>
                    <h2 className="mt-1 font-display font-bold text-plum-700 text-[30px]">
                        Pedido #{created.id}
                    </h2>
                    <p className="mt-1 text-[14px] text-grape-600">
                        Estado: <span className="font-semibold text-ink">{created.estado}</span>. Confirma
                        el pago para procesarlo.
                    </p>

                    <div className="mt-6 max-w-sm space-y-1.5">
                        <div className="flex items-center justify-between text-[13.5px] text-grape-700">
                            <span>Neto</span>
                            <span className="font-semibold text-ink">{formatCLP(created.montoNeto)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13.5px] text-grape-700">
                            <span>IVA (19%)</span>
                            <span className="font-semibold text-ink">{formatCLP(created.montoIva)}</span>
                        </div>
                        <div className="h-px gold-rule my-1" />
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-grape-700">Total a pagar</span>
                            <span className="font-display font-bold text-plum-700 text-[28px] leading-none">
                                {formatCLP(created.total)}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <button
                            onClick={() => navigate(`/cliente/pago/${created.id}`)}
                            className="bg-gradient-to-r from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 text-plum-800 font-extrabold text-[15px] px-7 py-3.5 rounded-lg shadow-lift transition-colors"
                        >
                            Pagar con Webpay
                        </button>
                        <Link
                            to={`/cliente/pedidos/${created.id}`}
                            className="self-center text-[14px] font-semibold text-azure-600 hover:text-plum-700"
                        >
                            Ver pedido
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

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
    const sinDirecciones = !cargandoDirecciones && !errorDirecciones && direcciones.length === 0;
    const puedeEnviar = !mutation.isPending && items.length > 0 && !sinDirecciones;

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

                    {sinDirecciones && (
                        <div className="mt-3 rounded-lg bg-grape-50 px-4 py-3 text-[14px] text-grape-700">
                            No tienes direcciones registradas.{' '}
                            <Link to="/cliente" className="font-semibold text-azure-600 hover:text-plum-700">
                                Agrega una dirección
                            </Link>{' '}
                            para continuar.
                        </div>
                    )}

                    {!cargandoDirecciones && !sinDirecciones && direcciones.length > 0 && (
                        <div className="mt-3">
                            <select
                                {...form.register('direccionId')}
                                className="w-full rounded-lg border border-grape-200 bg-white px-3.5 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-grape-400"
                            >
                                <option value="">Selecciona una dirección…</option>
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
                            </select>
                            {form.formState.errors.direccionId && (
                                <p role="alert" className="mt-1.5 text-[13px] text-rose-600">
                                    {form.formState.errors.direccionId.message}
                                </p>
                            )}
                        </div>
                    )}
                </section>

                {/* Tipo de despacho */}
                <section className="bg-white rounded-2xl shadow-card p-6">
                    <h2 className="font-display font-bold text-plum-700 text-[20px]">Tipo de despacho</h2>
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
                                                active
                                                    ? 'border-plum-500 bg-plum-50 ring-gold'
                                                    : 'border-grape-200 hover:border-grape-300'
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
                                                active
                                                    ? 'bg-plum-700 text-white'
                                                    : 'bg-grape-50 text-grape-700 hover:bg-grape-100'
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

                {/* Errores de stock no asociables a una línea concreta */}
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
                    <div className="h-px gold-rule my-1" />
                    <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-grape-700">Total estimado</span>
                        <span className="font-display font-bold text-plum-700 text-[26px] leading-none">
                            {formatCLP(total)}
                        </span>
                    </div>
                    <p className="text-[11.5px] text-grape-400">
                        El total definitivo lo confirma el backend al crear el pedido.
                    </p>
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