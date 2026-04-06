import type { ComponentType, CSSProperties, SVGProps } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Globe, Heart, MessageSquare, SquareStack, UserPlus } from 'lucide-react';
import ExploreItemCard from '@/components/explore/ExploreItemCard';
import { ForgeIcon, MonsterIcon, BookIcon } from '@/components/icons/FeatureIcons';
import LandingCta from '@/components/landing/LandingCta';
import LandingJsonLd from '@/components/landing/LandingJsonLd';
import LandingReveal from '@/components/landing/LandingReveal';
import LandingTopBar from '@/components/landing/LandingTopBar';
import LogoMark from '@/components/LogoMark';
import { fetchLandingSpotlightItems } from '@/lib/landingSpotlight';
import { ITEM_CARD_GRID_CLASS } from '@/lib/itemCardGrid';
import { createClient } from '@/lib/supabase/server';

const LANDING_TITLE =
  'Card Forge — TTRPG item cards, TCG-style trading cards, stat blocks & PNG export';
const LANDING_DESCRIPTION =
  'Design fantasy TTRPG item cards and stat blocks, plus custom TCG-style trading card faces (creatures, spells, planeswalkers, sagas, and more) with mana symbols and live preview. PNG export for VTTs, handouts, and deck ideas — then publish and share on Explore with comments, votes, favorites, and creator follows.';

