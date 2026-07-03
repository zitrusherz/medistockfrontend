// src/features/orders/services/checkoutService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Igual que en orderService.test.ts: mockeamos todo lo que hace red o toca
// otro store, para probar SOLO la lógica de checkoutService en aislamiento
// (Builder de buildPedido() y el Facade que delega en orderService/paymentService).
vi.mock('@/lib/axios', () => ({
    default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

// vi.mock() se hoistea POR ENCIMA de estas declaraciones. Para poder referenciar
// los mocks dentro del factory (y también más abajo en los tests), hay que
// envolverlos en vi.hoisted(); si no, Vitest lanza "Cannot access before initialization".
const { toDetalles, clear } = vi.hoisted(() => ({
    toDetalles: vi.fn(),
    clear: vi.fn(),
}))

vi.mock('@/features/cart/hooks/useCart', () => ({
    cartImperative: { toDetalles, clear },
}))

const { iniciarPago } = vi.hoisted(() => ({
    iniciarPago: vi.fn(),
}))

vi.mock('@/features/payments/services/paymentService', () => ({
    paymentService: { iniciarPago },
}))

const { crearPedido } = vi.hoisted(() => ({
    crearPedido: vi.fn(),
}))

vi.mock('./orderService', () => ({
    orderService: { crearPedido },
}))

import {
    buildPedido,
    checkoutService,
    type CheckoutInput,
} from './checkoutService'

const makeCheckoutInput = (
    overrides: Partial<CheckoutInput> = {},
): CheckoutInput => ({
    direccionId: 1,
    sucursalId: 1,
    despacho: 'NORMAL' as CheckoutInput['despacho'],
    prioridad: 'NORMAL' as CheckoutInput['prioridad'],
    ...overrides,
})

beforeEach(() => {
    toDetalles.mockReset()
    clear.mockReset()
    iniciarPago.mockReset()
    crearPedido.mockReset()
})

describe('buildPedido', () => {
    it('lanza error si el carrito está vacío', () => {
        toDetalles.mockReturnValue([])

        expect(() =>
            buildPedido(makeCheckoutInput()),
        ).toThrow('El carrito está vacío.')
    })

    it('arma el payload con tipo_venta fijo WEBPAY, sucursal de origen y los detalles del carrito', () => {
        toDetalles.mockReturnValue([{ producto_id: 10, cantidad: 2 }])

        const payload = buildPedido(
            makeCheckoutInput({
                direccionId: 5,
                sucursalId: 2,
                despacho: 'EXPRESS' as CheckoutInput['despacho'],
                prioridad: 'ALTA' as CheckoutInput['prioridad'],
            }),
        )

        expect(payload).toEqual({
            direccion_entrega_id: 5,
            sucursal_origen_id: 2,
            tipo_venta: 'WEBPAY',
            tipo_despacho: 'EXPRESS',
            prioridad_medica: 'ALTA',
            observacion: undefined,
            detalles: [{ producto_id: 10, cantidad: 2 }],
        })
    })

    it('recorta espacios en la observación', () => {
        toDetalles.mockReturnValue([{ producto_id: 1, cantidad: 1 }])

        const payload = buildPedido(
            makeCheckoutInput({
                observacion: '  Entregar en portería  ',
            }),
        )

        expect(payload.observacion).toBe('Entregar en portería')
    })

    it('una observación solo de espacios se guarda como undefined (no ensucia el payload)', () => {
        toDetalles.mockReturnValue([{ producto_id: 1, cantidad: 1 }])

        const payload = buildPedido(
            makeCheckoutInput({
                observacion: '   ',
            }),
        )

        expect(payload.observacion).toBeUndefined()
    })
})

describe('checkoutService (Facade)', () => {
    it('crearDesdeCarrito arma el pedido y delega en orderService.crearPedido', async () => {
        toDetalles.mockReturnValue([{ producto_id: 1, cantidad: 1 }])
        crearPedido.mockResolvedValue({ id: 999 })

        const pedido = await checkoutService.crearDesdeCarrito(
            makeCheckoutInput({
                direccionId: 1,
                sucursalId: 3,
            }),
        )

        expect(crearPedido).toHaveBeenCalledWith(
            expect.objectContaining({
                direccion_entrega_id: 1,
                sucursal_origen_id: 3,
                tipo_venta: 'WEBPAY',
            }),
        )

        expect(pedido).toEqual({ id: 999 })
    })

    it('pagar() delega en paymentService.iniciarPago con el id del pedido', () => {
        checkoutService.pagar(999)

        expect(iniciarPago).toHaveBeenCalledWith(999)
    })

    it('limpiarCarrito() delega en cartImperative.clear()', () => {
        checkoutService.limpiarCarrito()

        expect(clear).toHaveBeenCalledOnce()
    })
})