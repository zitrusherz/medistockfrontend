// Ruta destino: src/features/catalog/services/mappers/productMapper.test.ts
import { describe, it, expect } from 'vitest'
import { toProduct, toMarca, toCategoria } from './productMapper'
import type { CatalogoProductoDTO } from '../../types'

const baseDTO = (overrides: Partial<CatalogoProductoDTO> = {}): CatalogoProductoDTO =>
    ({
        id: 1,
        sku: 'SKU-001',
        nombre: 'Jeringa 5ml',
        marca: { id: 9, nombre: 'MedBrand' },
        categorias: [],
        unidad_medida: 'UN',
        descripcion: 'Jeringa desechable',
        registro_sanitario: 'ISP-123',
        requiere_control_vencimiento: true,
        es_caja: false,
        activo: true,
        valor_unitario: 1000,
        precio_con_iva: 1190,
        stock_por_sucursal: [],
        imagen_url: null,
        ...overrides,
    }) as CatalogoProductoDTO

describe('toProduct', () => {
    it('mapea los campos básicos DTO -> modelo', () => {
        const p = toProduct(baseDTO())
        expect(p.code).toBe('SKU-001')
        expect(p.name).toBe('Jeringa 5ml')
        expect(p.brand).toBe('MedBrand')
        expect(p.brandId).toBe(9)
        expect(p.priceNeto).toBe(1000)
        expect(p.priceIva).toBe(1190)
    })

    it('usa "—" como marca cuando no viene marca', () => {
        const p = toProduct(baseDTO({ marca: null as never }))
        expect(p.brand).toBe('—')
        expect(p.brandId).toBeNull()
    })

    it('mapea stock por sucursal y calcula stockTotal como la suma', () => {
        const p = toProduct(
            baseDTO({
                stock_por_sucursal: [
                    { sucursal_id: 1, sucursal_nombre: 'Providencia', stock_neto: 5 },
                    { sucursal_id: 2, sucursal_nombre: 'Ñuñoa', stock_neto: 3 },
                ] as never,
            }),
        )
        expect(p.stockBySucursal).toHaveLength(2)
        expect(p.stockBySucursal[0]).toEqual({
            sucursalId: 1,
            sucursalNombre: 'Providencia',
            stock: 5,
        })
        expect(p.stockTotal).toBe(8)
    })

    it('stockTotal es 0 cuando no hay stock en ninguna sucursal', () => {
        const p = toProduct(baseDTO({ stock_por_sucursal: [] as never }))
        expect(p.stockTotal).toBe(0)
    })

    it('extrae el nombre de categorías con el shape anidado real del backend', () => {
        const p = toProduct(
            baseDTO({
                categorias: [
                    { id: 80, categoria: { id: 15, nombre: 'Antisépticos' } },
                ] as never,
            }),
        )
        expect(p.categories).toEqual(['Antisépticos'])
    })

    it('tolera shapes alternativos de categoría (compat) y descarta vacíos', () => {
        const p = toProduct(
            baseDTO({
                categorias: [
                    { id: 1, categoria: { id: 1, nombre: '' } }, // nombre vacío -> se filtra
                    { id: 2, nombre: 'CategoriaPlana' }, // shape aplanado
                    'CategoriaString', // shape antiguo: string directo
                    null,
                ] as never,
            }),
        )
        expect(p.categories).toEqual(['CategoriaPlana', 'CategoriaString'])
    })

    it('usa null como imageUrl cuando el producto no tiene foto', () => {
        const p = toProduct(baseDTO({ imagen_url: undefined as never }))
        expect(p.imageUrl).toBeNull()
    })
})

describe('toMarca / toCategoria', () => {
    it('mapean id/nombre/activo tal cual', () => {
        expect(toMarca({ id: 1, nombre: 'MedBrand', activo: true } as never)).toEqual({
            id: 1,
            nombre: 'MedBrand',
            activo: true,
        })
        expect(toCategoria({ id: 2, nombre: 'Insumos', activo: false } as never)).toEqual({
            id: 2,
            nombre: 'Insumos',
            activo: false,
        })
    })
})