export const metadata: Metadata = {
  title: LANDING_TITLE,
  description: LANDING_DESCRIPTION,
  keywords: [
    'TTRPG',
    'tabletop RPG',
    'item card maker',
    'spell card generator',
    'stat block builder',
    'NPC card',
    'monster stat block',
    'fantasy RPG props',
    'VTT handouts',
    'PNG export',
    'RPG community',
    'Card Forge',
    'custom trading card',
    'TCG card maker',
    'TCG-style cards',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: LANDING_TITLE,
    description: LANDING_DESCRIPTION,
    url: '/',
    siteName: 'Card Forge',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/logo.svg',
        width: 512,
        height: 512,
        alt: 'Card Forge — tabletop card studio logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: LANDING_TITLE,
    description: LANDING_DESCRIPTION,
    images: ['/logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const createItems: { icon: ComponentType<SVGProps<SVGSVGElement>>; title: string; body: string }[] = [
  {
    icon: ForgeIcon,
    title: 'Item cards',
    body: 'Spell cards, weapons, armor, equipment, sidekicks, and flexible “anything” templates — a full item card maker with live preview and crisp PNG export for your fantasy tabletop RPG table or VTT.',
  },
  {
    icon: MonsterIcon,
    title: 'Stat blocks',
    body: 'Build NPC, monster, adversary, and environment stat blocks for quick reference. One stat block builder tuned for handouts and wiki-style browsing.',
  },
  {
    icon: BookIcon,
    title: 'Encounters',
    body: 'Plan and run encounters linked to your library so prep and play stay in one workspace.',
  },
  {
    icon: SquareStack,
    title: 'TCG-style cards',
    body: 'Build custom trading card-style faces: mana costs and symbols, type lines, rules text, planeswalkers, sagas, battles, and more — with the same live preview, PNG export, library, and Explore publishing as the rest of Card Forge.',
  },
];

const socialFeatures: { icon: ComponentType<SVGProps<SVGSVGElement>>; title: string; body: string }[] = [
  {
    icon: Globe,
    title: 'Publish to Explore',
    body: 'Share finished work publicly so anyone can browse popular and top-rated creations, fork ideas into their library, or take inspiration for their own campaign.',
  },
  {
    icon: Heart,
    title: 'Reactions & favorites',
    body: 'Upvote, downvote, and favorite published cards and stat blocks — community signal for the best homebrew on Explore.',
  },
  {
    icon: MessageSquare,
    title: 'Comments',
    body: 'Discuss each published build in context: feedback, tweaks, and table stories in one thread.',
  },
  {
    icon: UserPlus,
    title: 'Follow creators',
    body: 'Follow profiles and see new publishes from people you care about alongside the main Explore feeds.',
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const spotlight = await fetchLandingSpotlightItems(supabase, 8);

  return (
    <>
      <LandingJsonLd />
      <div className="relative min-h-screen bg-bg text-parch">
        <LandingTopBar />

        <section
          className="auth-hero-gradient relative overflow-hidden px-4 pb-20 pt-24 sm:pb-28 sm:pt-28"
          aria-labelledby="landing-hero-heading"
        >
          <div
            className="landing-hero-aurora animate-landing-shimmer pointer-events-none absolute inset-0"
            aria-hidden
          />
          <div className="auth-page-vignette pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex justify-center text-gold-dark opacity-0 animate-landing-fade-in dark:text-gold">
              <LogoMark className="h-16 w-16 sm:h-20 sm:w-20" />
            </div>
            <p className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.35em] text-gold-dark opacity-0 animate-landing-fade-up [animation-delay:120ms]">
              Tabletop card studio
            </p>
            <h1
              id="landing-hero-heading"
              className="mt-4 font-[var(--font-cinzel),serif] text-3xl font-black tracking-[0.08em] text-gold opacity-0 animate-landing-fade-up [animation-delay:200ms] [text-shadow:0_0_28px_rgba(201,168,76,0.35)] sm:text-4xl md:text-5xl"
            >
              Card Forge
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-bronze opacity-0 animate-landing-fade-up [animation-delay:280ms] sm:text-lg">
              Item cards and stat blocks for fantasy TTRPGs, plus custom TCG-style trading card faces — craft handouts and deck ideas, export PNGs for virtual tabletops, then{' '}
              <Link href="/explore" className="text-gold underline-offset-2 hover:underline">
                publish and share
              </Link>{' '}
              with a community that comments, votes, and follows creators.
            </p>
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-3 opacity-0 animate-landing-fade-up [animation-delay:360ms]"
              aria-label="Primary actions"
            >
              <Link href="/signup" className="panel-btn border-gold-dark/60 bg-gold-dark/10 text-gold hover:bg-gold/10">
                Create free account
              </Link>
              <Link
                href="/explore"
                className="panel-btn border-bdr/90 bg-transparent text-gold-dark hover:border-gold/40 hover:text-gold dark:text-bronze"
              >
                Browse community creations
              </Link>
              <Link
                href="/login"
                className="font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.14em] text-muted underline-offset-4 transition-colors hover:text-gold-dark dark:hover:text-gold"
              >
                Sign in
              </Link>
            </nav>
          </div>
        </section>

        <section
          className="page-radial-soft border-t border-bdr/60 px-4 py-14 sm:px-8 sm:py-20"
          aria-labelledby="landing-create-heading"
        >
          <LandingReveal>
            <div className="mx-auto max-w-5xl">
              <h2
                id="landing-create-heading"
                className="landing-reveal-child font-[var(--font-cinzel),serif] text-xl font-bold tracking-wide text-gold sm:text-2xl"
                style={{ '--landing-reveal-delay': '0ms' } as CSSProperties}
              >
                What you can create
              </h2>
              <p
                className="landing-reveal-child mt-2 max-w-2xl text-sm text-bronze sm:text-base"
                style={{ '--landing-reveal-delay': '80ms' } as CSSProperties}
              >
                Props, player handouts, GM reference, and custom card makers — built for campaigns, one-shots, and deck brewers. Everything saves to your library when you{' '}
                <Link href="/signup" className="text-gold underline-offset-2 hover:underline">
                  sign up free
                </Link>
                .
              </p>
              <ul className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {createItems.map((item, i) => (
                  <li
                    key={item.title}
                    className="landing-reveal-child group relative rounded-xl border border-bdr/80 bg-panel/60 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/45 hover:shadow-[0_12px_40px_rgba(201,168,76,0.12)]"
                    style={
                      { '--landing-reveal-delay': `${120 + i * 90}ms` } as CSSProperties
                    }
                  >
                    <item.icon className="mb-2 h-7 w-7 text-gold/80 transition-colors group-hover:text-gold" />
                    <h3 className="font-[var(--font-cinzel),serif] text-sm font-bold uppercase tracking-[0.12em] text-gold-dark dark:text-gold">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-parch/95">{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </LandingReveal>
        </section>

        <section
          className="border-t border-bdr/40 bg-panel/25 px-4 py-14 dark:bg-panel/15 sm:px-8 sm:py-20"
          aria-labelledby="landing-social-heading"
        >
          <LandingReveal>
            <div className="mx-auto max-w-5xl">
              <h2
                id="landing-social-heading"
                className="landing-reveal-child font-[var(--font-cinzel),serif] text-xl font-bold tracking-wide text-gold sm:text-2xl"
                style={{ '--landing-reveal-delay': '0ms' } as CSSProperties}
              >
                Social &amp; discovery
              </h2>
              <p
                className="landing-reveal-child mt-2 max-w-2xl text-sm text-bronze sm:text-base"
                style={{ '--landing-reveal-delay': '70ms' } as CSSProperties}
              >
                More than an editor: a place to publish, remix, and discover homebrew. Explore trending and top-rated work on{' '}
                <Link href="/explore" className="text-gold underline-offset-2 hover:underline">
                  Explore
                </Link>
                .
              </p>
              <ul className="mt-10 grid gap-5 sm:grid-cols-2">
                {socialFeatures.map((f, i) => (
                  <li
                    key={f.title}
                    className="landing-reveal-child group flex gap-3 rounded-lg border border-transparent py-1 pl-4 transition-colors hover:border-bdr/60 hover:bg-panel/40"
                    style={
                      { '--landing-reveal-delay': `${100 + i * 75}ms` } as CSSProperties
                    }
                  >
                    <f.icon
                      className="mt-0.5 h-5 w-5 shrink-0 text-gold/70 transition-colors group-hover:text-gold"
                      aria-hidden
                    />
                    <div className="min-w-0 border-l-2 border-gold-dark/50 pl-3 dark:border-gold/40">
                      <h3 className="font-[var(--font-cinzel),serif] text-sm font-semibold text-gold-dark dark:text-gold">
                        {f.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{f.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </LandingReveal>
        </section>

        <section
          className="page-radial-soft border-t border-bdr/60 px-4 py-14 sm:px-8 sm:py-20"
          aria-labelledby="landing-community-heading"
        >
          <LandingReveal>
            <div className="landing-community-mask mx-auto max-w-6xl">
              <div className="mb-8 border-b border-bdr/80 pb-4">
                <h2
                  id="landing-community-heading"
                  className="landing-reveal-child font-[var(--font-cinzel),serif] text-xl font-bold tracking-wide text-gold sm:text-2xl"
                  style={{ '--landing-reveal-delay': '0ms' } as CSSProperties}
                >
                  From the community
                </h2>
                <p
                  className="landing-reveal-child mt-2 text-sm text-bronze sm:text-base"
                  style={{ '--landing-reveal-delay': '70ms' } as CSSProperties}
                >
                  Popular published work — item cards, TCG-style trading cards, and stat blocks. Open any tile for the full wiki-style view, comments, and forks on Explore.
                </p>
              </div>
              {spotlight.length === 0 ? (
                <p
                  className="landing-reveal-child text-sm italic text-muted"
                  style={{ '--landing-reveal-delay': '120ms' } as CSSProperties}
                >
                  Nothing published yet.{' '}
                  <Link href="/explore" className="text-gold underline-offset-2 hover:underline">
                    Open Explore
                  </Link>{' '}
                  to see new work as creators share.
                </p>
              ) : (
                <ul className={`${ITEM_CARD_GRID_CLASS} gap-5 lg:gap-6`}>
                  {spotlight.map((item, i) => (
                    <ExploreItemCard
                      key={item.id}
                      item={item}
                      listItemClassName="landing-reveal-child"
                      listItemStyle={
                        { '--landing-reveal-delay': `${100 + i * 65}ms` } as CSSProperties
                      }
                    />
                  ))}
                </ul>
              )}
            </div>
          </LandingReveal>
        </section>

        <section
          className="border-t border-bdr/60 bg-mid/30 px-4 py-16 sm:px-8 sm:py-24"
          aria-labelledby="landing-cta-heading"
        >
          <LandingReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2
                id="landing-cta-heading"
                className="landing-reveal-child font-[var(--font-cinzel),serif] text-xl font-bold tracking-wide text-gold sm:text-2xl"
                style={{ '--landing-reveal-delay': '0ms' } as CSSProperties}
              >
                Start forging
              </h2>
              <p
                className="landing-reveal-child mt-3 text-sm text-bronze sm:text-base"
                style={{ '--landing-reveal-delay': '80ms' } as CSSProperties}
              >
                Free account: cloud library, publish to Explore, follow creators, and keep your item cards, TCG-style faces, and stat blocks in sync everywhere.
              </p>
              <div
                className="landing-reveal-child mt-8"
                style={{ '--landing-reveal-delay': '160ms' } as CSSProperties}
              >
                <LandingCta />
              </div>
            </div>
          </LandingReveal>
        </section>
      </div>
    </>
  );
}
