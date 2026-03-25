import type { ReactNode } from 'react';
import Header from '@/components/Header';

interface PageLoadShellProps {
  children: ReactNode;
  /** Accessible status message */
  label?: string;
  showHeader?: boolean;
  /** Passed to main (padding, flex, etc.) */
  mainClassName?: string;
}

/**
 * Shared wrapper for route-level and full-page loading states.
 * Matches authenticated pages: radial background + optional sticky header.
 */
export default function PageLoadShell({
  children,
  label = 'Loading',
  showHeader = true,
  mainClassName = 'flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8 sm:py-10',
}: PageLoadShellProps) {
  return (
    <div
      className="page-radial-soft flex min-h-screen min-h-[100dvh] flex-col bg-bg"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
      {showHeader ? <Header /> : null}
      <main className={`animate-fade-in ${mainClassName}`}>{children}</main>
    </div>
  );
}
