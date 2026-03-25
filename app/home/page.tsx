import Link from 'next/link';
import Header from '@/components/Header';

export default function LandingPage() {
  const cards = [
    {
      href: '/card',
      icon: '⚔️',
      title: 'Card Forge',
      description:
        'Create spells, armor, weapons, equipment, sidekicks, and more. Export as print-ready PNG.',
    },
    {
      href: '/statblocks',
      icon: '📜',
      title: 'Stat Blocks',
      description:
        'Build Daggerheart stat blocks for Adversaries, NPCs, and Environments. Export as print-ready PNG.',
    },
    {
      href: '/library',
      icon: '📚',
      title: 'My Library',
      description:
        'Organize folders, save cards and stat blocks, and load them back into the forges when you need them.',
    },
    {
      href: '/encounters',
      icon: '🎲',
      title: 'Encounters',
      description:
        'Build encounter lists from saved stat blocks and track how many remain during live sessions.',
    },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />

      <main className="flex flex-1 flex-col overflow-y-auto px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center">
          <p className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.2em] text-gold-dark sm:text-sm">
            Choose your forge
          </p>
          <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

          <div className="mt-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col items-center gap-3 rounded-lg border border-bdr bg-panel p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-gold-dark hover:bg-input hover:shadow-[0_16px_48px_rgba(201,168,76,0.12)]"
              >
                <span className="text-[2.8rem] leading-none" aria-hidden>
                  {item.icon}
                </span>
                <h2 className="font-[var(--font-cinzel),serif] text-[1.05rem] font-bold uppercase tracking-[0.1em] text-gold">
                  {item.title}
                </h2>
                <p className="font-[var(--font-crimson),serif] text-[0.88rem] leading-relaxed text-bronze">
                  {item.description}
                </p>
                <span
                  className="absolute bottom-3 right-4 text-[1.1rem] text-gold-dark transition-transform group-hover:translate-x-1"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="flex-shrink-0 border-t border-bdr px-3 py-3 text-center font-[var(--font-cinzel),serif] text-[0.7rem] italic leading-snug tracking-wide text-muted sm:text-xs">
        Created by Kurt Andrei Gabriel
      </footer>
    </div>
  );
}
