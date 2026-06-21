
// Re-exportas lucide con los mismos nombres que usabas
export {
    ShoppingCart  as CartIcon,
    Eye           as EyeIcon,
    Plus          as PlusIcon,
    Minus         as MinusIcon,
    Trash2        as TrashIcon,
    Search        as SearchIcon,
    Bell          as BellIcon,
    LogOut        as LogoutIcon,
    Check         as CheckIcon,
    X             as XIcon,
    DollarSign    as DollarIcon,
    Clock         as ClockIcon,
    AlertTriangle as WarnIcon,
    Download      as DownloadIcon,
    LayoutDashboard as DashboardIcon,
    FileText      as OrdersIcon,
    Users         as CustomersIcon,
    Package       as ProductsIcon,
    UserCheck     as WorkersIcon,
    BarChart2     as StatsIcon,
    Shield        as ShieldIcon,
    // ── Añadidos para el layout por rol (T1.6, M10: set único de iconos) ──
    KeyRound      as KeyIcon,          // API Keys ERP
    Menu          as MenuIcon,         // hamburguesa (sidebar móvil)
    ChevronLeft   as ChevronLeftIcon,  // colapsar rail desktop
} from 'lucide-react'

// Si algún ícono NO existe en lucide, lo creas tú:
export const GoldRuleIcon = () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.7} strokeLinecap="round"
         strokeLinejoin="round" aria-hidden="true">
        {/* tu SVG personalizado */}
    </svg>
)
