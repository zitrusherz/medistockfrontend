

import type { Pedido, DetallePedido } from '@/types/models';
import type { PedidoDTO, DetallePedidoDTO } from '../../types';

export const toDetallePedido = (dto: DetallePedidoDTO): DetallePedido => ({
    id: dto.id,
    productoId: dto.producto_id,
    productoSku: dto.producto_sku,
    productoNombre: dto.producto_nombre,
    loteId: dto.lote_id,
    loteCodigo: dto.lote_codigo,
    cantidad: dto.cantidad,
    cantidadPreparada: dto.cantidad_preparada,
    precioUnitario: dto.precio_unitario_historico, // neto histórico CLP
    descuento: dto.descuento,
    subtotal: dto.subtotal,
    observacion: dto.observacion ?? '',
});

export const toPedido = (dto: PedidoDTO): Pedido => ({
    id: dto.id,
    clienteId: dto.cliente_id,
    cliente: dto.cliente_nombre ?? '',
    sucursalId: dto.sucursal_origen_id,
    sucursalNombre: dto.sucursal_nombre ?? '',
    direccionEntregaId: dto.direccion_entrega_id,
    estado: dto.estado_pedido,
    tipoVenta: dto.tipo_venta,
    tipoDespacho: dto.tipo_despacho,
    prioridad: dto.prioridad_medica,
    fechaCreacion: dto.fecha_creacion,
    fechaActualizacion: dto.fecha_actualizacion,
    fechaRequeridaEntrega: dto.fecha_requerida_entrega,
    // Montos ya desglosados desde el backend (M1/M2: CLP entero).
    subtotal: dto.subtotal,
    descuentoTotal: dto.descuento_total,
    montoNeto: dto.monto_neto,
    montoIva: dto.monto_iva,
    total: dto.total,
    observacion: dto.observacion ?? '',
    detalles: (dto.detalles ?? []).map(toDetallePedido),
});