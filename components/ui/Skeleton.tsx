export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-bdr/35 dark:bg-bdr/25 ${className}`}
      aria-hidden
    />
  );
}
