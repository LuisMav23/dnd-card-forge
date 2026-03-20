import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="bg-gradient-to-b from-[#040300] to-mid border-b-2 border-gold-dark px-3 sm:px-[22px] py-[9px] sm:py-[11px] flex items-center justify-center flex-shrink-0 z-50">
        <h1 className="font-[var(--font-cinzel),serif] text-[1rem] sm:text-[1.25rem] font-black text-gold tracking-[.12em] [text-shadow:0_0_18px_rgba(201,168,76,.4)]">
          ⚔ D&D <em className="text-gold-light not-italic">Card Forge</em>
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 gap-8">
        <p className="font-[var(--font-cinzel),serif] text-[.75rem] sm:text-[.85rem] text-gold-dark tracking-[.15em] uppercase text-center">
          Choose Your Forge
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
          <Link href="/card" className="landing-card group">
            <span className="landing-icon">⚔️</span>
            <h2 className="landing-title">Card Forge</h2>
            <p className="landing-desc">
              Create D&D cards — Spells, Armor, Weapons, Equipment, Sidekicks, and more. Export as print-ready PNG.
            </p>
            <span className="landing-arrow group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link href="/statblocks" className="landing-card group">
            <span className="landing-icon">📜</span>
            <h2 className="landing-title">Stat Blocks</h2>
            <p className="landing-desc">
              Build Daggerheart stat blocks for Adversaries, NPCs, and Environments. Export as print-ready PNG.
            </p>
            <span className="landing-arrow group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </main>

      <footer className="flex-shrink-0 border-t border-bdr py-2 px-4 text-center text-[.62rem] text-gold-dark italic tracking-wide font-[var(--font-cinzel),serif]">
        Created by Kurt Andrei Gabriel
      </footer>
    </div>
  );
}
