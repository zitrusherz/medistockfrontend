/**
 * LogoMark — marca MediStock para chrome de paneles internos.
 * Portado de `admin-dashboard.jsx` (LogoMark de la maqueta).
 * `collapsed` oculta el texto para el rail de iconos (M14).
 */
interface LogoMarkProps {
  /** Oculta el wordmark; deja solo el símbolo (rail colapsado). */
  collapsed?: boolean;
  /** Subtítulo bajo el wordmark (ej. "PANEL ADMIN"). */
  caption?: string;
}

export function LogoMark({ collapsed = false, caption = 'PANEL' }: LogoMarkProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid grid-cols-2 gap-0.5 w-8 h-8 rotate-45 shrink-0" aria-hidden="true">
        <span className="rounded-[3px] bg-linear-to-br from-gold-300 to-gold-500" />
        <span className="rounded-[3px] bg-grape-300" />
        <span className="rounded-[3px] bg-grape-400" />
        <span className="rounded-[3px] bg-linear-to-br from-gold-400 to-gold-600" />
      </div>
      {!collapsed && (
        <div className="leading-none">
          <span className="block font-display font-bold text-[21px] text-white">
            Medi<span className="text-gold-gradient">Stock</span>
          </span>
          <span className="block text-[9px] font-bold tracking-[0.24em] text-gold-300">{caption}</span>
        </div>
      )}
    </div>
  );
}
