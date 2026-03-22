export default function LoadingLibraryProgressBar() {
  return (
    <div
      className="relative h-0.5 w-full overflow-hidden bg-bdr/50"
      role="progressbar"
      aria-valuetext="Loading library item"
      aria-busy="true"
    >
      <div className="loading-shimmer-bar absolute inset-y-0 left-0 w-1/3 rounded-full bg-gold/70" />
    </div>
  );
}
