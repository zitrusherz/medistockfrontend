// Ruta destino: src/store/cartStore.test.ts
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { useCartStore } from './cartStore'
import type { Product } from '@/types/models'


beforeAll(() => {
    const mem = new Map<string, string>()
    // @ts-expect-error -- polyfill mínimo solo para el test, no implementa el Storage completo
    global.localStorage = {
        getItem: (k: string) => mem.get(k) ?? null,
        setItem: (k: string, v: string) => void mem.set(k, v),
        removeItem: (k: string) => void mem.delete(k),
        clear: () => mem.clear(),
        key: () => null,
        get length() {
            return mem.size
        },
    }
})

beforeEach(() => {
    useCartStore.setState({ items: [] })
})

/** Fixture mínimo: solo los campos que cartStore.addItem realmente lee. */
const makeProduct = (overrides: Partial<Product> = {}): Product =>
    ({
        id: 1,
        code: 'SKU-001',
        name: 'Jeringa 5ml',
        unit: 'UN',
        priceNeto: 1000,
        priceIva: 1190,
        stockTotal: 5,
        imageUrl: null,
        ...overrides,
    }) as Product

describe('cartStore.addItem', () => {
    it('agrega un producto nuevo con la cantidad indicada', () => {
        const r = useCartStore.getState().addItem(makeProduct(), 2)
        expect(r.ok).toBe(true)
        expect(useCartStore.getState().items).toHaveLength(1)
        expect(useCartStore.getState().items[0]?.quantity).toBe(2)
    })

    it('rechaza productos sin stock', () => {
        const r = useCartStore.getState().addItem(makeProduct({ stockTotal: 0 }), 1)
        expect(r.ok).toBe(false)
        expect(r.error).toMatch(/sin stock/i)
        expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('rechaza si la cantidad supera el stock disponible', () => {
        const r = useCartStore.getState().addItem(makeProduct({ stockTotal: 3 }), 10)
        expect(r.ok).toBe(false)
        expect(r.error).toMatch(/stock insuficiente/i)
    })

    it('si el producto ya está en el carrito, acumula la cantidad en vez de duplicar', () => {
        const product = makeProduct({ stockTotal: 10 })
        useCartStore.getState().addItem(product, 2)
        const r2 = useCartStore.getState().addItem(product, 3)

        expect(r2.ok).toBe(true)
        expect(useCartStore.getState().items).toHaveLength(1)
        expect(useCartStore.getState().items[0]?.quantity).toBe(5)
    })

    it('la cantidad mínima es 1 (nunca 0 o negativa)', () => {
        useCartStore.getState().addItem(makeProduct({ stockTotal: 10 }), 0)
        expect(useCartStore.getState().items[0]?.quantity).toBe(1)
    })
})

describe('cartStore.setQty', () => {
    it('actualiza la cantidad de un item existente', () => {
        const product = makeProduct({ stockTotal: 10 })
        useCartStore.getState().addItem(product, 1)
        useCartStore.getState().setQty(product.code, 4)
        expect(useCartStore.getState().items[0]?.quantity).toBe(4)
    })

    it('no permite superar el stockMax guardado en el item', () => {
        const product = makeProduct({ stockTotal: 5 })
        useCartStore.getState().addItem(product, 1)
        useCartStore.getState().setQty(product.code, 999)
        expect(useCartStore.getState().items[0]?.quantity).toBe(5)
    })

    it('cantidad 0 elimina el item del carrito', () => {
        const product = makeProduct({ stockTotal: 5 })
        useCartStore.getState().addItem(product, 2)
        useCartStore.getState().setQty(product.code, 0)
        expect(useCartStore.getState().items).toHaveLength(0)
    })
})

describe('cartStore.removeItem / clear', () => {
    it('elimina un item puntual', () => {
        const a = makeProduct({ code: 'A', stockTotal: 5 })
        const b = makeProduct({ code: 'B', stockTotal: 5 })
        useCartStore.getState().addItem(a, 1)
        useCartStore.getState().addItem(b, 1)

        useCartStore.getState().removeItem('A')

        expect(useCartStore.getState().items.map((i) => i.code)).toEqual(['B'])
    })

    it('clear() vacía todo el carrito', () => {
        useCartStore.getState().addItem(makeProduct({ stockTotal: 5 }), 1)
        useCartStore.getState().clear()
        expect(useCartStore.getState().items).toHaveLength(0)
    })
})

describe('cartStore selectores', () => {
    it('count() suma las cantidades de todos los items', () => {
        useCartStore.getState().addItem(makeProduct({ code: 'A', stockTotal: 10 }), 2)
        useCartStore.getState().addItem(makeProduct({ code: 'B', stockTotal: 10 }), 3)
        expect(useCartStore.getState().count()).toBe(5)
    })

    it('subtotalNeto() suma priceNeto * quantity', () => {
        useCartStore.getState().addItem(
            makeProduct({ code: 'A', priceNeto: 1000, stockTotal: 10 }),
            2,
        )
        expect(useCartStore.getState().subtotalNeto()).toBe(2000)
    })

    it('totalEstimado() calcula neto/iva/total', () => {
        useCartStore.getState().addItem(
            makeProduct({ code: 'A', priceNeto: 1000, priceIva: 1190, stockTotal: 10 }),
            2,
        )
        const t = useCartStore.getState().totalEstimado()
        expect(t.neto).toBe(2000)
        expect(t.total).toBe(2380)
        expect(t.iva).toBe(380)
    })

    it('toDetalles() mapea a {producto_id, cantidad} para el checkout', () => {
        useCartStore.getState().addItem(makeProduct({ id: 42, stockTotal: 10 }), 3)
        expect(useCartStore.getState().toDetalles()).toEqual([
            { producto_id: 42, cantidad: 3 },
        ])
    })
})
