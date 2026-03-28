import Link from 'next/link';
import { exploreCount, type ExploreListItem } from '@/lib/exploreTypes';

export default function ExploreItemCard({ item }: { item: ExploreListItem }) {
  return (
    <li className="list-none flex h-full min-h-0 flex-col">
      <div className="group flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-bdr bg-panel/90 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-colors hover:border-gold/40 hover:shadow-[0_8px_28px_rgba(201,168,76,0.12)]">
        <Link
          href={`/explore/${item.id}`}
          className="flex min-h-0 min-w-0 flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
        >
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-mid/90">
            {item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt=""
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center">
                <span className="text-2xl text-gold-dark/25" aria-hidden>
                  ◇
                </span>
                <span className="font-[var(--font-cinzel),serif] text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                  No image
                </span>
              </div>
            )}
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 p-3 pt-2.5">
            <h3 className="truncate font-[var(--font-cinzel),serif] text-[0.8rem] font-bold leading-tight text-gold group-hover:text-gold-light">
              {item.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 font-[var(--font-cinzel),serif] text-[0.65rem] uppercase tracking-wider ${
                  item.item_type === 'card'
                    ? 'border-amber-700/50 bg-amber-950/40 text-amber-200'
                    : 'border-violet-800/50 bg-violet-950/40 text-violet-200'
                }`}
              >
                {item.item_type === 'card' ? 'Card' : 'Stat block'}
              </span>
            </div>
          </div>
        </Link>
        <div className="mt-auto flex min-h-0 shrink-0 flex-col gap-1.5 px-3 pb-3 pt-0">
          <p className="truncate text-[0.7rem] text-bronze">
            {item.published_author_name?.trim() ? (
              <>
                By{' '}
                <Link
                  href={`/users/${item.author_id}`}
                  className="text-gold underline-offset-2 hover:text-gold-light hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  {item.published_author_name.trim()}
                </Link>
              </>
            ) : (
              'Community'
            )}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[0.65rem] uppercase tracking-wider text-muted">
            <span>{exploreCount(item.view_count)} views</span>
            <span>{exploreCount(item.fork_count)} forks</span>
            <span className="text-muted/90">
              ▲{exploreCount(item.upvote_count)} ▼{exploreCount(item.downvote_count)} ♥
              {exploreCount(item.favorite_count)}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}
