import type { LucideIcon } from 'lucide-react';
import { Roles, type Rol } from '@/types/roles.ts';
import {
  DashboardIcon,
  StatsIcon,
  OrdersIcon,
  ProductsIcon,
  WorkersIcon,
  CustomersIcon,
  DollarIcon,
  WarnIcon,
  KeyIcon,
} from '../ui/icons';



/** Los iconos son componentes lucide; aceptan size/className. */
export type NavIconComponent = LucideIcon;

export interface NavItem {
  path: string;
  label: string;
  icon: NavIconComponent;
  roles: Rol[];
  /** Clave del badge numérico (la resuelve el shell, ej. 'pendingOrders'). */
  badge?: string;
  /** Match EXACTO de ruta (para los "Inicio" de cada rol, evita activar hijos). */
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  // ── Cliente (Institución / Paciente) ──────────────────────────────────
  { path: '/cliente',          label: 'Mi cuenta',    icon: DashboardIcon, roles: [Roles.CLIENTE], end: true },
  { path: '/cliente/pedidos',  label: 'Mis pedidos',  icon: OrdersIcon,    roles: [Roles.CLIENTE] },
  { path: '/cliente/pagos',    label: 'Mis pagos',    icon: DollarIcon,    roles: [Roles.CLIENTE] },

  // ── Ejecutivo de Cuentas ──────────────────────────────────────────────
  { path: '/ejecutivo',          label: 'Inicio',   icon: DashboardIcon, roles: [Roles.EJECUTIVO], end: true },
  { path: '/ejecutivo/pedidos',  label: 'Pedidos',  icon: OrdersIcon,    roles: [Roles.EJECUTIVO], badge: 'pendingOrders' },
  { path: '/ejecutivo/stock',    label: 'Stock',    icon: ProductsIcon,  roles: [Roles.EJECUTIVO] },
  { path: '/ejecutivo/clientes', label: 'Clientes', icon: CustomersIcon, roles: [Roles.EJECUTIVO] },

  // ── Operador Logístico ────────────────────────────────────────────────
  { path: '/logistica',          label: 'Inicio',    icon: DashboardIcon, roles: [Roles.OPERADOR_LOGISTICO], end: true },
  { path: '/logistica/ordenes',  label: 'Órdenes',   icon: OrdersIcon,    roles: [Roles.OPERADOR_LOGISTICO] },
  { path: '/logistica/alertas',  label: 'Alertas',   icon: WarnIcon,      roles: [Roles.OPERADOR_LOGISTICO] },

  // ── Analista de Finanzas ──────────────────────────────────────────────
  { path: '/analista',        label: 'Inicio', icon: DashboardIcon, roles: [Roles.ANALISTA], end: true },
  { path: '/analista/pagos',  label: 'Pagos',  icon: DollarIcon,    roles: [Roles.ANALISTA] },

  // ── Administrador ─────────────────────────────────────────────────────
  { path: '/admin',              label: 'Inicio',       icon: DashboardIcon, roles: [Roles.ADMINISTRADOR], end: true },
  { path: '/admin/estadisticas', label: 'Estadísticas', icon: StatsIcon,     roles: [Roles.ADMINISTRADOR] },
  { path: '/admin/pedidos',      label: 'Pedidos',      icon: OrdersIcon,    roles: [Roles.ADMINISTRADOR], badge: 'pendingOrders' },
  { path: '/admin/productos',    label: 'Productos',    icon: ProductsIcon,  roles: [Roles.ADMINISTRADOR] },
  { path: '/admin/trabajadores', label: 'Trabajadores', icon: WorkersIcon,   roles: [Roles.ADMINISTRADOR] },
  { path: '/admin/clientes',     label: 'Clientes',     icon: CustomersIcon, roles: [Roles.ADMINISTRADOR] },
  { path: '/admin/api-keys',     label: 'API Keys ERP', icon: KeyIcon,       roles: [Roles.ADMINISTRADOR] },
];

/** Filtra los ítems visibles para un rol dado. */
export const itemsForRole = (rol: Rol | null): NavItem[] =>
  rol ? NAV_ITEMS.filter((item) => item.roles.includes(rol)) : [];
