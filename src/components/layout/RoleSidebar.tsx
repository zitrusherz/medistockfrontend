// src/components/layout/RoleSidebar.tsx
import { NavLink } from 'react-router';
import type { Rol } from '@/types/roles.ts';
import type { NavItem } from './navItems';
import { LogoMark } from './LogoMark';
import { LogoutIcon, ChevronLeftIcon, XIcon } from '../ui/icons';
import { prefetchPage } from '@/router/prefetchPages';


interface RoleSidebarProps {
  items: NavItem[];
  rol: Rol | null;
  /** Nombre a mostrar en el bloque de usuario. */
  displayName: string;
  /** Rail de iconos (desktop). */
  collapsed: boolean;
  /** Off-canvas abierto (móvil). */
  mobileOpen: boolean;
  /** Mapa de badges numéricos por clave (ej. { pendingOrders: 3 }). */
  badges?: Record<string, number>;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export function RoleSidebar({
  items,
  rol,
  displayName,
  collapsed,
  mobileOpen,
  badges = {},
  onToggleCollapse,
  onCloseMobile,
  onLogout,
}: RoleSidebarProps) {
  const widthCls = collapsed ? 'lg:w-16' : 'lg:w-[244px]';
  const mobileCls = mobileOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <aside
      className={[
        'fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] flex-col',
        'bg-plum-800 border-r border-white/10 overflow-hidden',
        'w-61 transition-[width,transform] duration-300',
        widthCls,
        // Off-canvas en móvil; siempre visible en lg+
        mobileCls,
        'lg:translate-x-0',
      ].join(' ')}
      aria-label="Navegación principal"
    >
      {/* Cabecera con logo + cerrar (móvil) */}
      <div className="px-4 h-15 flex items-center justify-between border-b border-white/10 shrink-0">
        <LogoMark collapsed={collapsed} caption={(rol ?? 'PANEL').replace('_', ' ')} />
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden text-grape-200/80 hover:text-white"
          aria-label="Cerrar menú"
        >
          <XIcon size={20} />
        </button>
      </div>

      {/* Navegación filtrada por rol */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const count = item.badge ? badges[item.badge] : undefined;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onCloseMobile}

              onMouseEnter={() => prefetchPage(item.path)}
              onFocus={() => prefetchPage(item.path)}
              className={({ isActive }) =>
                [
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/60',
                  collapsed ? 'lg:justify-center' : '',
                  isActive
                    ? 'bg-white/12 text-white ring-1 ring-gold-400/40'
                    : 'text-grape-200/80 hover:bg-white/8 hover:text-white',
                ].join(' ')
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <span className={['shrink-0', isActive ? 'text-gold-300' : 'text-grape-300/70'].join(' ')}>
                    <Icon size={20} />
                  </span>
                  {!collapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
                  {!collapsed && count ? (
                    <span className="text-[11px] font-bold bg-gold-400 text-plum-800 px-1.5 py-0.5 rounded-full min-w-5 text-center">
                      {count}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Pie: usuario + colapsar + logout */}
      <div className="p-3 border-t border-white/10 shrink-0 space-y-1">
        {!collapsed && (
          <div className="px-3 py-2 text-[12px] text-grape-300">
            <p className="font-bold text-white truncate">{displayName}</p>
            {rol && <p className="truncate">{rol.replace('_', ' ')}</p>}
          </div>
        )}

        {/* Colapsar (solo desktop) */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-semibold text-grape-200/80 hover:bg-white/8 hover:text-white transition-colors"
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <ChevronLeftIcon
            size={18}
            className={['shrink-0 transition-transform duration-300', collapsed ? 'rotate-180' : ''].join(' ')}
          />
          {!collapsed && <span>Colapsar</span>}
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          className={[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-semibold',
            'text-grape-200/80 hover:bg-white/8 hover:text-white transition-colors',
            collapsed ? 'lg:justify-center' : '',
          ].join(' ')}
        >
          <LogoutIcon size={18} className="shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
