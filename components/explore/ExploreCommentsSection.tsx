'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type ExploreComment = {
  id: string;
  card_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  author_full_name: string;
  author_avatar_url: string | null;
};

function formatRelativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function buildChildrenMap(flat: ExploreComment[]): Map<string | null, ExploreComment[]> {
  const m = new Map<string | null, ExploreComment[]>();
  const ensure = (k: string | null) => {
    if (!m.has(k)) m.set(k, []);
    return m.get(k)!;
  };
  for (const c of flat) {
    ensure(c.parent_id).push(c);
  }
  for (const arr of m.values()) {
    arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
  return m;
}

function CommentComposer({
  placeholder,
  submitLabel,
  busy,
  onSubmit,
  onCancel,
  variant = 'default',
}: {
  placeholder: string;
  submitLabel: string;
  busy: boolean;
  onSubmit: (text: string) => void | Promise<void>;
  onCancel?: () => void;
  variant?: 'default' | 'compact';
}) {
  const [text, setText] = useState('');
  const compact = variant === 'compact';
  return (
    <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-3'}`}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        maxLength={4000}
        className={
          compact
            ? 'w-full resize-y border-0 border-b border-bdr/50 bg-transparent px-0 py-1.5 text-sm text-parch placeholder:text-muted focus:border-gold/35 focus:outline-none focus:ring-0'
            : 'w-full resize-y rounded-md border border-bdr/50 bg-panel/30 px-3 py-2.5 text-sm text-parch placeholder:text-muted focus:border-gold/35 focus:outline-none focus:ring-1 focus:ring-gold/15'
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || !text.trim()}
          onClick={async () => {
            const t = text.trim();
            if (!t) return;
            try {
              await onSubmit(t);
              setText('');
            } catch {
              /* parent surfaced error */
            }
          }}
          className={
            compact
              ? 'text-xs font-semibold uppercase tracking-wider text-gold hover:text-gold-light disabled:opacity-40'
              : 'rounded-md border border-gold/30 bg-gold/5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gold transition-colors hover:border-gold/50 hover:bg-gold/10 disabled:opacity-40'
          }
        >
          {submitLabel}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="text-xs text-bronze hover:text-parch">
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CommentNode({
  comment,
  depth,
  childrenMap,
  cardId,
  currentUserId,
  onRefresh,
}: {
  comment: ExploreComment;
  depth: number;
  childrenMap: Map<string | null, ExploreComment[]>;
  cardId: string;
  currentUserId: string | null;
  onRefresh: () => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const children = childrenMap.get(comment.id) ?? [];
  const displayName = comment.author_full_name?.trim() || `User ${comment.user_id.slice(0, 8)}`;
  const isOwn = currentUserId != null && currentUserId === comment.user_id;
  const isReply = depth > 0;

  const postReply = async (body: string) => {
    setPosting(true);
    try {
      const res = await fetch(`/api/explore/${cardId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, parent_id: comment.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to post');
      setReplyOpen(false);
      onRefresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to post');
      throw e;
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwn) return;
    if (!confirm('Delete this comment and all its replies?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/explore/${cardId}/comments?comment_id=${comment.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete');
      onRefresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={isReply ? 'mt-2 border-l border-gold/15 pl-3 sm:mt-2.5 sm:pl-4' : ''}>
      <div className="flex gap-3">
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-mid ring-1 ring-bdr/40">
          {comment.author_avatar_url ? (
            <img src={comment.author_avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[0.6rem] text-muted">?</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Link
              href={`/users/${comment.user_id}`}
              className="font-[var(--font-cinzel),serif] text-[0.8rem] font-semibold text-gold hover:text-gold-light sm:text-sm"
            >
              {displayName}
            </Link>
            <span className="text-[0.65rem] text-muted sm:text-[0.7rem]">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>
          <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-parch">
            {comment.body}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {currentUserId ? (
              <button
                type="button"
                onClick={() => setReplyOpen(v => !v)}
                className="text-[0.65rem] font-semibold uppercase tracking-wider text-gold-dark/90 hover:text-gold"
              >
                Reply
              </button>
            ) : null}
            {isOwn ? (
              <button
                type="button"
                disabled={deleting}
                onClick={() => void handleDelete()}
                className="text-[0.65rem] font-semibold uppercase tracking-wider text-red-300/85 hover:text-red-200 disabled:opacity-50"
              >
                {deleting ? '…' : 'Delete'}
              </button>
            ) : null}
          </div>
          {replyOpen ? (
            <div className="mt-3 max-w-xl">
              <CommentComposer
                placeholder="Write a reply…"
                submitLabel="Post reply"
                busy={posting}
                variant="compact"
                onSubmit={text => postReply(text)}
                onCancel={() => setReplyOpen(false)}
              />
            </div>
          ) : null}
        </div>
      </div>
      {children.length > 0 ? (
        <div className="mt-1 space-y-0">
          {children.map(ch => (
            <CommentNode
              key={ch.id}
              comment={ch}
              depth={Math.min(depth + 1, 12)}
              childrenMap={childrenMap}
              cardId={cardId}
              currentUserId={currentUserId}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ExploreCommentsSection({ cardId }: { cardId: string }) {
  const [comments, setComments] = useState<ExploreComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postingTop, setPostingTop] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const supabase = createClient();

  const loadComments = useCallback(async (opts?: { silent?: boolean }) => {
    if (!cardId) return;
    if (!opts?.silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await fetch(`/api/explore/${cardId}/comments?limit=500`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load comments');
      setComments(Array.isArray(data.comments) ? data.comments : []);
      setError(null);
    } catch (e) {
      if (!opts?.silent) {
        setError(e instanceof Error ? e.message : 'Error');
        setComments([]);
      }
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!cancelled) setCurrentUserId(user?.id ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase.auth]);

  const childrenMap = useMemo(() => buildChildrenMap(comments), [comments]);
  const roots = childrenMap.get(null) ?? [];

  const postTop = async (body: string) => {
    setPostingTop(true);
    try {
      const res = await fetch(`/api/explore/${cardId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, parent_id: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to post');
      await loadComments({ silent: true });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to post');
      throw e;
    } finally {
      setPostingTop(false);
    }
  };

  return (
    <section className="border-t border-bdr/70 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-[var(--font-cinzel),serif] text-lg font-bold tracking-wide text-gold sm:text-xl">
          Comments
        </h2>
        <p className="mt-0.5 text-sm text-bronze/90">Discussion for this published item.</p>

        <div className="mt-6">
          {currentUserId ? (
            <CommentComposer
              placeholder="Add a comment…"
              submitLabel="Post comment"
              busy={postingTop}
              onSubmit={text => postTop(text)}
            />
          ) : (
            <p className="text-sm text-bronze">
              <Link href="/" className="text-gold underline-offset-2 hover:underline">
                Sign in
              </Link>{' '}
              to join the discussion.
            </p>
          )}
        </div>

        {loading && <p className="mt-8 text-sm text-muted">Loading comments…</p>}
        {error && <p className="mt-8 text-sm text-red-300">{error}</p>}
        {!loading && !error && roots.length === 0 && (
          <p className="mt-8 text-sm italic text-muted">No comments yet. Be the first to share your thoughts.</p>
        )}
        {!loading && !error && roots.length > 0 ? (
          <div className="mt-8 flex flex-col gap-8 border-t border-bdr/35 pt-8">
            {roots.map(c => (
              <CommentNode
                key={c.id}
                comment={c}
                depth={0}
                childrenMap={childrenMap}
                cardId={cardId}
                currentUserId={currentUserId}
                onRefresh={() => void loadComments({ silent: true })}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
