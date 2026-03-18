'use client';

export default function Header() {
  return (
    <header className="bg-gradient-to-b from-[#040300] to-mid border-b-2 border-gold-dark px-3 sm:px-[22px] py-[9px] sm:py-[11px] flex items-center justify-between flex-shrink-0 z-50">
      <h1 className="font-[var(--font-cinzel),serif] text-[1rem] sm:text-[1.25rem] font-black text-gold tracking-[.12em] [text-shadow:0_0_18px_rgba(201,168,76,.4)]">
        ⚔ D&D <em className="text-gold-light not-italic">Card Forge</em>
      </h1>
      <span className="hidden sm:inline text-[.7rem] text-gold-dark italic">
        Spells · Armor · Weapons · Items · Sidekicks · Anything — Export PNG
      </span>
    </header>
  );
}
