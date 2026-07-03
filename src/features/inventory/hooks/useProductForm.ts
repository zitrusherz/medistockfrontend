

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { inventoryService } from '../services/inventoryService';
import { useMarcas } from './useMarcas';
import { useCategorias } from './useCategorias';
import { useSucursalesActivas } from './useSucursalesActivas';
import { useToast } from '@/components/ui';
import { notifyApiError } from '@/utils/notifyApiError';
import { desgloseIVA } from '@/utils/iva';
import type { ApiError } from '@/lib/axios';
import type { IngresarProductoRequest } from '../types';

/* -------------------------------------------------------------------------- */
/*  Esquema de validación (zod) — todo string, se convierte en el builder     */
/* -------------------------------------------------------------------------- */

const soloEnteros = (v: string) => /^\d+$/.test(v);

export const productoSchema = z
    .object({
        // Datos del producto
        nombre: z.string().trim().min(1, 'Ingresa el nombre del producto'),
        sku: z.string().trim().optional(), // si va vacío, se autogenera
        marcaId: z.string().min(1, 'Selecciona una marca'),
        categoriaId: z.string().optional(),
        unidadMedida: z.string().trim().min(1, 'Indica la unidad de medida'),
        valorUnitario: z
            .string()
            .trim()
            .min(1, 'Ingresa el precio')
            .refine(soloEnteros, 'Precio en pesos enteros, sin puntos ni decimales'),
        descripcion: z.string().trim().optional(),
        registroSanitario: z.string().trim().optional(),
        requiereControlVencimiento: z.enum(['si', 'no']),
        esCaja: z.enum(['si', 'no']),

        // Stock inicial + lote (el endpoint combinado los exige)
        sucursalId: z.string().min(1, 'Selecciona la sucursal'),
        cantidad: z
            .string()
            .trim()
            .min(1, 'Ingresa el stock inicial')
            .refine(soloEnteros, 'Cantidad entera, sin decimales'),
        stockCritico: z
            .string()
            .trim()
            .optional()
            .refine((v) => !v || soloEnteros(v), 'Umbral entero, sin decimales'),
        codigoLote: z.string().trim().min(1, 'Ingresa el código de lote'),
        fechaElaboracion: z.string().min(1, 'Ingresa la fecha de elaboración'),
        fechaVencimiento: z.string().min(1, 'Ingresa la fecha de vencimiento'),
    })
    .refine((d) => d.fechaVencimiento >= d.fechaElaboracion, {
        path: ['fechaVencimiento'],
        message: 'El vencimiento no puede ser anterior a la elaboración',
    });

export type ProductoFormValues = z.infer<typeof productoSchema>;

/* -------------------------------------------------------------------------- */
/*  Builder: form plano → IngresarProductoRequest (Adapter del alta)          */
/* -------------------------------------------------------------------------- */

/** SKU de respaldo cuando el usuario no escribe uno. */
function generarSku(nombre: string): string {
    const base = nombre
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quita acentos
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 12);
    const sufijo = Date.now().toString().slice(-5);
    return `${base || 'PROD'}-${sufijo}`;
}

function buildIngreso(v: ProductoFormValues): IngresarProductoRequest {
    return {
        sku: v.sku?.trim() || generarSku(v.nombre),
        nombre: v.nombre.trim(),
        descripcion: v.descripcion?.trim() || undefined,
        valor_unitario: Number(v.valorUnitario),
        marca_id: Number(v.marcaId),
        unidad_medida: v.unidadMedida.trim(),
        requiere_control_vencimiento: v.requiereControlVencimiento === 'si',
        registro_sanitario: v.registroSanitario?.trim() || undefined,
        es_caja: v.esCaja === 'si',
        categoria_ids: v.categoriaId ? [Number(v.categoriaId)] : undefined,
        codigo_lote: v.codigoLote.trim(),
        fecha_elaboracion: v.fechaElaboracion,
        fecha_vencimiento: v.fechaVencimiento,
        sucursal_id: Number(v.sucursalId),
        cantidad: Number(v.cantidad),
        stock_critico: v.stockCritico ? Number(v.stockCritico) : undefined,
        motivo: 'Ingreso inicial de producto',
    };
}

/* -------------------------------------------------------------------------- */
/*  Mapeo de errores del backend → campos del formulario                      */
/* -------------------------------------------------------------------------- */

