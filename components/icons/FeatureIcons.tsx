import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

/* ── 48×48 feature-card icons (landing / create pages) ── */

export function ForgeIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M24 2c5 7 10 11 10 16 0 5-4 8-10 8s-10-3-10-8c0-5 5-9 10-16z" opacity=".7" />
      <path d="M4 28h32l8-4v3l-7 3H4zm4 2h28l-2 5H10zm-2 5h30v2H6zm4 2h22v5H10z" />
    </svg>
  );
}

export function MonsterIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M10 18l4-14 5 14zM29 18l5-14 4 14z" />
      <path fillRule="evenodd" d="M6 16h36v10c0 6-8 12-18 12S6 32 6 26zm10 6a3 3 0 1 0 6 0 3 3 0 1 0-6 0zm12 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0z" />
      <path d="M18 38l3 7 3-7zM26 38l3 7 3-7z" />
    </svg>
  );
}

export function BookIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M23 8C16 8 5 10 3 13v26c3-3 13-5 20-5z" />
      <path d="M25 8c7 0 18 2 20 5v26c-3-3-13-5-20-5z" />
    </svg>
  );
}

/* ── 24×24 icon-picker / UI-chrome icons ── */

export function DragonIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M4 6L4 2 8 5 7 1 10 5 12 4 20 6 22 8 20 9 22 12 18 12 14 14 8 14 4 12z" />
      <circle cx="9" cy="8" r="1" opacity=".3" />
    </svg>
  );
}

export function WolfIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path fillRule="evenodd" d="M2 2l5 5 5-1 5 1 5-5-3 8-3 6-4 5-4-5-3-6zM8 11a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z" />
    </svg>
  );
}

export function SpiderIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <circle cx="12" cy="14" r="4" />
      <circle cx="12" cy="8" r="2.5" />
      <path d="M9 11L3 5M9 14H2M9 16l-5 5M10 17l-3 6M15 11l6-6M15 14h7M15 16l5 5M14 17l3 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SnakeIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M7 3a5 5 0 0 1 5 5c0 3-5 4-5 7a5 5 0 0 0 10 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="6" cy="3" r="2.5" />
    </svg>
  );
}

export function BatIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      <path d="M12 6C10 8 8 9 6 9L1 5l2 6-2 5c3-1 6-2 8-5h2c2 3 5 4 8 5l-2-5 2-6-5 4c-2 0-4-1-4-3z" />
    </svg>
  );
}

export function GhostIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path fillRule="evenodd" d="M6 10c0-3.3 2.7-6 6-6s6 2.7 6 6v10l-2-2-2 2-2-2-2 2-2-2-2 2zM9 10a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm4.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z" />
    </svg>
  );
}

export function VampireIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path fillRule="evenodd" d="M12 1l-4 4H4v4l-2 3 2 3v3h4l4 4 4-4h4v-3l2-3-2-3V5h-4zM9 10a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm4 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z" />
      <path d="M9 15l1.5 3L12 15l1.5 3L15 15" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function ZombieIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path fillRule="evenodd" d="M5 4h14v10c0 4-3 8-7 8s-7-4-7-8zm4 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm5 1a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z" />
      <path d="M8 15h8v2H8z" opacity=".5" />
    </svg>
  );
}

export function DemonIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M3 8l3-6 3 6zM15 8l3-6 3 6z" />
      <path fillRule="evenodd" d="M2 7h20v8c0 4-4 8-10 8S2 19 2 15zm5 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm6 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
      <path d="M7 17h10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CastleIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M2 10V6h2v2h2V6h2v4h1V4h2v2h2V4h2v6h1V6h2v2h2V6h2v4h1v12H1V10z" />
      <rect x="9" y="16" width="6" height="6" rx="3" fill="currentColor" opacity=".3" />
    </svg>
  );
}

export function VolcanoIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M9 10h6l5 12H4z" />
      <path d="M10 10l-1-3h1l1 2h2l1-2h1l-1 3z" opacity=".7" />
      <path d="M11 4c0-1 .5-2 1-2s1 1 1 2l1 3h-4z" opacity=".5" />
    </svg>
  );
}

