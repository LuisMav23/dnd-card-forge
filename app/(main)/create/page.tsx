import Link from 'next/link';

export default function CreatePage() {
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
      href: '/encounters',
      icon: '🎲',
      title: 'Encounters',
      description:
        'Build encounter lists from saved stat blocks and track how many remain during live sessions.',
    },
  ] as const;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <main className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center">
          <p className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.2em] text-gold-dark sm:text-sm">
            What would you like to create?
          </p>
          <div className="page-hero-divider" aria-hidden />

          <div className="mt-12 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col items-center gap-3 p-8 text-center surface-card transition-colors duration-200 hover:-translate-y-0.5 hover:border-gold-dark hover:bg-input hover:shadow-[0_14px_36px_rgba(201,168,76,0.1)]"
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
