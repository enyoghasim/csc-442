type LogoProps = {
  size?: number;
  className?: string;
};

// Mirrors brand/logo-mark.svg at the repo root — keep both in sync if the mark changes.
export const Logo = ({ size = 32, className }: LogoProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="aFront" x1="100" y1="30" x2="100" y2="176" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="0.45" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>

      <g transform="translate(6,8)" stroke="#050a18" strokeWidth={32} strokeLinecap="round" strokeLinejoin="round" opacity={0.9}>
        <path d="M100 30 L32 176" />
        <path d="M100 30 L168 176" />
        <path d="M64 120 L136 120" />
      </g>

      <g stroke="url(#aFront)" strokeWidth={32} strokeLinecap="round" strokeLinejoin="round">
        <path d="M100 30 L32 176" />
        <path d="M100 30 L168 176" />
        <path d="M64 120 L136 120" />
      </g>

      <g transform="translate(-4,-5)" stroke="#ffffff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={0.45}>
        <path d="M100 30 L32 176" />
        <path d="M100 30 L168 176" />
        <path d="M64 120 L136 120" />
      </g>
    </svg>
  );
};
