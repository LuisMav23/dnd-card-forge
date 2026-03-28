import type { SVGProps } from 'react';

/**
 * Brand mark from {@link public/logo.svg} — uses currentColor for theme-aware strokes/fills.
 */
export default function LogoMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="62 55 76 90"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <g transform="translate(100,100) scale(1.2)">
        <rect x="-26" y="-36" width="52" height="72" rx="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect
          x="-21"
          y="-31"
          width="42"
          height="62"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.4"
        />
        <line x1="-30" y1="36" x2="30" y2="-36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="-6" y1="18" x2="10" y2="2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="-24" cy="34" r="2.5" fill="currentColor" />
        <polygon points="0,-8 4,-3 0,2 -4,-3" fill="currentColor" opacity="0.9" />
      </g>
    </svg>
  );
}
