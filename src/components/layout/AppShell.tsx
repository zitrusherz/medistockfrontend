import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuthStore } from '@/store/authStore.ts';
import { queryClient } from '@/lib/queryClient.ts';
import { Navbar } from './Navbar';
import { RoleSidebar } from './RoleSidebar';
import { LogoMark } from './LogoMark';
import { itemsForRole } from './navItems';
import { MenuIcon, SearchIcon, BellIcon } from '../ui/icons';

/**
 * AppShell (T1.6) — chrome de los paneles internos.
 *
 * Responsabilidades:
 *  - Lee rol/usuario del authStore (fuente de verdad del rol).
 *  - Filtra NAV_ITEMS por rol (itemsForRole) → un único Sidebar sirve a todos.
 *  - Estado de layout: `collapsed` (rail desktop) y `mobileOpen` (off-canvas).
 *  - Logout: invalida la caché de React Query ANTES de limpiar la sesión.
 *
 * Patrón Composite (composición de chrome) + Proxy a nivel ruta lo aplica
 * RoleRoute aguas arriba (este shell asume que ya hay sesión y rol válidos).
 *
 * NOTA de layout: no se usa el `marginLeft` inline del DashboardLayout del kit
 * porque no es responsive (empujaría el contenido en móvil). Aquí el offset es
 * por clases `lg:` para M14.
 *
 * Se usa como elemento de ruta-layout: las páginas hijas entran por <Outlet/>.
 */
interface AppShellProps {
  /** Badges numéricos por clave (ej. { pendingOrders: 3 }). Opcional. */
  badges?: Record<string, number>;
}

export function AppShell({ badges = {} }: AppShellProps) {
  const navigate = useNavigate();
  const rol = useAuthStore((s) => s.rol);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = itemsForRole(rol);

  // Nombre a mostrar — defensivo: confirmar campos reales de PerfilMe (types/auth.ts).
  const u = user as unknown as { nombre?: string; apellido?: string; email?: string } | null;
  const displayName =
    [u?.nombre, u?.apellido].filter(Boolean).join(' ').trim() || u?.email || 'Usuario';
  const initials =
    ((u?.nombre?.[0] ?? '') + (u?.apellido?.[0] ?? '')).toUpperCase() ||
    displayName.slice(0, 2).toUpperCase();

  function handleLogout() {
    // DoD: el logout invalida la caché de React Query (datos de otro rol no deben
    // quedar cacheados para el siguiente login).
    queryClient.clear();
    logout();
    navigate('/', { replace: true });
  }

  const mainMargin = collapsed ? 'lg:ml-16' : 'lg:ml-[244px]';

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar fijo (h-14) */}
      <Navbar
        brand={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-grape-700 hover:text-plum-700"
              aria-label="Abrir menú"
            >
              <MenuIcon size={22} />
            </button>
            {/* Marca compacta en móvil (en desktop el logo vive en el sidebar) */}
            <div className="lg:hidden">
              <div className="rounded-md bg-plum-800 px-2 py-1">
                <LogoMark collapsed caption="" />
              </div>
            </div>
          </div>
        }
        center={
          <div className="hidden md:flex items-center rounded-lg ring-1 ring-grape-200 overflow-hidden w-full max-w-md focus-within:ring-2 focus-within:ring-grape-500">
            <span className="pl-3 text-grape-400">
              <SearchIcon size={18} />
            </span>
            <input
              placeholder="Buscar…"
              aria-label="Buscar"
              className="flex-1 px-2.5 py-2 text-[13px] outline-none text-ink placeholder:text-grape-300 bg-transparent"
            />
          </div>
        }
        end={
          <>
            <button
              type="button"
              className="relative text-grape-500 hover:text-plum-700"
              aria-label="Notificaciones"
            >
              <BellIcon size={20} />
              {badges.pendingOrders ? (
                <span className="absolute -top-1.5 -right-1.5 bg-gold-400 text-plum-800 text-[10px] font-bold w-4 h-4 grid place-items-center rounded-full">
                  {badges.pendingOrders}
                </span>
              ) : null}
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-grape-100">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-plum-700 to-grape-500 grid place-items-center text-white font-bold text-[13px]">
                {initials}
              </div>
              <div className="hidden sm:block leading-tight">
                <span className="block text-[13px] font-bold text-ink truncate max-w-35">
                  {displayName}
                </span>
                {rol && <span className="block text-[11px] text-grape-500">{rol.replace('_', ' ')}</span>}
              </div>
            </div>
          </>
        }
      />

      {/* Sidebar rol-aware */}
      <RoleSidebar
        items={items}
        rol={rol}
        displayName={displayName}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        badges={badges}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onCloseMobile={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      {/* Backdrop del off-canvas (solo móvil) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-14 z-30 bg-plum-800/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Contenido — offset por Navbar (pt-14) y Sidebar (lg:ml-*) */}
      <main
        className={['pt-14 min-h-screen transition-[margin-left] duration-300', mainMargin].join(' ')}
      >
        <div className="p-5 sm:p-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
