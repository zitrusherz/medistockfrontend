/**
 * MediaThumb — muestra la imagen real del producto/categoría cuando existe,
 * y cae al marcador rayado (`ph-stripes`) de la maqueta cuando no hay URL.
 * Mantiene la estética del `ImageSlot` original pero soporta datos reales.
 */
interface MediaThumbProps {
  src?: string | null;
  alt: string;
  /** texto del placeholder cuando no hay imagen (por defecto, el alt) */
  label?: string;
  className?: string;
  rounded?: boolean;
}

export function MediaThumb({
  src,
  alt,
  label,
  className = '',
  rounded = false,
}: MediaThumbProps) {
  const shape = rounded ? 'rounded-full' : 'rounded-lg';

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`object-cover ${shape} ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`ph-stripes flex items-center justify-center border border-grape-100 ${shape} ${className}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-wider text-grape-700/55 px-2 text-center">
        {label ?? alt}
      </span>
    </div>
  );
}
