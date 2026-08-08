type LogoProps = {
  size?: number;
  className?: string;
};

// Mirrors brand/logo-mark.svg at the repo root — keep both in sync if the mark changes.
export const Logo = ({ size = 32, className }: LogoProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="logoChrome" x1="100" y1="24" x2="100" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fafbfd" />
          <stop offset="0.16" stopColor="#e7ebf1" />
          <stop offset="0.36" stopColor="#a9b3c2" />
          <stop offset="0.6" stopColor="#5b6675" />
          <stop offset="0.82" stopColor="#20242e" />
          <stop offset="1" stopColor="#08090c" />
        </linearGradient>

        <radialGradient id="logoSpecular" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>

        <linearGradient id="logoRimShadow" x1="100" y1="118" x2="100" y2="184" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#000000" stopOpacity={0} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.55} />
        </linearGradient>

        <filter id="logoSoftBlur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={5} />
        </filter>

        <mask id="logoLetterMask" maskUnits="userSpaceOnUse">
          <g stroke="#ffffff" strokeWidth={34} strokeLinecap="round" strokeLinejoin="round">
            <path d="M100 28 L30 178" />
            <path d="M100 28 L170 178" />
            <path d="M60 122 L140 122" />
          </g>
        </mask>
      </defs>

      <g transform="translate(0,10)" opacity={0.45} filter="url(#logoSoftBlur)">
        <g stroke="#000000" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round">
          <path d="M100 28 L30 178" />
          <path d="M100 28 L170 178" />
          <path d="M60 122 L140 122" />
        </g>
      </g>

      <g stroke="url(#logoChrome)" strokeWidth={32} strokeLinecap="round" strokeLinejoin="round">
        <path d="M100 28 L30 178" />
        <path d="M100 28 L170 178" />
        <path d="M60 122 L140 122" />
      </g>

      <g mask="url(#logoLetterMask)">
        <rect x={0} y={118} width={200} height={66} fill="url(#logoRimShadow)" />
      </g>

      <g mask="url(#logoLetterMask)">
        <ellipse cx={88} cy={52} rx={16} ry={26} fill="url(#logoSpecular)" />
        <ellipse cx={46} cy={132} rx={20} ry={14} fill="url(#logoSpecular)" />
        <ellipse cx={154} cy={132} rx={20} ry={14} fill="url(#logoSpecular)" />
      </g>
    </svg>
  );
};
