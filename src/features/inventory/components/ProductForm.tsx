// src/features/inventory/components/ProductForm.tsx
// T4.2 — Alta de producto (maqueta: ProductForm). Form "tonto": toda la lógica
// vive en useProductForm. Imagen → ui/FileUpload + utils/image (validate/preview).
// Secciones: datos del producto · imagen · stock inicial y lote.

import type { ReactNode } from 'react';
import { Input, Select, Textarea, Button, Alert, FileUpload } from '@/components/ui';
import { useProductForm } from '../hooks/useProductForm';
import { validateImage, fileToThumb } from '@/utils/image';
import { formatCLP } from '@/utils/formatCurrency';
import type { Categoria } from '@/types/models';

/* SectionTitle — encabezado con regla (mismo estilo que RegisterForm). */
function SectionTitle({ children }: { children: ReactNode }) {
    return (
        <div className="mt-8 mb-4 flex items-center gap-3 first:mt-0">
            <h2 className="whitespace-nowrap text-lg font-semibold text-text">{children}</h2>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>
    );
}

const SI_NO = [
    { value: 'no', label: 'No' },
    { value: 'si', label: 'Sí' },
];

interface ProductFormProps {
    /** Se llama tras crear con éxito (la sección vuelve a la lista). */
    onCreated?: () => void;
}

export function ProductForm({ onCreated }: ProductFormProps) {
    const {
        form,
        onSubmit,
        isSubmitting,
        setImagen,
        marcas,
        categorias,
        sucursales,
        loadingMarcas,
        loadingSucursales,
        errorMarcas,
        errorSucursales,
        ivaPreview,
    } = useProductForm({ onCreated });

    const {
        register,
        formState: { errors },
    } = form;

    const marcaPlaceholder = loadingMarcas
        ? 'Cargando marcas…'
        : errorMarcas
            ? 'No se pudieron cargar las marcas'
            : 'Selecciona una marca';

    const sucursalPlaceholder = loadingSucursales
        ? 'Cargando sucursales…'
        : errorSucursales
            ? 'No se pudieron cargar las sucursales'
            : 'Selecciona una sucursal';

    return (
        <form
            onSubmit={onSubmit}
            noValidate
            aria-label="Formulario de alta de producto"
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
        >
            <div className="p-6 sm:p-8">
                {(errorMarcas || errorSucursales) && (
                    <Alert variant="error" role="alert" aria-live="polite">
                        No pudimos cargar marcas o sucursales. Recarga la página e inténtalo de nuevo.
                    </Alert>
                )}

                {/* ── Datos del producto ───────────────────────────────────── */}
                <SectionTitle>Datos del producto</SectionTitle>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="Nombre"
                        required
                        placeholder="Ej: Jeringa desechable 5 ml"
                        error={errors.nombre?.message}
                        {...register('nombre')}
                    />
                    <Input
                        label="SKU"
                        placeholder="Se autogenera si lo dejas vacío"
                        error={errors.sku?.message}
                        {...register('sku')}
                    />
                    <Select
                        label="Marca"
                        required
                        placeholder={marcaPlaceholder}
                        disabled={loadingMarcas || errorMarcas}
                        options={marcas.map((m) => ({ value: String(m.id), label: m.nombre }))}
                        error={errors.marcaId?.message}
                        {...register('marcaId')}
                    />
                    <Select
                        label="Categoría"
                        placeholder="Sin categoría"
                        disabled={!categorias.length}
                        options={categorias.map((c: Categoria) => ({ value: String(c.id), label: c.nombre }))}
                        error={errors.categoriaId?.message}
                        {...register('categoriaId')}
                    />
                    <Input
                        label="Unidad de medida"
                        required
                        placeholder="Ej: Unidad, Caja, Par"
                        error={errors.unidadMedida?.message}
                        {...register('unidadMedida')}
                    />
                    <div>
                        <Input
                            label="Precio neto (CLP)"
                            required
                            inputMode="numeric"
                            placeholder="Ej: 1990"
                            error={errors.valorUnitario?.message}
                            {...register('valorUnitario')}
                        />
                        {ivaPreview && !errors.valorUnitario && (
                            <p className="mt-1.5 text-xs text-text-muted">
                                Con IVA (19%): <span className="font-medium text-text">{formatCLP(ivaPreview.total)}</span>
                            </p>
                        )}
                    </div>
                    <Input
                        label="Registro sanitario"
                        placeholder="Opcional"
                        error={errors.registroSanitario?.message}
                        {...register('registroSanitario')}
                    />
                    <Select
                        label="¿Requiere control de vencimiento?"
                        options={SI_NO}
                        error={errors.requiereControlVencimiento?.message}
                        {...register('requiereControlVencimiento')}
                    />
                    <Select
                        label="¿Es caja / bulto?"
                        options={SI_NO}
                        error={errors.esCaja?.message}
                        {...register('esCaja')}
                    />
                    <div className="sm:col-span-2">
                        <Textarea
                            label="Descripción"
                            placeholder="Detalle del producto (opcional)"
                            rows={3}
                            error={errors.descripcion?.message}
                            {...register('descripcion')}
                        />
                    </div>
                </div>

                {/* ── Imagen ───────────────────────────────────────────────── */}
                <SectionTitle>Imagen</SectionTitle>
                <FileUpload
                    label="Imagen del producto"
                    accept="image/png,image/jpeg,image/webp"
                    maxSize={5 * 1024 * 1024}
                    hint="PNG, JPG o WEBP. Máx. 5 MB. Opcional."
                    multiple={false}
                    validate={validateImage}
                    getPreview={fileToThumb}
                    onFilesChange={(files) => setImagen(files[0] ?? null)}
                />

                {/* ── Stock inicial y lote ─────────────────────────────────── */}
                <SectionTitle>Stock inicial y lote</SectionTitle>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                        label="Sucursal"
                        required
                        placeholder={sucursalPlaceholder}
                        disabled={loadingSucursales || errorSucursales}
                        options={sucursales.map((s) => ({ value: String(s.id), label: s.nombre }))}
                        error={errors.sucursalId?.message}
                        {...register('sucursalId')}
                    />
                    <Input
                        label="Stock inicial (unidades)"
                        required
                        inputMode="numeric"
                        placeholder="Ej: 100"
                        error={errors.cantidad?.message}
                        {...register('cantidad')}
                    />
                    <Input
                        label="Stock crítico (umbral de alerta)"
                        inputMode="numeric"
                        placeholder="Opcional, ej: 10"
                        error={errors.stockCritico?.message}
                        {...register('stockCritico')}
                    />
                    <Input
                        label="Código de lote"
                        required
                        placeholder="Ej: L-2026-0001"
                        error={errors.codigoLote?.message}
                        {...register('codigoLote')}
                    />
                    <Input
                        label="Fecha de elaboración"
                        required
                        type="date"
                        error={errors.fechaElaboracion?.message}
                        {...register('fechaElaboracion')}
                    />
                    <Input
                        label="Fecha de vencimiento"
                        required
                        type="date"
                        error={errors.fechaVencimiento?.message}
                        {...register('fechaVencimiento')}
                    />
                </div>

                <Button
                    type="submit"
                    fullWidth
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="mt-8"
                >
                    {isSubmitting ? 'Ingresando producto…' : 'Ingresar producto'}
                </Button>
            </div>
        </form>
    );
}