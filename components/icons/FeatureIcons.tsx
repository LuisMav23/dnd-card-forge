import type { SVGProps } from 'react';

export function ForgeIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        d="M24 2c5 7 10 11 10 16 0 5-4 8-10 8s-10-3-10-8c0-5 5-9 10-16z"
        opacity=".7"
      />
      <path d="M4 28h32l8-4v3l-7 3H4zm4 2h28l-2 5H10zm-2 5h30v2H6zm4 2h22v5H10z" />
    </svg>
  );
}

export function MonsterIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path d="M10 18l4-14 5 14zM29 18l5-14 4 14z" />
      <path
        fillRule="evenodd"
        d="M6 16h36v10c0 6-8 12-18 12S6 32 6 26zm10 6a3 3 0 1 0 6 0 3 3 0 1 0-6 0zm12 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0z"
      />
      <path d="M18 38l3 7 3-7zM26 38l3 7 3-7z" />
    </svg>
  );
}

export function BookIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path d="M23 8C16 8 5 10 3 13v26c3-3 13-5 20-5z" />
      <path d="M25 8c7 0 18 2 20 5v26c-3-3-13-5-20-5z" />
    </svg>
  );
}
