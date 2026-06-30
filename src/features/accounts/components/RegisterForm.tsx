// src/features/accounts/components/RegisterForm.tsx
import { forwardRef, useState, type ReactNode } from 'react';
import { Input, Combobox, Select, Button, Alert } from '@/components/ui';
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
        submitError,
        regiones,
        comunas,
        regionSelected,
        loadingRegiones,
        errorRegiones,
    } = useRegisterForm();

    const {
        register,
        setValue,
        watch,
        formState: { errors },
    } = form;

    // Región y comuna son combobox controlados: leemos su valor del form y lo
    // escribimos con setValue (en vez de register, que es para <input>/<select>).
    const regionValue = watch('region');
    const comunaValue = watch('comuna');

    // Tipo de cuenta y documento controlan qué campos se muestran.
    const tipoCliente = watch('tipo_cliente');
    const tipoDocumento = watch('tipo_documento');
    const esInstitucional = tipoCliente === 'INSTITUCIONAL';
    // Institucional siempre va con RUT; particular respeta el documento elegido.
    const usaRut = esInstitucional || tipoDocumento === 'RUT';

    const regionPlaceholder = loadingRegiones
        ? 'Cargando regiones…'
        : errorRegiones
            ? 'No se pudieron cargar las regiones'
            : 'Busca o selecciona una región';

    const comunaPlaceholder = regionSelected
        ? 'Busca o selecciona una comuna'
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

                {/* ── Tipo de cuenta ───────────────────────────────────────── */}
                <SectionTitle>Tipo de cuenta</SectionTitle>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                        label="Tipo de cliente"
                        required
                        options={[
                            { value: 'PARTICULAR', label: 'Particular' },
                            { value: 'INSTITUCIONAL', label: 'Institucional' },
                        ]}
                        error={errors.tipo_cliente?.message}
                        {...register('tipo_cliente')}
                    />
                    {esInstitucional && (
                        <p className="self-end pb-2.5 text-sm text-text-muted">
                            Crearemos (o vincularemos) la institución con los datos que ingreses abajo.
                        </p>
                    )}
                </div>

                {/* ── Datos personales ─────────────────────────────────────── */}
                <SectionTitle>{esInstitucional ? 'Datos del responsable' : 'Datos personales'}</SectionTitle>
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

                    {/* Documento: el particular elige RUT o Pasaporte; el
                        institucional siempre usa RUT (lo exige el backend). */}
                    {!esInstitucional && (
                        <Select
                            label="Tipo de documento"
                            required
                            options={[
                                { value: 'RUT', label: 'RUT' },
                                { value: 'PASAPORTE', label: 'Pasaporte' },
                            ]}
                            error={errors.tipo_documento?.message}
                            {...register('tipo_documento')}
                        />
                    )}

                    {usaRut ? (
                        <Input
                            label="RUT"
                            required
                            inputMode="text"
                            placeholder="Ej: 12.345.678-9"
                            error={errors.rut?.message}
                            {...register('rut')}
                        />
                    ) : (
                        <Input
                            label="Pasaporte"
                            required
                            placeholder="Ej: AB1234567"
                            error={errors.pasaporte?.message}
                            {...register('pasaporte')}
                        />
                    )}
                </div>

                {/* ── Datos de la institución (solo INSTITUCIONAL) ─────────── */}
                {esInstitucional && (
                    <>
                        <SectionTitle>Datos de la institución</SectionTitle>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                label="Razón social"
                                required
                                placeholder="Ej: Clínica Los Andes SpA"
                                error={errors.razon_social?.message}
                                {...register('razon_social')}
                            />
                            <Input
                                label="RUT de la empresa"
                                required
                                inputMode="text"
                                placeholder="Ej: 76.123.456-7"
                                error={errors.rut_empresa?.message}
                                {...register('rut_empresa')}
                            />
                            <Input
                                label="Giro"
                                placeholder="Opcional · Ej: Servicios de salud"
                                error={errors.giro?.message}
                                {...register('giro')}
                            />
                            <Input
                                label="Correo de contacto"
                                type="email"
                                autoComplete="off"
                                placeholder="Opcional · contacto@institucion.cl"
                                error={errors.email_contacto?.message}
                                {...register('email_contacto')}
                            />
                        </div>
                    </>
                )}

                {/* ── Dirección de entrega ─────────────────────────────────── */}
                <SectionTitle>Dirección de entrega</SectionTitle>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Combobox
                        label="Región"
                        required
                        placeholder={regionPlaceholder}
                        emptyMessage="Sin regiones que coincidan"
                        disabled={loadingRegiones || errorRegiones}
                        options={regiones.map((r) => ({ value: String(r.id), label: r.nombre }))}
                        value={regionValue}
                        error={errors.region?.message}
                        onChange={(val) => {
                            setValue('region', val, { shouldValidate: true, shouldDirty: true });
                            // Cambió la región → la comuna previa ya no pertenece a la lista.
                            setValue('comuna', '', { shouldValidate: false, shouldDirty: true });
                        }}
                    />
                    <Combobox
                        label="Comuna"
                        required
                        placeholder={comunaPlaceholder}
                        emptyMessage="Sin comunas que coincidan"
                        disabled={!regionSelected}
                        options={comunas.map((c) => ({ value: String(c.id), label: c.nombre }))}
                        value={comunaValue}
                        error={errors.comuna?.message}
                        onChange={(val) => setValue('comuna', val, { shouldValidate: true, shouldDirty: true })}
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
                        placeholder="Mínimo 8 caracteres, con letra y número"
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

                {/* ── Aviso global de error de envío ───────────────────────── */}
                {/* El usuario solo necesita saber que falló (correo/RUT ya
                    existentes, conflicto, error de servidor, etc.). Se renderiza
                    aquí, junto al botón, donde está su foco al enviar. */}
                {submitError && (
                    <div className="mt-8">
                        <Alert variant="error" role="alert" aria-live="assertive">
                            {submitError}
                        </Alert>
                    </div>
                )}

                <Button
                    type="submit"
                    fullWidth
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className={submitError ? 'mt-4' : 'mt-8'}
                >
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
