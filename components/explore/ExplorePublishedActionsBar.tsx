import Link from 'next/link';
import { ChevronUp, ChevronDown, Heart } from 'lucide-react';
import { exploreCount } from '@/lib/exploreTypes';

export type ExplorePublishedActionsRow = {
  published_author_name: string | null;
  author_id: string;
  view_count?: number | string;
  fork_count?: number | string;
  upvote_count: number;
  downvote_count: number;
  favorite_count: number;
  viewer_vote: -1 | 0 | 1 | null;
  viewer_favorited: boolean;
};

type Props = {
  row: ExplorePublishedActionsRow;
  reactionBusy: boolean;
  onVoteUp: () => void;
  onVoteDown: () => void;
  onToggleSave: () => void;
  downloadLabel: string;
  downloading: boolean;
  onDownload: () => void;
  forkLabel: string;
  forking: boolean;
  onFork: () => void;
  /** When false: unpublished (hidden) or you own the item (use Duplicate in your library instead). */
  forkEnabled?: boolean;
};

export default function ExplorePublishedActionsBar({
  row,
  reactionBusy,
  onVoteUp,
  onVoteDown,
  onToggleSave,
  downloadLabel,
  downloading,
  onDownload,
  forkLabel,
  forking,
  onFork,
  forkEnabled = true,
}: Props) {
  return (
    <div className="border-t border-bdr bg-panel/80 px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="min-w-0 space-y-3">
          <p className="text-base leading-relaxed text-parch">
            <span className="text-muted">Published by </span>
            {row.published_author_name?.trim() ? (
              <Link
                href={`/users/${row.author_id}`}
                className="font-medium text-gold underline-offset-4 hover:text-gold-light hover:underline"
              >
                {row.published_author_name.trim()}
              </Link>
            ) : (
              <span className="font-medium text-bronze">Community</span>
            )}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-parch">
            <li className="flex flex-col gap-0.5 sm:block sm:whitespace-nowrap">
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">Views</span>
              <span className="tabular-nums sm:ml-1">{exploreCount(row.view_count)}</span>
            </li>
            <li className="flex flex-col gap-0.5 sm:block sm:whitespace-nowrap">
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">Forks</span>
              <span className="tabular-nums sm:ml-1">{exploreCount(row.fork_count)}</span>
            </li>
            <li className="flex flex-col gap-0.5 sm:block sm:whitespace-nowrap">
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">Up / down</span>
              <span className="tabular-nums sm:ml-1">
                {exploreCount(row.upvote_count)} / {exploreCount(row.downvote_count)}
              </span>
            </li>
            <li className="flex flex-col gap-0.5 sm:block sm:whitespace-nowrap">
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">Saves</span>
              <span className="tabular-nums sm:ml-1">{exploreCount(row.favorite_count)}</span>
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 border-t border-bdr/60 pt-5 lg:border-t-0 lg:pt-0">
          <div role="group" aria-label="Rate and save" className="flex flex-wrap gap-2.5">
            <button
              type="button"
              disabled={reactionBusy}
              title="Upvote"
              onClick={onVoteUp}
              className={`inline-flex h-11 min-w-[5.5rem] items-center justify-center rounded-lg border px-4 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-50 ${
                row.viewer_vote === 1
                  ? 'border-gold/60 bg-gold/20 text-gold'
                  : 'border-bdr bg-panel/80 text-bronze hover:border-gold/35 hover:text-parch'
              }`}
            >
              <ChevronUp className="inline h-4 w-4" /> Up
            </button>
            <button
              type="button"
              disabled={reactionBusy}
              title="Downvote"
              onClick={onVoteDown}
              className={`inline-flex h-11 min-w-[5.5rem] items-center justify-center rounded-lg border px-4 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-50 ${
                row.viewer_vote === -1
                  ? 'border-amber-800/60 bg-amber-950/50 text-amber-200'
                  : 'border-bdr bg-panel/80 text-bronze hover:border-gold/35 hover:text-parch'
              }`}
            >
              <ChevronDown className="inline h-4 w-4" /> Down
            </button>
            <button
              type="button"
              disabled={reactionBusy}
              title="Save to favorites"
              onClick={onToggleSave}
              className={`inline-flex h-11 min-w-[5.5rem] items-center justify-center rounded-lg border px-4 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-50 ${
                row.viewer_favorited
                  ? 'border-pink-800/60 bg-pink-950/40 text-pink-200'
                  : 'border-bdr bg-panel/80 text-bronze hover:border-gold/35 hover:text-parch'
              }`}
            >
              <Heart className="inline h-4 w-4" /> Save
            </button>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-stretch">
            <button
              type="button"
              onClick={onDownload}
              disabled={downloading}
              className="panel-btn min-h-11 justify-center border-bdr text-parch hover:border-gold/35 hover:text-gold disabled:opacity-50 sm:min-w-[12rem]"
            >
              {downloadLabel}
            </button>
            {forkEnabled ? (
              <button
                type="button"
                onClick={onFork}
                disabled={forking}
                className="panel-btn min-h-11 justify-center text-gold disabled:opacity-50 sm:min-w-[14rem]"
              >
                {forkLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
