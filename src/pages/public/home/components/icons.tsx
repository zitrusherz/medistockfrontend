
interface IconProps {
  size?: number;
  className?: string;
  stroke?: number;
}

const base = (size: number, stroke: number, className: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: stroke,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
  'aria-hidden': true,
});

export const ArrowIcon = ({ size = 18, className = '', stroke = 2 }: IconProps) => (
  <svg {...base(size, stroke, className)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const ShieldIcon = ({ size = 20, className = '', stroke = 1.7 }: IconProps) => (
  <svg {...base(size, stroke, className)}>
    <path d="M12 3 5 6v5c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const AccuracyIcon = ({ size = 26, className = '', stroke = 1.8 }: IconProps) => (
  <svg {...base(size, stroke, className)}>
    <path d="M9 12.5 11 14.5 15.5 10" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);

export const TruckIcon = ({ size = 26, className = '', stroke = 1.8 }: IconProps) => (
  <svg {...base(size, stroke, className)}>
    <path d="M2 6h11v9H2z" />
    <path d="M13 9h4l3 3v3h-7" />
    <circle cx="6.5" cy="17.5" r="1.6" />
    <circle cx="16.5" cy="17.5" r="1.6" />
  </svg>
);

export const BoxesIcon = ({ size = 26, className = '', stroke = 1.8 }: IconProps) => (
  <svg {...base(size, stroke, className)}>
    <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
    <path d="M3 7.5V16l9 4.5M21 7.5V16l-9 4.5" />
  </svg>
);
