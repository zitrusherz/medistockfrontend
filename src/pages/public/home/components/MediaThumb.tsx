// src/pages/public/home/components/MediaThumb.tsx
/**
 * MediaThumb — muestra la imagen real del producto/categoría cuando existe,
 * y cae al marcador rayado (`ph-stripes`) de la maqueta cuando no hay URL.
 *
 * TAMAÑO PREDEFINIDO: el `className` define la CAJA (p. ej. `aspect-square w-full`).
 * La imagen se posiciona absoluta y la llena con `object-cover`, así CUALQUIER
 * proporción de archivo se adapta al espacio y se recorta sin deformar — la card
 * conserva siempre el mismo tamaño sin importar la imagen.
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

  // La caja recibe el tamaño (className) y recorta lo que sobre.
  const box = `relative overflow-hidden ${shape} ${className}`;

  if (src) {
    return (
      <div className={box}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`ph-stripes flex items-center justify-center border border-grape-100 ${box}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-wider text-grape-700/55 px-2 text-center">
        {label ?? alt}
      </span>
    </div>
  );
}