export function ElfIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path fillRule="evenodd" d="M6 6c0-2 3-4 6-4s6 2 6 4v6c0 4-3 7-6 7s-6-3-6-7zm3 4a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm4 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z" />
      <path d="M6 9L1 7l5 4zM18 9l5-2-5 4z" />
    </svg>
  );
}

export function FairyIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <circle cx="12" cy="6" r="3" />
      <path d="M12 9v8M10 22l2-5 2 5" />
      <path d="M12 10C9 8 4 6 3 9s4 5 9 4M12 10c3-2 8-4 9-1s-4 5-9 4" opacity=".7" />
    </svg>
  );
}

export function NinjaIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path fillRule="evenodd" d="M4 4c0-1 3-3 8-3s8 2 8 3v14c0 3-3 5-8 5s-8-2-8-5zm4 7h8v3H8z" />
    </svg>
  );
}

export function ScorpionIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <ellipse cx="12" cy="16" rx="4" ry="3" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10V5c0-2 2-3 3-2l1 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="4" r="1.5" />
      <path d="M10 13L5 10M8 15L3 14M14 13l5-3M16 15l5-1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function EagleIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M12 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
      <path d="M12 8C9 10 5 11 1 10l3 4c2 1 5 1 8-1 3 2 6 2 8 1l3-4c-4 1-8 0-11-2z" />
      <path d="M10 14l-3 8h2l3-5 3 5h2l-3-8" opacity=".7" />
    </svg>
  );
}

export function OwlIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M4 5l3 3h10l3-3-2 5v7c0 3-3 6-6 6s-6-3-6-6v-7z" />
      <circle cx="9" cy="12" r="3" fill="currentColor" opacity=".3" />
      <circle cx="15" cy="12" r="3" fill="currentColor" opacity=".3" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
      <path d="M11 15l1 2 1-2" />
    </svg>
  );
}

export function LionIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M12 1L9 4 5 3l1 4L3 9l3 2-1 4 4-1 3 3 3-3 4 1-1-4 3-2-3-2 1-4-4 1z" opacity=".6" />
      <circle cx="12" cy="10" r="5" />
      <circle cx="10" cy="9" r="1" opacity=".3" />
      <circle cx="14" cy="9" r="1" opacity=".3" />
      <ellipse cx="12" cy="12" rx="1.5" ry="1" opacity=".3" />
    </svg>
  );
}

export function BearIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <circle cx="6" cy="5" r="3" />
      <circle cx="18" cy="5" r="3" />
      <path fillRule="evenodd" d="M4 8h16v8c0 4-4 7-8 7s-8-3-8-7zm5 4a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm4 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z" />
      <ellipse cx="12" cy="16" rx="2" ry="1.5" opacity=".3" />
    </svg>
  );
}

export function FoxIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path fillRule="evenodd" d="M1 1l6 7 5-2 5 2 6-7-4 10-3 5-4 5-4-5-3-5zM8 12a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z" />
    </svg>
  );
}

export function BoarIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M4 6l3-2 1 3zM17 6l3-2-1 3z" />
      <path fillRule="evenodd" d="M3 6h18v9c0 3-4 6-9 6S3 18 3 15zm4 4a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm7 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z" />
      <ellipse cx="12" cy="15" rx="3" ry="2" opacity=".3" />
      <path d="M5 17l-2 3M19 17l2 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function HauntedHouseIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M12 2L2 10v12h8v-6h4v6h8V10z" />
      <rect x="7" y="12" width="3" height="3" opacity=".3" />
      <rect x="14" y="12" width="3" height="3" opacity=".3" />
    </svg>
  );
}

export function DesertIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M1 20c3-3 5-8 5-8s2 5 5 8c3-6 5-14 5-14s2 8 5 14h2v2H1v-2z" opacity=".7" />
      <circle cx="18" cy="4" r="3" />
    </svg>
  );
}

export function RockIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M3 20l5-10 3 4 4-8 3 6 3-2 2 10z" />
    </svg>
  );
}

export function HoleIcon({ className, ...props }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <ellipse cx="12" cy="14" rx="10" ry="6" />
      <ellipse cx="12" cy="14" rx="7" ry="4" opacity=".3" />
    </svg>
  );
}
