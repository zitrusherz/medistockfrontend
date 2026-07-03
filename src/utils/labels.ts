

import type {
    EstadoPedido,
    EstadoPago,
    EstadoEnvio,
    PrioridadMedica,
    TipoDespacho,
    MetodoPago,
    TipoVenta,
} from "@/types/models"

/* ── Estado del pedido ──────────────────────────────────────────────────────
   "EN_PICKING" se muestra como "En preparación": "picking" es jerga de bodega,
   no copy de usuario (M15). */
export const ESTADO_PEDIDO_LABEL = {
    PENDIENTE:  "Pendiente",
    APROBADO:   "Aprobado",
    RECHAZADO:  "Rechazado",
    EN_PICKING: "En preparación",
    DESPACHADO: "Despachado",
    ENTREGADO:  "Entregado",
    CANCELADO:  "Cancelado",
} satisfies Record<EstadoPedido, string>

/* ── Estado del pago ────────────────────────────────────────────────────────*/
export const ESTADO_PAGO_LABEL = {
    PENDIENTE:   "Pendiente",
    INICIADO:    "Iniciado",
    AUTORIZADO:  "Autorizado",
    CONFIRMADO:  "Confirmado",
    RECHAZADO:   "Rechazado",
    ANULADO:     "Anulado",
    REEMBOLSADO: "Reembolsado",
    ERROR:       "Error",
} satisfies Record<EstadoPago, string>

/* ── Estado del envío / despacho ────────────────────────────────────────────*/
export const ESTADO_ENVIO_LABEL = {
    PENDIENTE:   "Pendiente",
    RETIRADO:    "Retirado",
    EN_TRANSITO: "En tránsito",
    ENTREGADO:   "Entregado",
    DEVUELTO:    "Devuelto",
    CANCELADO:   "Cancelado",
} satisfies Record<EstadoEnvio, string>

/* ── Prioridad médica ───────────────────────────────────────────────────────*/
export const PRIORIDAD_LABEL = {
    NORMAL:  "Normal",
    ALTA:    "Alta",
    CRITICA: "Crítica",
} satisfies Record<PrioridadMedica, string>

/* ── Tipo de despacho ───────────────────────────────────────────────────────*/
export const TIPO_DESPACHO_LABEL = {
    NORMAL:  "Normal",
    EXPRESS: "Express",
} satisfies Record<TipoDespacho, string>

/* ── Método de pago ─────────────────────────────────────────────────────────*/
export const METODO_PAGO_LABEL = {
    WEBPAY:                "Webpay",
    MERCADOPAGO:           "MercadoPago",
    TRANSFERENCIA:         "Transferencia",
    CREDITO_INSTITUCIONAL: "Crédito institucional",
} satisfies Record<MetodoPago, string>

/* ── Tipo de venta ──────────────────────────────────────────────────────────*/
export const TIPO_VENTA_LABEL = {
    WEBPAY:                "Webpay",
    TRANSFERENCIA:         "Transferencia",
    MAYORISTA:             "Mayorista",
    CREDITO_INSTITUCIONAL: "Crédito institucional",
} satisfies Record<TipoVenta, string>

/* ── Términos canónicos del dominio ─────────────────────────────────────────
   Cómo se nombra cada concepto en singular y minúscula (capitalizar al inicio
   de frase). Evita "orden/pedido", "bodega/sucursal", "cliente/institución"
   usados como sinónimos en distintas vistas. */
export const TERMINOS = {
    carrito:     "carrito",
    pedido:      "pedido",       // no "orden"
    despacho:    "despacho",     // no "envío" como sinónimo en la UI de cliente
    sucursal:    "sucursal",     // no "bodega" de cara al usuario
    institucion: "institución",  // cliente B2B
    cliente:     "cliente",
} as const
