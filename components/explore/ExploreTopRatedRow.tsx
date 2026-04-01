import Link from 'next/link';
import { ChevronUp, ChevronDown, Diamond, Heart } from 'lucide-react';
import { exploreCount, type ExploreListItem } from '@/lib/exploreTypes';

function rankBadgeClass(rank: number): string {
  if (rank === 1) return 'border-amber-400/70 text-amber-100';
  if (rank === 2) return 'border-slate-300/60 text-slate-200';
  if (rank === 3) return 'border-amber-800/55 text-amber-200/95';
  return 'border-gold/50 text-gold';
}

/** Landscape row: thumbnail left, title and meta right (Top Rated section). */
export default function ExploreTopRatedRow({
  item,
  rank,
  showItemTypeTag = false,
}: {
  item: ExploreListItem;
  rank: number;
  /** Top Rated uses section titles (“Spell cards” / “Stat blocks”); set true to show Card / Stat block pill */
  showItemTypeTag?: boolean;
}) {
  return (
    <li className="list-none">
      <div className="group flex min-h-0 flex-row items-stretch overflow-hidden rounded-xl border border-bdr bg-panel/90 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-colors hover:border-gold/40 hover:shadow-[0_8px_28px_rgba(201,168,76,0.12)]">
        <Link
          href={`/explore/${item.id}`}
          className="relative flex w-[min(38%,10.5rem)] shrink-0 self-stretch sm:w-44"
          aria-label={`Open ${item.title}`}
        >
          <div className="relative h-full min-h-[5.5rem] w-full bg-mid/90">
            <span
              className={`absolute left-2 top-2 z-10 flex h-8 min-w-8 items-center justify-center rounded-full border bg-bg/90 px-1.5 font-[var(--font-cinzel),serif] text-[0.7rem] font-bold shadow-md backdrop-blur-sm ${rankBadgeClass(rank)}`}
              aria-label={`Rank ${rank}`}
            >
              #{rank}
            </span>
            {item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt=""
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center">
                <Diamond className="h-5 w-5 text-gold-dark/25" aria-hidden />
                <span className="font-[var(--font-cinzel),serif] text-[0.6rem] font-semibold uppercase tracking-wider text-muted">
                  No image
                </span>
              </div>
            )}
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col py-2.5 pl-3 pr-3 sm:py-3 sm:pl-4">
          <Link
            href={`/explore/${item.id}`}
            className="flex min-w-0 flex-1 flex-col gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
          >
            <div className="min-w-0">
              <h3 className="line-clamp-2 font-[var(--font-cinzel),serif] text-[0.85rem] font-bold leading-snug text-gold group-hover:text-gold-light sm:text-[0.9rem]">
                {item.title}
              </h3>
              {showItemTypeTag ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
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
              ) : null}
            </div>
            <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-bdr/50 pt-2 text-[0.65rem] uppercase tracking-wider text-muted">
              <span>{exploreCount(item.view_count)} views</span>
              <span>{exploreCount(item.fork_count)} forks</span>
              <span className="inline-flex items-center gap-1 text-muted/90">
                <ChevronUp className="inline h-3 w-3" />{exploreCount(item.upvote_count)}{' '}
                <ChevronDown className="inline h-3 w-3" />{exploreCount(item.downvote_count)}{' '}
                <Heart className="inline h-3 w-3" />{exploreCount(item.favorite_count)}
              </span>
            </div>
          </Link>
          <p className="mt-2 truncate text-[0.7rem] text-bronze">
            {item.published_author_name?.trim() ? (
              <>
                By{' '}
                <Link
                  href={`/users/${item.author_id}`}
                  className="text-gold underline-offset-2 hover:text-gold-light hover:underline"
                >
                  {item.published_author_name.trim()}
                </Link>
              </>
            ) : (
              'Community'
            )}
          </p>
        </div>
      </div>
    </li>
  );
}
