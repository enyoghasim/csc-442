type LogoProps = {
  size?: number;
  className?: string;
};

// Mirrors brand/logo-mark.svg at the repo root — keep both in sync if the mark changes.
// Geometry is the reference app's ring+arc mark with the two side crescents dropped, so it reads
// as a simple user glyph (a "head" ring over "shoulders" arc).
export const Logo = ({ size = 32, className }: LogoProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="logoChrome" x1="0" y1="0" x2="0" y2="1">
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

        <filter id="logoSoftBlur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={5} />
        </filter>

        <mask id="logoMarkMask" maskUnits="userSpaceOnUse">
          <g transform="translate(3.1,23.6) scale(2.749)" fill="#ffffff">
            <path d="M35.6251 0.5C46.127 0.500027 54.6407 9.01369 54.6407 19.5156C54.6407 30.0175 46.127 38.5312 35.6251 38.5312C25.1232 38.5312 16.6095 30.0175 16.6095 19.5156C16.6095 9.01369 25.1232 0.5 35.6251 0.5ZM35.6251 7.85059C29.1827 7.85059 23.9601 13.0732 23.9601 19.5156C23.9601 25.9581 29.1827 31.1807 35.6251 31.1807C42.0675 31.1806 47.2902 25.958 47.2902 19.5156C47.2902 13.0732 42.0675 7.85061 35.6251 7.85059Z" />
            <path fillRule="evenodd" clipRule="evenodd" d="M35.6251 42.8584C43.8149 42.8584 50.8256 47.9041 53.7203 55.0561H44.0576C42.0106 52.6992 38.9915 51.2089 35.6251 51.2089C32.2583 51.2089 29.2392 52.6992 27.1922 55.0561H17.5295C20.4246 47.9041 27.4348 42.8584 35.6251 42.8584Z" />
          </g>
        </mask>
      </defs>

      <g transform="translate(0,8)" opacity={0.45} filter="url(#logoSoftBlur)">
        <g transform="translate(3.1,23.6) scale(2.749)" fill="#000000">
          <path d="M35.6251 0.5C46.127 0.500027 54.6407 9.01369 54.6407 19.5156C54.6407 30.0175 46.127 38.5312 35.6251 38.5312C25.1232 38.5312 16.6095 30.0175 16.6095 19.5156C16.6095 9.01369 25.1232 0.5 35.6251 0.5ZM35.6251 7.85059C29.1827 7.85059 23.9601 13.0732 23.9601 19.5156C23.9601 25.9581 29.1827 31.1807 35.6251 31.1807C42.0675 31.1806 47.2902 25.958 47.2902 19.5156C47.2902 13.0732 42.0675 7.85061 35.6251 7.85059Z" />
          <path fillRule="evenodd" clipRule="evenodd" d="M35.6251 42.8584C43.8149 42.8584 50.8256 47.9041 53.7203 55.0561H44.0576C42.0106 52.6992 38.9915 51.2089 35.6251 51.2089C32.2583 51.2089 29.2392 52.6992 27.1922 55.0561H17.5295C20.4246 47.9041 27.4348 42.8584 35.6251 42.8584Z" />
        </g>
      </g>

      <g transform="translate(3.1,23.6) scale(2.749)">
        <path fill="url(#logoChrome)" d="M35.6251 0.5C46.127 0.500027 54.6407 9.01369 54.6407 19.5156C54.6407 30.0175 46.127 38.5312 35.6251 38.5312C25.1232 38.5312 16.6095 30.0175 16.6095 19.5156C16.6095 9.01369 25.1232 0.5 35.6251 0.5ZM35.6251 7.85059C29.1827 7.85059 23.9601 13.0732 23.9601 19.5156C23.9601 25.9581 29.1827 31.1807 35.6251 31.1807C42.0675 31.1806 47.2902 25.958 47.2902 19.5156C47.2902 13.0732 42.0675 7.85061 35.6251 7.85059Z" />
        <path fill="url(#logoChrome)" fillRule="evenodd" clipRule="evenodd" d="M35.6251 42.8584C43.8149 42.8584 50.8256 47.9041 53.7203 55.0561H44.0576C42.0106 52.6992 38.9915 51.2089 35.6251 51.2089C32.2583 51.2089 29.2392 52.6992 27.1922 55.0561H17.5295C20.4246 47.9041 27.4348 42.8584 35.6251 42.8584Z" />
      </g>

      <g mask="url(#logoMarkMask)">
        <ellipse cx={78} cy={55} rx={20} ry={24} fill="url(#logoSpecular)" />
        <ellipse cx={75} cy={148} rx={14} ry={8} fill="url(#logoSpecular)" />
      </g>
    </svg>
  );
};
