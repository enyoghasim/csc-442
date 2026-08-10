type LogoProps = {
  size?: number;
  className?: string;
};

// Mirrors brand/monochrome.svg (flat, single-color, no gradient/shadow) — not brand/logo-mark.svg's
// glossy chrome/glass treatment, which reads badly at the small/inline sizes this is used at on
// the web (sidebar, login card). Same choice apps/mobile already made for its own in-app UI; the
// gradient version stays reserved for OS-level app icons only (see brand/README.md).
// Geometry is the reference app's ring+arc mark with the two side crescents dropped, so it reads
// as a simple user glyph (a "head" ring over "shoulders" arc). Keep in sync with brand/monochrome.svg.
export const Logo = ({ size = 32, className }: LogoProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g transform="translate(-10.4,13.9) scale(3.1)" fill="#ffffff">
        <path d="M35.6251 0.5C46.127 0.500027 54.6407 9.01369 54.6407 19.5156C54.6407 30.0175 46.127 38.5312 35.6251 38.5312C25.1232 38.5312 16.6095 30.0175 16.6095 19.5156C16.6095 9.01369 25.1232 0.5 35.6251 0.5ZM35.6251 7.85059C29.1827 7.85059 23.9601 13.0732 23.9601 19.5156C23.9601 25.9581 29.1827 31.1807 35.6251 31.1807C42.0675 31.1806 47.2902 25.958 47.2902 19.5156C47.2902 13.0732 42.0675 7.85061 35.6251 7.85059Z" />
        <path fillRule="evenodd" clipRule="evenodd" d="M35.6251 42.8584C43.8149 42.8584 50.8256 47.9041 53.7203 55.0561H44.0576C42.0106 52.6992 38.9915 51.2089 35.6251 51.2089C32.2583 51.2089 29.2392 52.6992 27.1922 55.0561H17.5295C20.4246 47.9041 27.4348 42.8584 35.6251 42.8584Z" />
      </g>
    </svg>
  );
};
