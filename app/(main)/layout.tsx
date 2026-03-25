import Header from '@/components/Header';

/**
 * Single persistent header for all authenticated app routes; only page content swaps on navigation.
 */
export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden bg-bg">
      <Header />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
