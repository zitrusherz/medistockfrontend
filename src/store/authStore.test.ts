// Ruta destino: src/store/authStore.test.ts
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'

// authStore hace `import('../features/auth/services/authService')` de forma
// dinámica (lazy) para evitar traer axios al bundle inicial. No tenemos ese
// archivo (hace peticiones HTTP reales), así que lo mockeamos: así probamos
// SOLO la lógica del store (qué hace con la respuesta), no la red.
// vi.mock() se hoistea por encima de estas declaraciones -> hay que usar
// vi.hoisted() para poder referenciar los mocks tanto en el factory como en
// los tests de más abajo (si no, Vitest lanza "Cannot access before initialization").
const { getMe, logoutBackend } = vi.hoisted(() => ({
    getMe: vi.fn(),
    logoutBackend: vi.fn(),
}))
vi.mock('../features/auth/services/authService', () => ({
    authService: { getMe, logout: logoutBackend },
}))

// El store usa `persist` con sessionStorage. Entorno 'node' -> no existe por
// defecto: polyfill mínimo en memoria.
beforeAll(() => {
    const mem = new Map<string, string>()
    // @ts-expect-error -- polyfill mínimo solo para el test
    global.sessionStorage = {
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

import { useAuthStore } from './authStore'

beforeEach(() => {
    getMe.mockReset()
    logoutBackend.mockReset()
    useAuthStore.setState({
        accessToken: null,
        refreshToken: null,
        user: null,
        rol: null,
        status: 'idle',
    })
})

describe('authStore.login / setTokens', () => {
    it('login() guarda los tokens y pasa a status "loading"', () => {
        useAuthStore.getState().login('acc123', 'ref123')
        const s = useAuthStore.getState()
        expect(s.accessToken).toBe('acc123')
        expect(s.refreshToken).toBe('ref123')
        expect(s.status).toBe('loading')
    })

    it('setTokens() actualiza los tokens sin tocar status', () => {
        useAuthStore.setState({ status: 'authenticated' })
        useAuthStore.getState().setTokens('nuevoAcc', 'nuevoRef')
        const s = useAuthStore.getState()
        expect(s.accessToken).toBe('nuevoAcc')
        expect(s.status).toBe('authenticated')
    })
})

describe('authStore.isAuthenticated / hasRole', () => {
    it('isAuthenticated() es true solo con status "authenticated"', () => {
        useAuthStore.setState({ status: 'guest' })
        expect(useAuthStore.getState().isAuthenticated()).toBe(false)

        useAuthStore.setState({ status: 'authenticated' })
        expect(useAuthStore.getState().isAuthenticated()).toBe(true)
    })

    it('hasRole() valida contra el rol actual', () => {
        useAuthStore.setState({ rol: 'EJECUTIVO' as never })
        expect(useAuthStore.getState().hasRole(['EJECUTIVO', 'ADMINISTRADOR'] as never)).toBe(
            true,
        )
        expect(useAuthStore.getState().hasRole(['CLIENTE'] as never)).toBe(false)
    })

    it('hasRole() es false si aún no hay rol (rol === null)', () => {
        useAuthStore.setState({ rol: null })
        expect(useAuthStore.getState().hasRole(['CLIENTE'] as never)).toBe(false)
    })
})

describe('authStore.loadProfile', () => {
    it('si el backend responde ok, guarda user/rol y pasa a "authenticated"', async () => {
        getMe.mockResolvedValueOnce({ id: 1, nombre: 'Ana', rol: 'CLIENTE' })

        await useAuthStore.getState().loadProfile()

        const s = useAuthStore.getState()
        expect(s.status).toBe('authenticated')
        expect(s.rol).toBe('CLIENTE')
        expect(s.user).toEqual({ id: 1, nombre: 'Ana', rol: 'CLIENTE' })
    })

    it('si el backend falla (token inválido/expirado), limpia toda la sesión y pasa a "guest"', async () => {
        useAuthStore.setState({ accessToken: 'algo', refreshToken: 'algo', rol: 'CLIENTE' as never })
        getMe.mockRejectedValueOnce(new Error('401'))

        await useAuthStore.getState().loadProfile()

        const s = useAuthStore.getState()
        expect(s.status).toBe('guest')
        expect(s.accessToken).toBeNull()
        expect(s.refreshToken).toBeNull()
        expect(s.user).toBeNull()
        expect(s.rol).toBeNull()
    })
})

describe('authStore.logout', () => {
    it('limpia el estado local a "guest"', () => {
        useAuthStore.setState({
            accessToken: 'a',
            refreshToken: 'r',
            user: { id: 1 } as never,
            rol: 'CLIENTE' as never,
            status: 'authenticated',
        })

        useAuthStore.getState().logout()

        const s = useAuthStore.getState()
        expect(s.status).toBe('guest')
        expect(s.accessToken).toBeNull()
        expect(s.user).toBeNull()
    })

    it('si había refreshToken, avisa al backend (fire-and-forget)', async () => {
        useAuthStore.setState({ refreshToken: 'r-123' })
        useAuthStore.getState().logout()

        // el import dinámico + la llamada son asíncronos; se espera un microtask
        await new Promise((r) => setTimeout(r, 0))

        expect(logoutBackend).toHaveBeenCalledWith('r-123')
    })
})
