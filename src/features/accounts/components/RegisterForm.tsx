import { forwardRef, useState, type ReactNode } from 'react';
import { Input, Select, Button, Alert } from '@/components/ui';
import type { InputProps } from '@/components/ui';
import { useRegisterForm } from '../hooks/useRegisterForm';

/* -------------------------------------------------------------------------- */
/*  Iconos del toggle de contraseña (inline, sin dependencias)                */
/* -------------------------------------------------------------------------- */

const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1 1 0 010-.644C3.423 7.51 7.36 4.5 12 4.5s8.577 3.01 9.964 7.178a1 1 0 010 .644C20.577 16.49 16.64 19.5 12 19.5s-8.577-3.01-9.964-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 002.036 12.322a1 1 0 000 .644C3.423 17.49 7.36 20.5 12 20.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.64 0 8.577 3.01 9.964 7.178a1 1 0 010 .644 10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65" />
    </svg>
);

/* -------------------------------------------------------------------------- */
/*  PasswordField — Input con toggle mostrar/ocultar (maqueta: PassInput)     */
/*  forwardRef para que react-hook-form (register) ate el ref al <input>.     */
/* -------------------------------------------------------------------------- */

const PasswordField = forwardRef<HTMLInputElement, InputProps>(
    function PasswordField(props, ref) {
        const [show, setShow] = useState(false);
        return (
            <Input
                ref={ref}
                {...props}
                type={show ? 'text' : 'password'}
                rightAddon={
                    <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        aria-pressed={show}
                        className="rounded text-text-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {show ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                }
            />
        );
    },
);

/* -------------------------------------------------------------------------- */
/*  SectionTitle — encabezado de sección con regla, estilo del kit            */
/* -------------------------------------------------------------------------- */

function SectionTitle({ children }: { children: ReactNode }) {
    return (
        <div className="mt-8 mb-4 flex items-center gap-3 first:mt-0">
            <h2 className="whitespace-nowrap text-lg font-semibold text-text">{children}</h2>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  RegisterForm                                                              */
/* -------------------------------------------------------------------------- */

export function RegisterForm() {
    const {
        form,
        onSubmit,
        isSubmitting,
        regiones,
        comunas,
        regionSelected,
        loadingRegiones,
        errorRegiones,
    } = useRegisterForm();

    const {
        register,
        setValue,
        formState: { errors },
    } = form;

    // Al cambiar de región, limpiamos la comuna previa (queda fuera de la nueva lista).
    const regionField = register('region');

    const regionPlaceholder = loadingRegiones
        ? 'Cargando regiones…'
        : errorRegiones
            ? 'No se pudieron cargar las regiones'
            : 'Selecciona una región';

    const comunaPlaceholder = regionSelected
        ? 'Selecciona una comuna'
        : 'Primero selecciona una región';

    return (
        <form
            onSubmit={onSubmit}
            noValidate
            aria-label="Formulario de creación de cuenta"
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
        >
            <div className="p-6 sm:p-8">
                {errorRegiones && (
                    <Alert variant="error" role="alert" aria-live="polite">
                        No pudimos cargar las regiones y comunas. Recarga la página e inténtalo de nuevo.
                    </Alert>
                )}

                {/* ── Datos personales ─────────────────────────────────────── */}
                <SectionTitle>Datos personales</SectionTitle>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="Nombre"
                        required
                        autoComplete="given-name"
                        placeholder="Ej: Camila"
                        error={errors.nombre?.message}
                        {...register('nombre')}
                    />
                    <Input
                        label="Apellido"
                        required
                        autoComplete="family-name"
                        placeholder="Ej: Pérez"
                        error={errors.apellido?.message}
                        {...register('apellido')}
                    />
                    <Input
                        label="Correo electrónico"
                        required
                        type="email"
                        autoComplete="email"
                        placeholder="correo@dominio.com"
                        error={errors.correo?.message}
                        {...register('correo')}
                    />
                    <Input
                        label="Teléfono"
                        required
                        type="tel"
                        autoComplete="tel"
                        placeholder="Ej: +56912345678"
                        error={errors.telefono?.message}
                        {...register('telefono')}
                    />
                    <Input
                        label="RUT"
                        required
                        inputMode="text"
                        placeholder="Ej: 12.345.678-9"
                        error={errors.rut?.message}
                        {...register('rut')}
                    />
                </div>

                {/* ── Dirección de entrega ─────────────────────────────────── */}
                <SectionTitle>Dirección de entrega</SectionTitle>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                        label="Región"
                        required
                        placeholder={regionPlaceholder}
                        disabled={loadingRegiones || errorRegiones}
                        options={regiones.map((r) => ({ value: String(r.id), label: r.nombre }))}
                        error={errors.region?.message}
                        {...regionField}
                        onChange={(e) => {
                            regionField.onChange(e);
                            setValue('comuna', '', { shouldValidate: false, shouldDirty: true });
                        }}
                    />
                    <Select
                        label="Comuna"
                        required
                        placeholder={comunaPlaceholder}
                        disabled={!regionSelected}
                        options={comunas.map((c) => ({ value: String(c.id), label: c.nombre }))}
                        error={errors.comuna?.message}
                        {...register('comuna')}
                    />
                    <Input
                        label="Dirección"
                        required
                        autoComplete="address-line1"
                        placeholder="Ej: Calle Los Boldos"
                        error={errors.calle?.message}
                        {...register('calle')}
                    />
                    <Input
                        label="Número"
                        required
                        placeholder="Ej: 123"
                        error={errors.numero?.message}
                        {...register('numero')}
                    />
                    <div className="sm:col-span-2">
                        <Input
                            label="Detalle dirección"
                            autoComplete="address-line2"
                            placeholder="Ej: Depto 201"
                            error={errors.detalle?.message}
                            {...register('detalle')}
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <Input
                            label="Referencia"
                            placeholder="Ej: Frente a la plaza"
                            error={errors.referencia?.message}
                            {...register('referencia')}
                        />
                    </div>
                </div>

                {/* ── Credenciales ─────────────────────────────────────────── */}
                <SectionTitle>Credenciales</SectionTitle>
                <div className="grid gap-4 sm:grid-cols-2">
                    <PasswordField
                        label="Contraseña"
                        required
                        autoComplete="new-password"
                        placeholder="Mínimo 6 caracteres"
                        error={errors.pass?.message}
                        {...register('pass')}
                    />
                    <PasswordField
                        label="Confirmar contraseña"
                        required
                        autoComplete="new-password"
                        placeholder="Repite tu contraseña"
                        error={errors.pass2?.message}
                        {...register('pass2')}
                    />
                </div>

                <Button type="submit" fullWidth loading={isSubmitting} disabled={isSubmitting} className="mt-8">
                    {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
                </Button>

                <p className="mt-4 text-center text-sm text-text-muted">
                    ¿Ya tienes cuenta?{' '}
                    <a href="/login" className="font-semibold text-primary hover:underline">
                        Inicia sesión
                    </a>
                </p>
            </div>
        </form>
    );
}
