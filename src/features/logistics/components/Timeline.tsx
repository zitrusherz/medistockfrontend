

import type { EstadoEnvio } from '@/types/models';
import { formatDateTime } from '@/utils/formatDate';
import {
    PASOS_ENVIO,
    estadoEnvioConfig,
    indicePaso,
    esRamaExcepcion,
    type ToneEnvio,
} from '../services/envioState';
import type { EnvioTracking } from '../services/mappers/trackingMapper';

interface TimelineProps {
    /** Estado efectivo del despacho (fuente del timeline). */
    estado: EstadoEnvio;
    /** Tracking normalizado (cabecera + eventos del courier). */
    tracking: EnvioTracking;
}

/** Chip de estado por tono (paleta del tema, mismo criterio que PagoRetorno). */
const TONE_CHIP: Record<ToneEnvio, string> = {
    info: 'bg-grape-50 text-grape-700',
    warning: 'bg-amber-50 text-amber-700',
    success: 'bg-emerald-50 text-emerald-700',
    danger: 'bg-rose-50 text-rose-700',
};

export function Timeline({ estado, tracking }: TimelineProps) {
    const cfg = estadoEnvioConfig(estado);
    const actual = indicePaso(estado);
    const excepcion = esRamaExcepcion(estado);

    return (
        <section className="bg-white rounded-2xl shadow-card ring-gold overflow-hidden">
            <div className="h-1.5 gold-rule" />

            <div className="px-6 py-7 sm:px-8">
                {/* Cabecera: courier + nº seguimiento + estado actual */}
                <header className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="font-display font-bold text-plum-700 text-[22px]">
                            Seguimiento del envío
                        </h2>
                        <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
                            <div className="flex gap-1.5">
                                <dt className="text-grape-500">Courier:</dt>
                                <dd className="font-semibold text-ink">
                                    {tracking.courierNombre ?? '—'}
                                </dd>
                            </div>
                            <div className="flex gap-1.5">
                                <dt className="text-grape-500">N.º seguimiento:</dt>
                                <dd className="font-semibold text-ink font-mono">
                                    {tracking.numeroSeguimiento ?? '—'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[12.5px] font-semibold ${TONE_CHIP[cfg.tone]}`}
                    >
                        {cfg.label}
                    </span>
                </header>

                {/* Banda de excepción (DEVUELTO / CANCELADO) */}
                {excepcion && (
                    <div
                        role="status"
                        className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-[13.5px] text-rose-700"
                    >
                        {cfg.descripcion}
                    </div>
                )}

                {/* Barra de progreso lineal (solo flujo normal) */}
                {!excepcion && (
                    <ol className="mt-7 space-y-0">
                        {PASOS_ENVIO.map((paso, idx) => {
                            const hecho = idx < actual;
                            const esActual = idx === actual;
                            const pasoCfg = estadoEnvioConfig(paso);
                            const esUltimo = idx === PASOS_ENVIO.length - 1;

                            return (
                                <li
                                    key={paso}
                                    aria-current={esActual ? 'step' : undefined}
                                    className="relative flex gap-4 pb-6 last:pb-0"
                                >
                                    {/* Línea conectora vertical */}
                                    {!esUltimo && (
                                        <span
                                            aria-hidden
                                            className={`absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5 ${
                                                hecho ? 'bg-plum-500' : 'bg-grape-100'
                                            }`}
                                        />
                                    )}

                                    {/* Nodo */}
                                    <span
                                        aria-hidden
                                        className={[
                                            'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold',
                                            hecho && 'bg-plum-600 text-white',
                                            esActual &&
                                                'bg-gradient-to-r from-gold-300 to-gold-500 text-plum-800 ring-4 ring-gold-200',
                                            !hecho && !esActual && 'bg-grape-100 text-grape-400',
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                    >
                                        {hecho ? <Check /> : idx + 1}
                                    </span>

                                    {/* Texto del paso */}
                                    <div className="pt-0.5">
                                        <p
                                            className={`text-[14.5px] font-semibold ${
                                                hecho || esActual ? 'text-ink' : 'text-grape-400'
                                            }`}
                                        >
                                            {pasoCfg.label}
                                        </p>
                                        {esActual && (
                                            <p className="mt-0.5 text-[13px] text-grape-600">
                                                {cfg.descripcion}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                )}

                {/* Enriquecimiento: eventos del courier (si los hay) */}
                {tracking.eventos.length > 0 && (
                    <div className="mt-6 border-t border-grape-100 pt-5">
                        <h3 className="text-[12px] font-semibold uppercase tracking-wide text-grape-500">
                            Detalle del courier
                        </h3>
                        <ul className="mt-3 space-y-3">
                            {tracking.eventos.map((ev, i) => (
                                <li key={i} className="flex gap-3 text-[13px]">
                                    <span
                                        aria-hidden
                                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-azure-500"
                                    />
                                    <div>
                                        <p className="font-medium text-ink">
                                            {ev.descripcion || ev.estado || 'Movimiento registrado'}
                                        </p>
                                        <p className="text-grape-500">
                                            {[formatDateTime(ev.fecha), ev.ubicacion]
                                                .filter(Boolean)
                                                .join(' · ') || '—'}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
}

/* ── Icono check inline (sin acoplar a un set de iconos) ─────────────────────── */
function Check() {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 10.5l3.5 3.5L15 6.5" />
        </svg>
    );
}
