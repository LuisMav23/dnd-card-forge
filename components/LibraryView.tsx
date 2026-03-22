'use client';

import Link from 'next/link';
import { useMemo, useState, useCallback } from 'react';

const DND_TYPE = 'application/x-dnd-card-forge-id';

interface Folder {
  id: string;
  name: string;
}

interface LibraryCard {
  id: string;
  title: string;
  item_type: 'card' | 'statblock';
  folder_id: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
}

type Scope = 'all' | 'unfiled' | string;

function cardSubtitle(c: LibraryCard): string {
  const d = c.data;
  if (d && typeof d === 'object' && 'fields' in d) {
    const fields = (d as { fields?: Record<string, string> }).fields;
    if (fields?.name?.trim()) return fields.name.trim();
  }
  return c.title;
}

function countInFolder(cards: LibraryCard[], folderId: string | null): number {
  return cards.filter(c => c.folder_id === folderId).length;
}

export default function LibraryView({
  initialFolders,
  initialCards,
}: {
  initialFolders: Folder[];
  initialCards: LibraryCard[];
}) {
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [cards, setCards] = useState<LibraryCard[]>(initialCards);
  const [scope, setScope] = useState<Scope>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const folderById = useMemo(() => Object.fromEntries(folders.map(f => [f.id, f])), [folders]);

  const filteredSorted = useMemo(() => {
    let list = cards.filter(c => {
      if (scope === 'all') return true;
      if (scope === 'unfiled') return c.folder_id === null;
      return c.folder_id === scope;
    });

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(c => {
        const sub = cardSubtitle(c).toLowerCase();
        return sub.includes(q) || c.title.toLowerCase().includes(q);
      });
    }

    list = [...list].sort((a, b) => {
      if (sortBy === 'name') {
        return cardSubtitle(a).localeCompare(cardSubtitle(b), undefined, { sensitivity: 'base' });
      }
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sortBy === 'newest' ? tb - ta : ta - tb;
    });

    return list;
  }, [cards, scope, search, sortBy]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFolders([data, ...folders]);
      setNewFolderName('');
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !confirm(
        'Delete this folder? Items inside become unfiled (not deleted).'
      )
    )
      return;
    try {
      const res = await fetch(`/api/folders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete folder');

      setFolders(folders.filter(f => f.id !== id));
      if (scope === id) setScope('all');
      setCards(cards.map(c => (c.folder_id === id ? { ...c, folder_id: null } : c)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Remove this item from your library?')) return;
    try {
      const res = await fetch(`/api/cards/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item');
      setCards(cards.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveCard = useCallback(async (cardId: string, toFolderId: string | null) => {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: toFolderId }),
      });
      if (!res.ok) throw new Error('Failed to move item');
      setCards(prev => prev.map(c => (c.id === cardId ? { ...c, folder_id: toFolderId } : c)));
    } catch (err) {
      console.error('Error moving item', err);
    }
  }, []);

  const onDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData(DND_TYPE, id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  }, []);

  const onDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOver(null);
  }, []);

  const onFolderDragOver = useCallback((e: React.DragEvent, key: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(key);
  }, []);

  const onFolderDrop = useCallback(
    (e: React.DragEvent, targetFolderId: string | null) => {
      e.preventDefault();
      const id = e.dataTransfer.getData(DND_TYPE);
      setDragOver(null);
      setDraggingId(null);
      if (!id) return;
      const card = cards.find(c => c.id === id);
      if (!card || card.folder_id === targetFolderId) return;
      void handleMoveCard(id, targetFolderId);
    },
    [cards, handleMoveCard]
  );

  const openHref = (c: LibraryCard) =>
    c.item_type === 'card' ? `/card?library=${c.id}` : `/statblocks?library=${c.id}`;

  const scopeTitle =
    scope === 'all'
      ? 'All items'
      : scope === 'unfiled'
        ? 'Unfiled'
        : folderById[scope]?.name ?? 'Folder';

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row lg:gap-0">
      {/* Sidebar */}
      <aside className="flex w-full shrink-0 flex-col gap-4 border-b border-bdr pb-6 lg:w-72 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
        <form onSubmit={handleCreateFolder} className="flex flex-col gap-2">
          <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.12em] text-gold-dark">
            New folder
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              disabled={creatingFolder}
              placeholder="Name…"
              className="min-w-0 flex-1 rounded-md border border-bdr bg-mid px-3 py-2 text-sm text-parch placeholder:text-placeholder/90 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
            <button
              type="submit"
              disabled={creatingFolder || !newFolderName.trim()}
              className="panel-btn shrink-0 px-3 py-2 text-xs disabled:opacity-40"
            >
              {creatingFolder ? '…' : '+'}
            </button>
          </div>
        </form>

        <nav className="flex flex-col gap-1 font-[var(--font-cinzel),serif] text-sm">
          <ScopeRow
            label="All items"
            icon="✦"
            count={cards.length}
            active={scope === 'all'}
            dropKey="all"
            dragOver={dragOver}
            onSelect={() => setScope('all')}
            onDragOver={e => onFolderDragOver(e, 'all')}
            onDragLeave={() => setDragOver(null)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(null);
            }}
          />
          <ScopeRow
            label="Unfiled"
            icon="📂"
            count={countInFolder(cards, null)}
            active={scope === 'unfiled'}
            dropKey="unfiled"
            dragOver={dragOver}
            onSelect={() => setScope('unfiled')}
            onDragOver={e => onFolderDragOver(e, 'unfiled')}
            onDragLeave={() => setDragOver(null)}
            onDrop={e => onFolderDrop(e, null)}
            highlightDrop={draggingId !== null}
          />
          {folders.map(f => (
            <ScopeRow
              key={f.id}
              label={f.name}
              icon="📁"
              count={countInFolder(cards, f.id)}
              active={scope === f.id}
              dropKey={f.id}
              dragOver={dragOver}
              onSelect={() => setScope(f.id)}
              onDragOver={e => onFolderDragOver(e, f.id)}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => onFolderDrop(e, f.id)}
              highlightDrop={draggingId !== null}
              onDelete={e => handleDeleteFolder(f.id, e)}
            />
          ))}
        </nav>

        <p className="text-xs leading-relaxed text-bronze">
          Drag cards onto a folder or <strong className="text-gold-dark">Unfiled</strong> to move them.
        </p>
      </aside>

      {/* Main */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 lg:pl-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-[var(--font-cinzel),serif] text-xl font-semibold tracking-wide text-gold [text-shadow:0_0_12px_rgba(201,168,76,0.15)]">
              {scopeTitle}
            </h2>
            <p className="mt-1 text-sm text-bronze">
              {filteredSorted.length} of {cards.length} shown
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="min-w-[160px] flex-1 rounded-md border border-bdr bg-mid px-3 py-2 text-sm text-parch placeholder:text-placeholder/90 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20 sm:max-w-xs sm:flex-none"
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
              className="rounded-md border border-bdr bg-mid px-3 py-2 font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark focus:border-gold-dark focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>

        {filteredSorted.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-bdr/80 bg-panel/40 px-6 py-16 text-center">
            <p className="font-[var(--font-cinzel),serif] text-gold-dark">Nothing here yet.</p>
            <p className="mt-2 max-w-sm text-sm text-bronze">
              Save from Card Forge or Stat Blocks, or change filters / search.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/card"
                className="panel-btn border-gold/30 bg-gold/10 text-gold hover:bg-gold/20"
              >
                Open Card Forge
              </Link>
              <Link
                href="/statblocks"
                className="panel-btn border-gold/30 bg-gold/10 text-gold hover:bg-gold/20"
              >
                Open Stat Blocks
              </Link>
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSorted.map(c => (
              <li
                key={c.id}
                draggable
                onDragStart={e => onDragStart(e, c.id)}
                onDragEnd={onDragEnd}
                className={`group flex flex-col rounded-xl border bg-gradient-to-b from-panel to-mid/95 p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-200 ${
                  draggingId === c.id
                    ? 'scale-[0.98] border-gold/50 opacity-90'
                    : 'border-bdr hover:border-gold/35 hover:shadow-[0_12px_40px_rgba(201,168,76,0.08)]'
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-[var(--font-cinzel),serif] text-base font-semibold text-gold">
                      {cardSubtitle(c)}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-bronze">{c.title}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider ${
                      c.item_type === 'card'
                        ? 'border-amber-700/50 bg-amber-950/40 text-amber-200'
                        : 'border-violet-800/50 bg-violet-950/40 text-violet-200'
                    }`}
                  >
                    {c.item_type === 'card' ? '⚔ Card' : '📜 Block'}
                  </span>
                </div>

                <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>
                    {c.folder_id ? (
                      <>
                        In <strong className="text-gold/90">{folderById[c.folder_id]?.name ?? '…'}</strong>
                      </>
                    ) : (
                      <span className="italic">Unfiled</span>
                    )}
                  </span>
                  <span className="text-muted/60">·</span>
                  <time dateTime={c.created_at}>
                    {new Date(c.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                </div>

                <div className="mt-auto flex flex-col gap-3 border-t border-bdr/80 pt-4 sm:flex-row sm:items-center">
                  <select
                    aria-label={`Move ${cardSubtitle(c)}`}
                    className="min-w-0 flex-1 rounded-md border border-bdr bg-bg/80 px-2 py-1.5 font-[var(--font-cinzel),serif] text-xs uppercase tracking-wide text-gold-dark focus:border-gold-dark focus:outline-none"
                    value={c.folder_id ?? '__unfiled__'}
                    onChange={e => {
                      const v = e.target.value;
                      void handleMoveCard(c.id, v === '__unfiled__' ? null : v);
                    }}
                  >
                    <option value="__unfiled__">📂 Unfiled</option>
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Link
                      href={openHref(c)}
                      className="panel-btn flex-1 justify-center border-gold/40 bg-gold/15 py-2 text-xs text-gold hover:bg-gold/25"
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDeleteCard(c.id)}
                      className="rounded-md border border-red-900/60 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-950/50"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ScopeRow({
  label,
  icon,
  count,
  active,
  onSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  dragOver,
  dropKey,
  highlightDrop,
  onDelete,
}: {
  label: string;
  icon: string;
  count: number;
  active: boolean;
  onSelect: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  dragOver: string | null;
  dropKey: string;
  highlightDrop?: boolean;
  onDelete?: (e: React.MouseEvent) => void;
}) {
  const isOver = dragOver === dropKey;
  return (
    <div
      className={`group relative flex items-center rounded-lg border transition-colors ${
        active
          ? 'border-gold/50 bg-gold/10 shadow-[inset_0_0_0_1px_rgba(201,168,76,0.2)]'
          : 'border-transparent hover:bg-mid/80'
      } ${highlightDrop && isOver ? 'ring-2 ring-gold/40' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <button
        type="button"
        onClick={onSelect}
        className={`flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-left transition-colors hover:text-gold ${active ? 'text-gold' : 'text-bronze'}`}
      >
        <span className="shrink-0 opacity-90" aria-hidden>
          {icon}
        </span>
        <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
        <span className="shrink-0 rounded-md bg-bg/50 px-1.5 py-0.5 text-xs tabular-nums text-gold/80">
          {count}
        </span>
      </button>
      {onDelete && (
        <button
          type="button"
          className="mr-1 shrink-0 rounded p-1.5 text-muted opacity-0 transition-all hover:bg-red-950/40 hover:text-red-400 group-hover:opacity-100"
          onClick={onDelete}
          title="Delete folder"
        >
          ×
        </button>
      )}
    </div>
  );
}