const SERVER_TO_FORM: Record<string, Path<ProductoFormValues>> = {
    sku: 'sku',
    nombre: 'nombre',
    valor_unitario: 'valorUnitario',
    marca_id: 'marcaId',
    categoria_ids: 'categoriaId',
    unidad_medida: 'unidadMedida',
    registro_sanitario: 'registroSanitario',
    descripcion: 'descripcion',
    codigo_lote: 'codigoLote',
    fecha_elaboracion: 'fechaElaboracion',
    fecha_vencimiento: 'fechaVencimiento',
    sucursal_id: 'sucursalId',
    cantidad: 'cantidad',
    stock_critico: 'stockCritico',
};

/* -------------------------------------------------------------------------- */
/*  Defaults: fechas razonables (hoy / +1 año)                                */
/* -------------------------------------------------------------------------- */

const hoyISO = () => new Date().toISOString().slice(0, 10);
const en1AnioISO = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
};

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

interface UseProductFormOptions {
    /** Se llama tras crear con éxito (p. ej. volver a la pestaña de lista). */
    onCreated?: () => void;
}

export function useProductForm({ onCreated }: UseProductFormOptions = {}) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // La imagen es un File (no entra a react-hook-form, que maneja strings).
    const [imagen, setImagen] = useState<File | null>(null);

    const { marcas, isLoading: loadingMarcas, isError: errorMarcas } = useMarcas();

    const categoriasQuery = useCategorias();
    const categorias = categoriasQuery.data ?? [];
    const loadingCategorias = categoriasQuery.isLoading;
    const {
        sucursales,
        isLoading: loadingSucursales,
        isError: errorSucursales,
    } = useSucursalesActivas();

    const form = useForm<ProductoFormValues>({
        resolver: zodResolver(productoSchema),
        defaultValues: {
            nombre: '',
            sku: '',
            marcaId: '',
            categoriaId: '',
            unidadMedida: 'Unidad',
            valorUnitario: '',
            descripcion: '',
            registroSanitario: '',
            requiereControlVencimiento: 'no',
            esCaja: 'no',
            sucursalId: '',
            cantidad: '',
            stockCritico: '',
            codigoLote: '',
            fechaElaboracion: hoyISO(),
            fechaVencimiento: en1AnioISO(),
        },
    });


    const precioRaw = useWatch({ control: form.control, name: 'valorUnitario' });
    const ivaPreview = soloEnteros(precioRaw ?? '')
        ? desgloseIVA(Number(precioRaw))
        : null;

    const mutation = useMutation({
        mutationFn: (values: ProductoFormValues) =>
            inventoryService.ingresarProducto(buildIngreso(values), imagen),

        onSuccess: (res) => {

            queryClient.invalidateQueries({ queryKey: ['catalogo'] });
            queryClient.invalidateQueries({ queryKey: ['productos'] });

            toast({
                title: 'Producto ingresado',
                description: `${res.sku} creado con stock inicial de ${res.stock_actual} u.`,
            });

            form.reset();
            setImagen(null);
            onCreated?.();
        },

        onError: (err) => {
            const apiErr = err as ApiError;

            // 400 con errores por campo → pintarlos junto al input (no solo toast).
            if (apiErr.hasFieldErrors && apiErr.fieldErrors) {
                let firstField: Path<ProductoFormValues> | null = null;
                const unmapped: string[] = [];

                Object.entries(apiErr.fieldErrors).forEach(([serverKey, msgs]) => {
                    const formField = SERVER_TO_FORM[serverKey];
                    const message = msgs?.[0] ?? 'Dato inválido';
                    if (formField) {
                        form.setError(formField, { type: 'server', message });
                        if (!firstField) firstField = formField;
                    } else {
                        unmapped.push(`${serverKey}: ${message}`);
                    }
                });

                if (firstField) form.setFocus(firstField);
                if (unmapped.length > 0) {
                    toast({ title: 'Revisa los datos', description: unmapped.join(' · ') });
                }
                return;
            }

            // Red, 409, 500, 502, etc. → toast traducido.
            notifyApiError(apiErr, toast);
        },
    });

    const onSubmit = form.handleSubmit((values) => mutation.mutate(values));

    return {
        form,
        onSubmit,
        isSubmitting: mutation.isPending,
        // Imagen (fuera de RHF)
        imagen,
        setImagen,
        // Datos de selects
        marcas,
        categorias,
        sucursales,
        loadingMarcas,
        loadingCategorias,
        loadingSucursales,
        errorMarcas,
        errorSucursales,
        // Preview IVA
        ivaPreview,
    };
}