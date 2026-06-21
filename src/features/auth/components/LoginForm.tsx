import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '../hooks/useLogin';
import { Input, Button, Alert } from '@/components/ui';
import type { NormalizedError } from '@/types/api';

// Zod valida antes de enviar. En login NO se valida largo de contraseña
// (solo que exista): el largo lo decide el backend, y un min(8) aquí rechaza
// credenciales legítimas más cortas. El nombre del campo (username) debe
// coincidir con LoginRequest de @/types/auth.
const loginSchema = z.object({
    username: z.string().min(1, 'El correo es requerido').email('Ingresa un correo válido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
    const { mutate: doLogin, isPending, error } = useLogin();
    const apiError = error as NormalizedError | null;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginFormData) => doLogin(data);

    // Solo el 401 se muestra inline ("credenciales malas" del DoD). El resto
    // (500 / red / 502) lo manda useLogin.onError al toast global.
    const credentialsError =
        apiError?.status === 401 ? 'Correo o contraseña incorrectos' : null;

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Formulario de inicio de sesión"
            className="flex flex-col gap-4 w-80"
        >
            <h1 className="text-2xl font-bold">Iniciar sesión</h1>

            <Input
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                placeholder="correo@ejemplo.cl"
                error={errors.username?.message}
                aria-invalid={!!errors.username}
                {...register('username')}
            />

            <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                aria-invalid={!!errors.password}
                {...register('password')}
            />

            {/* Error de credenciales: inline, cerca del form, anunciado a lectores */}
            {credentialsError && (
                <Alert variant="error" role="alert" aria-live="polite">
                    {credentialsError}
                </Alert>
            )}

            <Button type="submit" fullWidth loading={isPending} disabled={isPending}>
                {isPending ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </Button>
        </form>
    );
}