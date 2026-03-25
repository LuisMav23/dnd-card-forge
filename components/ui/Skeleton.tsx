export interface SkeletonProps {
  className?: string;
  /** Subtle gold shimmer; when false, uses pulse only. */
  shimmer?: boolean;
}

export default function Skeleton({ className = '', shimmer = true }: SkeletonProps) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-md bg-bdr/35 dark:bg-bdr/25',
        !shimmer ? 'animate-pulse' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      {shimmer ? (
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          <span className="loading-shimmer-bar absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
        </span>
      ) : null}
    </div>
  );
}
