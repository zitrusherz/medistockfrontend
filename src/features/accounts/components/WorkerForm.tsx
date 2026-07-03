

import { forwardRef, useState, type ReactNode } from 'react';
import { Input, Select, Button } from '@/components/ui';
import type { InputProps } from '@/components/ui';
import { useWorkerForm } from '../hooks/useWorkerForm';

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

function SectionTitle({ children }: { children: ReactNode }) {
    return (
        <div className="mt-8 mb-4 flex items-center gap-3 first:mt-0">
            <h3 className="whitespace-nowrap text-base font-semibold text-text">{children}</h3>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  WorkerForm                                                                */
/* -------------------------------------------------------------------------- */

export function WorkerForm() {
    const { form, onSubmit, isSubmitting, roleOptions } = useWorkerForm();
    const {
        register,
        formState: { errors },
    } = form;

    return (
        <form
            onSubmit={onSubmit}
            noValidate
            aria-label="Formulario de alta de trabajador"
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
        >
            <div className="p-6">
                {/* ── Datos de la persona ──────────────────────────────────── */}
                <SectionTitle>Datos del trabajador</SectionTitle>
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
                        label="Correo corporativo"
                        required
                        type="email"
                        autoComplete="email"
                        placeholder="nombre@medistock.cl"
                        error={errors.correo?.message}
                        {...register('correo')}
                    />
                    <Input
                        label="RUT"
                        required
                        inputMode="text"
                        placeholder="Ej: 12.345.678-9"
                        error={errors.rut?.message}
                        {...register('rut')}
                    />
                    <Select
                        label="Rol"
                        required
                        placeholder="Selecciona un rol"
                        options={roleOptions}
                        error={errors.rol?.message}
                        {...register('rol')}
                    />
                    <Input
                        label="Teléfono"
                        type="tel"
                        autoComplete="tel"
                        placeholder="Opcional · +56912345678"
                        error={errors.telefono?.message}
                        {...register('telefono')}
                    />
                </div>

                {/* ── Credenciales de acceso ───────────────────────────────── */}
                <SectionTitle>Credenciales de acceso</SectionTitle>
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
                        placeholder="Repite la contraseña"
                        error={errors.pass2?.message}
                        {...register('pass2')}
                    />
                </div>

                <Button type="submit" fullWidth loading={isSubmitting} disabled={isSubmitting} className="mt-8">
                    {isSubmitting ? 'Creando cuenta…' : 'Crear trabajador'}
                </Button>
            </div>
        </form>
    );
}
