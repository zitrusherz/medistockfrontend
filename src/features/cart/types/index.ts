
/** Línea del carrito. `code` = SKU (display/lookup); `productId` = id del backend (handoff). */
export interface CartItem {
    productId: number; // Product.id del backend → va en detalles[] del pedido
    code: string; // sku del producto (clave para setQty/removeItem)
    name: string;
    unit: string; // unidad_medida
    priceNeto: number; // valor_unitario (CLP entero)
    priceIva: number; // precio_con_iva (CLP entero)
    stockMax: number; // stock_neto en la sucursal elegida al momento de agregar
    quantity: number;
}

/** Resultado de addItem: permite mostrar el error de stock/sucursal sin lanzar excepción. */
export interface AddItemResult {
    ok: boolean;
    error?: string;
}

/** Desglose monetario (M2 — IVA 19%). */
export interface CartTotals {
    neto: number;
    iva: number;
    total: number;
}