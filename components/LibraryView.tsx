'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { Diamond } from 'lucide-react';
import { crossOriginForImgSrc } from '@/lib/crossOriginForImgSrc';
import { FROM_LIBRARY_APPEND, FROM_LIBRARY_QS } from '@/lib/fromLibraryNav';
import { ITEM_CARD_GRID_CLASS } from '@/lib/itemCardGrid';

const DND_MIME = 'application/x-dnd-card-forge-library';

type DndPayload = { entity: 'card' | 'encounter'; id: string };

function parseDndPayload(raw: string): DndPayload | null {
  try {
    const o = JSON.parse(raw) as unknown;
    if (
      o &&
      typeof o === 'object' &&
      (o as DndPayload).entity === 'card' &&
      typeof (o as DndPayload).id === 'string'
    ) {
      return { entity: 'card', id: (o as DndPayload).id };
    }
    if (
      o &&
      typeof o === 'object' &&
      (o as DndPayload).entity === 'encounter' &&
      typeof (o as DndPayload).id === 'string'
    ) {
      return { entity: 'encounter', id: (o as DndPayload).id };
    }
  } catch {
    /* ignore */
  }
  return null;
}

const SYSTEM_KIND_ORDER = ['cards', 'statblocks', 'encounters'] as const;

export interface Folder {
  id: string;
  name: string;
  folder_kind?: string | null;
  description?: string | null;
  created_at?: string;
}

interface LibraryCard {
  id: string;
  title: string;
  item_type: 'card' | 'statblock';
  folder_id: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
  is_published?: boolean;
  published_at?: string | null;
  published_author_name?: string | null;
}

export interface LibraryEncounter {
  id: string;
  title: string;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
  entry_count: number;
  thumbnail_url?: string | null;
}

type Scope = 'all' | string;

type ItemTypeFilter = 'all' | 'card' | 'statblock' | 'encounter';

type GridItem =
  | { type: 'card'; id: string; card: LibraryCard }
  | { type: 'encounter'; id: string; encounter: LibraryEncounter };

function cardSubtitle(c: LibraryCard): string {
  const d = c.data;
  if (d && typeof d === 'object' && 'fields' in d) {
    const fields = (d as { fields?: Record<string, string> }).fields;
    if (fields?.name?.trim()) return fields.name.trim();
  }
  return c.title;
}

/** Published/home activity use the same image field on card JSON. */
function libraryCardThumbUrl(c: LibraryCard): string | undefined {
  const d = c.data;
  if (!d || typeof d !== 'object') return undefined;
  const raw = d as { image?: unknown };
  return typeof raw.image === 'string' && raw.image.trim() ? raw.image.trim() : undefined;
}

/** Matches [`app/(main)/home/page.tsx`](app/(main)/home/page.tsx) recent-activity tile image area (full-width strip on stacked cards). */
function LibraryItemThumbnail({
  imageUrl,
  label,
}: {
  imageUrl?: string | null;
  label: string;
}) {
  const frameClass =
    'relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-t-xl bg-mid/90';
  const trimmed = imageUrl?.trim();
  if (trimmed) {
    return (
      <div className={frameClass}>
        <img
          src={trimmed}
          alt=""
          crossOrigin={crossOriginForImgSrc(trimmed)}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />
        <span className="sr-only">{label} thumbnail</span>
      </div>
    );
  }
  return (
    <div className={frameClass} title={label}>
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center">
        <Diamond className="h-6 w-6 text-gold-dark/25" aria-hidden />
        <span className="font-[var(--font-cinzel),serif] text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
          No image
        </span>
      </div>
      <span className="sr-only">{label} thumbnail</span>
    </div>
  );
}

function countInFolder(
  cards: LibraryCard[],
  encounters: LibraryEncounter[],
  folderId: string | null
): number {
  return (
    cards.filter(c => c.folder_id === folderId).length +
    encounters.filter(e => e.folder_id === folderId).length
  );
}

/** System folders aggregate by item type, not physical folder_id. */
function countInSystemFolder(folder: Folder, cards: LibraryCard[], encounters: LibraryEncounter[]): number {
  if (folder.folder_kind === 'cards') {
    return cards.filter(c => c.item_type === 'card').length;
  }
  if (folder.folder_kind === 'statblocks') {
    return cards.filter(c => c.item_type === 'statblock').length;
  }
  if (folder.folder_kind === 'encounters') {
    return encounters.length;
  }
  return countInFolder(cards, encounters, folder.id);
}

function openHrefCard(c: LibraryCard) {
  const path = c.item_type === 'card' ? `/card/${c.id}` : `/statblocks/${c.id}`;
  return `${path}${FROM_LIBRARY_QS}`;
}

function isMtgLibraryCard(c: LibraryCard): boolean {
  const d = c.data;
  return c.item_type === 'card' && d != null && typeof d === 'object' && (d as { cardGame?: string }).cardGame === 'mtg';
}

function editHrefCard(c: LibraryCard) {
  let path: string;
  if (c.item_type === 'card') {
    path = isMtgLibraryCard(c)
      ? `/card/new?game=mtg&library=${c.id}`
      : `/card/new?library=${c.id}`;
  } else {
    path = `/statblocks/new?library=${c.id}`;
  }
  return `${path}${FROM_LIBRARY_APPEND}`;
}

type MenuPanel = 'main' | 'move';

type FolderModalMode = 'create' | 'rename' | null;

function FolderKebabMenu({
  open,
  onToggle,
  onClose,
  onRename,
  onDuplicate,
  onDelete,
  menuButtonId,
  menuId,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: (e: React.MouseEvent) => void;
  menuButtonId: string;
  menuId: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const menuItemClass =
    'block w-full rounded-md px-3 py-2 text-left font-[var(--font-cinzel),serif] text-xs uppercase tracking-wide text-parch transition-colors hover:bg-gold/10 hover:text-gold';

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        id={menuButtonId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="mr-1 rounded p-1.5 text-muted transition-colors hover:bg-mid hover:text-gold"
        aria-label="Folder actions"
        onClick={e => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <span className="block px-0.5 font-bold leading-none tracking-widest text-gold/90" aria-hidden>
          ⋮
        </span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={menuButtonId}
          className="absolute right-0 top-full z-40 mt-0.5 min-w-[10.5rem] rounded-lg border border-bdr bg-panel py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            onClick={() => {
              onClose();
              onRename();
            }}
          >
            Rename
          </button>
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            onClick={() => {
              onClose();
              onDuplicate();
            }}
          >
            Duplicate
          </button>
          <button
            type="button"
            role="menuitem"
            className={`${menuItemClass} text-red-400 hover:bg-red-950/40 hover:text-red-300`}
            onClick={e => {
              onClose();
              onDelete(e);
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FolderEditModal({
  open,
  mode,
  name,
  description,
  saving,
  onNameChange,
  onDescriptionChange,
  onSubmit,
  onClose,
  titleId,
}: {
  open: boolean;
  mode: Exclude<FolderModalMode, null>;
  name: string;
  description: string;
  saving: boolean;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  titleId: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => nameInputRef.current?.focus(), 0);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open, onClose]);

  if (!open) return null;

  const heading = mode === 'create' ? 'New folder' : 'Rename folder';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={panelRef}
        className="w-full max-w-md rounded-xl border border-bdr bg-panel p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        <h2 id={titleId} className="font-[var(--font-cinzel),serif] text-lg font-semibold text-gold">
          {heading}
        </h2>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="folder-modal-name"
              className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.12em] text-gold-dark"
            >
              Name
            </label>
            <input
              ref={nameInputRef}
              id="folder-modal-name"
              type="text"
              value={name}
              onChange={e => onNameChange(e.target.value)}
              disabled={saving}
              required
              className="rounded-md border border-bdr bg-mid px-3 py-2 text-sm text-parch placeholder:text-placeholder/90 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20"
              placeholder="Folder name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="folder-modal-desc"
              className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.12em] text-gold-dark"
            >
              Description <span className="font-sans normal-case tracking-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="folder-modal-desc"
              value={description}
              onChange={e => onDescriptionChange(e.target.value)}
              disabled={saving}
              rows={3}
              className="resize-y rounded-md border border-bdr bg-mid px-3 py-2 text-sm text-parch placeholder:text-placeholder/90 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20"
              placeholder="Notes for this folder…"
            />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-md border border-bdr bg-transparent px-4 py-2 font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-bronze hover:bg-mid hover:text-gold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="panel-btn px-4 py-2 text-xs disabled:opacity-40"
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LibraryCardOverflowMenu({
  card,
  folders,
  open,
  panel,
  onPanelChange,
  onToggle,
  onClose,
  onMove,
  onDuplicate,
  onDelete,
  onPublishToggle,
  menuButtonId,
  menuId,
}: {
  card: LibraryCard;
  folders: Folder[];
  open: boolean;
  panel: MenuPanel;
  onPanelChange: (p: MenuPanel) => void;
  onToggle: () => void;
  onClose: () => void;
  onMove: (folderId: string | null) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPublishToggle: (publish: boolean) => void;
  menuButtonId: string;
  menuId: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const itemLabel = cardSubtitle(card);
  const menuItemClass =
    'block w-full rounded-md px-3 py-2 text-left font-[var(--font-cinzel),serif] text-xs uppercase tracking-wide text-parch transition-colors hover:bg-gold/10 hover:text-gold';

  return (
    <div
      ref={rootRef}
      className="relative z-10 shrink-0"
      onClick={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
      onAuxClick={e => e.stopPropagation()}
    >
      <button
        type="button"
        id={menuButtonId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="-mr-1 rounded-md p-1.5 text-muted transition-colors hover:bg-mid hover:text-gold"
        aria-label={`More actions for ${itemLabel}`}
        onPointerDown={e => e.stopPropagation()}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
      >
        <span className="block px-0.5 font-bold leading-none tracking-widest text-gold/90" aria-hidden>
          ⋮
        </span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={menuButtonId}
          className="absolute right-0 top-full z-[100] mt-1.5 min-w-[11rem] rounded-lg border border-bdr bg-panel py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          {panel === 'main' ? (
            <>
              <Link
                href={editHrefCard(card)}
                role="menuitem"
                className={menuItemClass}
                onClick={() => onClose()}
              >
                Edit
              </Link>
              <button
                type="button"
                role="menuitem"
                className={menuItemClass}
                onClick={() => onPanelChange('move')}
              >
                Move to
              </button>
              <button
                type="button"
                role="menuitem"
                className={menuItemClass}
                onClick={() => {
                  onClose();
                  onDuplicate();
                }}
              >
                Duplicate
              </button>
              {card.is_published ? (
                <button
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  onClick={() => {
                    onClose();
                    onPublishToggle(false);
                  }}
                >
                  Unpublish
                </button>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  onClick={() => {
                    onClose();
                    onPublishToggle(true);
                  }}
                >
                  Publish
                </button>
              )}
              <button
                type="button"
                role="menuitem"
                className={`${menuItemClass} text-red-400 hover:bg-red-950/40 hover:text-red-300`}
                onClick={() => {
                  onClose();
                  onDelete();
                }}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={menuItemClass}
                onClick={() => onPanelChange('main')}
              >
                ← Back
              </button>
              <div className="my-1 border-t border-bdr/60" role="presentation" />
              <button
                type="button"
                role="menuitem"
                disabled={card.folder_id === null}
                className={`${menuItemClass} disabled:cursor-not-allowed disabled:opacity-40`}
                onClick={() => {
                  if (card.folder_id === null) return;
                  onMove(null);
                  onClose();
                }}
              >
                No folder
              </button>
              {folders.map(f => (
                <button
                  key={f.id}
                  type="button"
                  role="menuitem"
                  disabled={card.folder_id === f.id}
                  className={`${menuItemClass} disabled:cursor-not-allowed disabled:opacity-40`}
                  onClick={() => {
                    if (card.folder_id === f.id) return;
                    onMove(f.id);
                    onClose();
                  }}
                >
                  {f.name}
                </button>
              ))}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function LibraryEncounterOverflowMenu({
  encounter,
  folders,
  open,
  panel,
  onPanelChange,
  onToggle,
  onClose,
  onMove,
  onDuplicate,
  onDelete,
  menuButtonId,
  menuId,
}: {
  encounter: LibraryEncounter;
  folders: Folder[];
  open: boolean;
  panel: MenuPanel;
  onPanelChange: (p: MenuPanel) => void;
  onToggle: () => void;
  onClose: () => void;
  onMove: (folderId: string | null) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  menuButtonId: string;
  menuId: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const menuItemClass =
    'block w-full rounded-md px-3 py-2 text-left font-[var(--font-cinzel),serif] text-xs uppercase tracking-wide text-parch transition-colors hover:bg-gold/10 hover:text-gold';

  return (
    <div
      ref={rootRef}
      className="relative z-10 shrink-0"
      onClick={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
      onAuxClick={e => e.stopPropagation()}
    >
      <button
        type="button"
        id={menuButtonId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="-mr-1 rounded-md p-1.5 text-muted transition-colors hover:bg-mid hover:text-gold"
        aria-label={`More actions for ${encounter.title}`}
        onPointerDown={e => e.stopPropagation()}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
      >
        <span className="block px-0.5 font-bold leading-none tracking-widest text-gold/90" aria-hidden>
          ⋮
        </span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={menuButtonId}
          className="absolute right-0 top-full z-[100] mt-1.5 min-w-[11rem] rounded-lg border border-bdr bg-panel py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          {panel === 'main' ? (
            <>
              <Link
                href={`/encounters/${encounter.id}/edit${FROM_LIBRARY_QS}`}
                role="menuitem"
                className={menuItemClass}
                onClick={() => onClose()}
              >
                Edit
              </Link>
              <button
                type="button"
                role="menuitem"
                className={menuItemClass}
                onClick={() => onPanelChange('move')}
              >
                Move to
              </button>
              <button
                type="button"
                role="menuitem"
                className={menuItemClass}
                onClick={() => {
                  onClose();
                  onDuplicate();
                }}
              >
                Duplicate
              </button>
              <button
                type="button"
                role="menuitem"
                className={`${menuItemClass} text-red-400 hover:bg-red-950/40 hover:text-red-300`}
                onClick={() => {
                  onClose();
                  onDelete();
                }}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={menuItemClass}
                onClick={() => onPanelChange('main')}
              >
                ← Back
              </button>
              <div className="my-1 border-t border-bdr/60" role="presentation" />
              <button
                type="button"
                role="menuitem"
                disabled={encounter.folder_id === null}
                className={`${menuItemClass} disabled:cursor-not-allowed disabled:opacity-40`}
                onClick={() => {
                  if (encounter.folder_id === null) return;
                  onMove(null);
                  onClose();
                }}
              >
                No folder
              </button>
              {folders.map(f => (
                <button
                  key={f.id}
                  type="button"
                  role="menuitem"
                  disabled={encounter.folder_id === f.id}
                  className={`${menuItemClass} disabled:cursor-not-allowed disabled:opacity-40`}
                  onClick={() => {
                    if (encounter.folder_id === f.id) return;
                    onMove(f.id);
                    onClose();
                  }}
                >
                  {f.name}
                </button>
              ))}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function LibraryView({
  initialFolders,
  initialCards,
  initialEncounters,
}: {
  initialFolders: Folder[];
  initialCards: LibraryCard[];
  initialEncounters: LibraryEncounter[];
}) {
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [cards, setCards] = useState<LibraryCard[]>(initialCards);
  const [encounters, setEncounters] = useState<LibraryEncounter[]>(initialEncounters);
  const [scope, setScope] = useState<Scope>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [itemTypeFilter, setItemTypeFilter] = useState<ItemTypeFilter>('all');
  const [folderModalMode, setFolderModalMode] = useState<FolderModalMode>(null);
  const [folderModalRenameId, setFolderModalRenameId] = useState<string | null>(null);
  const [modalFolderName, setModalFolderName] = useState('');
  const [modalFolderDescription, setModalFolderDescription] = useState('');
  const [modalFolderSaving, setModalFolderSaving] = useState(false);
  const [folderKebabOpenId, setFolderKebabOpenId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [draggingPayload, setDraggingPayload] = useState<DndPayload | null>(null);
  const [menuOpenKey, setMenuOpenKey] = useState<string | null>(null);
  const [menuPanel, setMenuPanel] = useState<MenuPanel>('main');
  const router = useRouter();

  const folderById = useMemo(() => Object.fromEntries(folders.map(f => [f.id, f])), [folders]);

  const { systemFolders, customFolders } = useMemo(() => {
    const system: Folder[] = [];
    const custom: Folder[] = [];
    for (const f of folders) {
      const k = f.folder_kind;
      if (k === 'cards' || k === 'statblocks' || k === 'encounters') {
        system.push(f);
      } else {
        custom.push(f);
      }
    }
    system.sort(
      (a, b) =>
        SYSTEM_KIND_ORDER.indexOf(a.folder_kind as (typeof SYSTEM_KIND_ORDER)[number]) -
        SYSTEM_KIND_ORDER.indexOf(b.folder_kind as (typeof SYSTEM_KIND_ORDER)[number])
    );
    custom.sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });
    return { systemFolders: system, customFolders: custom };
  }, [folders]);

  const totalItems = cards.length + encounters.length;

  const filteredSorted = useMemo(() => {
    const scopeFolder = scope !== 'all' ? folderById[scope] : undefined;

    const cardMatchesScope = (c: LibraryCard): boolean => {
      if (scope === 'all') return true;
      const kind = scopeFolder?.folder_kind;
      if (kind === 'cards') return c.item_type === 'card';
      if (kind === 'statblocks') return c.item_type === 'statblock';
      if (kind === 'encounters') return false;
      return c.folder_id === scope;
    };

    const encounterMatchesScope = (e: LibraryEncounter): boolean => {
      if (scope === 'all') return true;
      const kind = scopeFolder?.folder_kind;
      if (kind === 'encounters') return true;
      if (kind === 'cards' || kind === 'statblocks') return false;
      return e.folder_id === scope;
    };

    let items: GridItem[] = [];
    for (const c of cards) {
      if (cardMatchesScope(c)) {
        items.push({ type: 'card', id: c.id, card: c });
      }
    }
    for (const enc of encounters) {
      if (encounterMatchesScope(enc)) {
        items.push({ type: 'encounter', id: enc.id, encounter: enc });
      }
    }

    const q = search.trim().toLowerCase();
    if (q) {
      items = items.filter(it => {
        if (it.type === 'card') {
          const sub = cardSubtitle(it.card).toLowerCase();
          return sub.includes(q) || it.card.title.toLowerCase().includes(q);
        }
        return it.encounter.title.toLowerCase().includes(q);
      });
    }

    if (itemTypeFilter !== 'all') {
      items = items.filter(it => {
        if (itemTypeFilter === 'encounter') return it.type === 'encounter';
        if (it.type !== 'card') return false;
        return it.card.item_type === itemTypeFilter;
      });
    }

    items = [...items].sort((a, b) => {
      if (sortBy === 'name') {
        const na = a.type === 'card' ? cardSubtitle(a.card) : a.encounter.title;
        const nb = b.type === 'card' ? cardSubtitle(b.card) : b.encounter.title;
        return na.localeCompare(nb, undefined, { sensitivity: 'base' });
      }
      const ta =
        a.type === 'card'
          ? new Date(a.card.created_at).getTime()
          : new Date(a.encounter.created_at).getTime();
      const tb =
        b.type === 'card'
          ? new Date(b.card.created_at).getTime()
          : new Date(b.encounter.created_at).getTime();
      return sortBy === 'newest' ? tb - ta : ta - tb;
    });

    return items;
  }, [cards, encounters, scope, search, sortBy, itemTypeFilter, folderById]);

  const closeMenu = useCallback(() => {
    setMenuOpenKey(null);
    setMenuPanel('main');
  }, []);

  const toggleMenu = useCallback(
    (key: string) => {
      setMenuOpenKey(k => (k === key ? null : key));
      setMenuPanel('main');
    },
    []
  );

  const openCreateFolderModal = () => {
    setFolderModalMode('create');
    setFolderModalRenameId(null);
    setModalFolderName('');
    setModalFolderDescription('');
  };

  const openRenameFolderModal = (folder: Folder) => {
    setFolderModalMode('rename');
    setFolderModalRenameId(folder.id);
    setModalFolderName(folder.name);
    setModalFolderDescription(folder.description?.trim() ?? '');
  };

  const closeFolderModal = () => {
    setFolderModalMode(null);
    setFolderModalRenameId(null);
    setModalFolderName('');
    setModalFolderDescription('');
  };

  const handleFolderModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = modalFolderName.trim();
    if (!name) return;
    setModalFolderSaving(true);
    try {
      if (folderModalMode === 'create') {
        const res = await fetch('/api/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description: modalFolderDescription.trim() || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to create folder');
        setFolders(prev => [data as Folder, ...prev]);
        closeFolderModal();
        return;
      }
      if (folderModalMode === 'rename' && folderModalRenameId) {
        const res = await fetch(`/api/folders/${folderModalRenameId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description: modalFolderDescription.trim() || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to update folder');
        const updated = data as Folder;
        setFolders(prev => prev.map(f => (f.id === updated.id ? { ...f, ...updated } : f)));
        closeFolderModal();
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Folder save failed');
    } finally {
      setModalFolderSaving(false);
    }
  };

  const handleDuplicateFolder = async (folderId: string) => {
    try {
      const res = await fetch(`/api/folders/${folderId}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Duplicate failed');
      const newFolder = data.folder as Folder;
      const dupCards = (data.duplicatedCards ?? []) as LibraryCard[];
      const dupEncRaw = data.duplicatedEncounters ?? [];
      const dupEncounters: LibraryEncounter[] = dupEncRaw.map((row: Record<string, unknown>) => ({
        id: String(row.id),
        title: String(row.title ?? ''),
        folder_id: (row.folder_id as string | null) ?? null,
        created_at: String(row.created_at ?? new Date().toISOString()),
        updated_at: String(row.updated_at ?? row.created_at ?? new Date().toISOString()),
        entry_count: typeof row.entry_count === 'number' ? row.entry_count : 0,
        thumbnail_url:
          typeof row.thumbnail_url === 'string' && row.thumbnail_url.trim()
            ? row.thumbnail_url.trim()
            : null,
      }));
      setFolders(prev => [newFolder, ...prev]);
      setCards(prev => [...dupCards, ...prev]);
      setEncounters(prev => [...dupEncounters, ...prev]);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to duplicate folder');
    }
  };

  const handleDeleteFolder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !confirm(
        'Delete this folder? Items keep no folder and stay visible under All items only.'
      )
    )
      return;
    try {
      const res = await fetch(`/api/folders/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete folder');
      }

      setFolders(prev => prev.filter(f => f.id !== id));
      if (scope === id) setScope('all');
      setCards(prev => prev.map(c => (c.folder_id === id ? { ...c, folder_id: null } : c)));
      setEncounters(prev => prev.map(en => (en.folder_id === id ? { ...en, folder_id: null } : en)));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to delete folder');
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Remove this item from your library?')) return;
    try {
      const res = await fetch(`/api/cards/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item');
      setCards(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEncounter = async (id: string) => {
    if (!confirm('Delete this encounter?')) return;
    try {
      const res = await fetch(`/api/encounters/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete encounter');
      setEncounters(prev => prev.filter(e => e.id !== id));
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

  const handleMoveEncounter = useCallback(async (encounterId: string, toFolderId: string | null) => {
    try {
      const res = await fetch(`/api/encounters/${encounterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: toFolderId }),
      });
      if (!res.ok) throw new Error('Failed to move encounter');
      setEncounters(prev =>
        prev.map(e => (e.id === encounterId ? { ...e, folder_id: toFolderId } : e))
      );
    } catch (err) {
      console.error('Error moving encounter', err);
    }
  }, []);

  const onDragStart = useCallback((e: React.DragEvent, entity: 'card' | 'encounter', id: string) => {
    const payload: DndPayload = { entity, id };
    e.dataTransfer.setData(DND_MIME, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingPayload(payload);
  }, []);

  const onDragEnd = useCallback(() => {
    setDraggingPayload(null);
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
      const raw = e.dataTransfer.getData(DND_MIME);
      const payload = parseDndPayload(raw);
      setDragOver(null);
      setDraggingPayload(null);
      if (!payload) return;

      if (payload.entity === 'card') {
        const card = cards.find(c => c.id === payload.id);
        if (!card || card.folder_id === targetFolderId) return;
        void handleMoveCard(payload.id, targetFolderId);
      } else {
        const enc = encounters.find(x => x.id === payload.id);
        if (!enc || enc.folder_id === targetFolderId) return;
        void handleMoveEncounter(payload.id, targetFolderId);
      }
    },
    [cards, encounters, handleMoveCard, handleMoveEncounter]
  );

  const handleDuplicateCard = async (id: string) => {
    try {
      const res = await fetch(`/api/cards/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Duplicate failed');
      setCards(prev => [data as LibraryCard, ...prev]);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to duplicate item');
    }
  };

  const handlePublishCard = async (cardId: string, publish: boolean) => {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: publish }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update');
      setCards(prev =>
        prev.map(c =>
          c.id === cardId
            ? {
                ...c,
                is_published: Boolean(data.is_published),
                published_at: data.published_at ?? null,
                published_author_name:
                  typeof data.published_author_name === 'string'
                    ? data.published_author_name
                    : c.published_author_name ?? null,
              }
            : c
        )
      );
      closeMenu();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to publish');
    }
  };

  const handleDuplicateEncounter = async (id: string) => {
    try {
      const res = await fetch(`/api/encounters/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Duplicate failed');
      const row = data as Record<string, unknown>;
      const enc: LibraryEncounter = {
        id: String(row.id),
        title: String(row.title ?? ''),
        folder_id: (row.folder_id as string | null) ?? null,
        created_at: String(row.created_at ?? new Date().toISOString()),
        updated_at: String(row.updated_at ?? row.created_at ?? new Date().toISOString()),
        entry_count: typeof row.entry_count === 'number' ? row.entry_count : 0,
        thumbnail_url:
          typeof row.thumbnail_url === 'string' && row.thumbnail_url.trim()
            ? row.thumbnail_url.trim()
            : null,
      };
      setEncounters(prev => [enc, ...prev]);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to duplicate encounter');
    }
  };

  const scopeTitle = scope === 'all' ? 'All items' : folderById[scope]?.name ?? 'Folder';
  const scopeFolder = scope !== 'all' ? folderById[scope] : undefined;
  const scopeDescription =
    scopeFolder &&
    scopeFolder.folder_kind == null &&
    typeof scopeFolder.description === 'string' &&
    scopeFolder.description.trim()
      ? scopeFolder.description.trim()
      : null;

  const isDragging = draggingPayload !== null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row lg:gap-0">
      <FolderEditModal
        open={folderModalMode !== null}
        mode={folderModalMode ?? 'create'}
        name={modalFolderName}
        description={modalFolderDescription}
        saving={modalFolderSaving}
        onNameChange={setModalFolderName}
        onDescriptionChange={setModalFolderDescription}
        onSubmit={handleFolderModalSubmit}
        onClose={closeFolderModal}
        titleId="library-folder-modal-title"
      />

      <aside className="flex w-full shrink-0 flex-col gap-4 border-b border-bdr pb-6 lg:w-72 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
        <div className="flex flex-col gap-2">
          <span className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.12em] text-gold-dark">
            Folders
          </span>
          <button
            type="button"
            onClick={openCreateFolderModal}
            className="panel-btn w-full px-3 py-2 text-xs"
          >
            New folder
          </button>
        </div>

        <nav className="flex flex-col gap-1 font-[var(--font-cinzel),serif] text-sm">
          <ScopeRow
            label="All items"
            count={totalItems}
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
          {systemFolders.map(f => (
            <ScopeRow
              key={f.id}
              label={f.name}
              count={countInSystemFolder(f, cards, encounters)}
              active={scope === f.id}
              dropKey={f.id}
              dragOver={dragOver}
              onSelect={() => setScope(f.id)}
              onDragOver={e => onFolderDragOver(e, f.id)}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => onFolderDrop(e, f.id)}
              highlightDrop={isDragging}
            />
          ))}
          {customFolders.map(f => (
            <ScopeRow
              key={f.id}
              label={f.name}
              count={countInFolder(cards, encounters, f.id)}
              active={scope === f.id}
              dropKey={f.id}
              dragOver={dragOver}
              onSelect={() => setScope(f.id)}
              onDragOver={e => onFolderDragOver(e, f.id)}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => onFolderDrop(e, f.id)}
              highlightDrop={isDragging}
              folderMenu={
                f.folder_kind ? undefined : (
                  <FolderKebabMenu
                    open={folderKebabOpenId === f.id}
                    onToggle={() =>
                      setFolderKebabOpenId(id => (id === f.id ? null : f.id))
                    }
                    onClose={() => setFolderKebabOpenId(null)}
                    onRename={() => openRenameFolderModal(f)}
                    onDuplicate={() => void handleDuplicateFolder(f.id)}
                    onDelete={e => void handleDeleteFolder(f.id, e)}
                    menuButtonId={`library-folder-kebab-${f.id}`}
                    menuId={`library-folder-kebab-menu-${f.id}`}
                  />
                )
              }
            />
          ))}
        </nav>

        <p className="text-xs leading-relaxed text-bronze">
          Drag items onto a folder to file them. Use <strong className="text-gold-dark">Move to → No folder</strong>{' '}
          to clear folder; those items appear under All items only.
        </p>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 lg:pl-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-[var(--font-cinzel),serif] text-xl font-semibold tracking-wide text-gold [text-shadow:0_0_12px_rgba(201,168,76,0.15)]">
              {scopeTitle}
            </h2>
            {scopeDescription ? (
              <p className="mt-1 line-clamp-2 text-sm text-bronze/90">{scopeDescription}</p>
            ) : null}
            <p className="mt-1 text-sm text-bronze">
              {filteredSorted.length} of {totalItems} shown
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
              value={itemTypeFilter}
              onChange={e => setItemTypeFilter(e.target.value as ItemTypeFilter)}
              aria-label="Filter by item type"
              className="min-w-[7.5rem] rounded-md border border-bdr bg-mid px-3 py-2 font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark focus:border-gold-dark focus:outline-none"
            >
              <option value="all">All types</option>
              <option value="card">Cards</option>
              <option value="statblock">Stat blocks</option>
              <option value="encounter">Encounters</option>
            </select>
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
              Save from Card Forge, Stat Blocks, or Encounters, or change folder, type filter, sort, or search.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/create"
                className="panel-btn border-gold/30 bg-gold/10 text-gold hover:bg-gold/20"
              >
                Create
              </Link>
              <Link
                href="/encounters"
                className="panel-btn border-bdr bg-transparent text-gold-dark hover:bg-input hover:text-gold"
              >
                Encounters
              </Link>
            </div>
          </div>
        ) : (
          <ul className={ITEM_CARD_GRID_CLASS}>
            {filteredSorted.map(it => {
              if (it.type === 'card') {
                const c = it.card;
                const cardThumb = libraryCardThumbUrl(c);
                const dragActive =
                  draggingPayload?.entity === 'card' && draggingPayload.id === c.id;
                const menuKey = `card:${c.id}`;
                const cardMenuOpen = menuOpenKey === menuKey;
                return (
                  <li
                    key={`card-${c.id}`}
                    draggable
                    onDragStart={e => onDragStart(e, 'card', c.id)}
                    onDragEnd={onDragEnd}
                    className="list-none flex h-full min-h-0 flex-col"
                  >
                    <div
                      className={`group relative flex h-full min-h-0 flex-col overflow-visible rounded-xl border bg-gradient-to-b from-panel to-mid/95 shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-200 ${
                        cardMenuOpen ? 'z-[80]' : 'z-0'
                      } ${
                        dragActive
                          ? 'scale-[0.98] border-gold/50 opacity-90'
                          : 'border-bdr hover:border-gold/35 hover:shadow-[0_12px_40px_rgba(201,168,76,0.08)]'
                      }`}
                    >
                      <div
                        role="link"
                        tabIndex={0}
                        aria-label={`Open ${cardSubtitle(c)}`}
                        className="flex min-h-0 flex-1 cursor-pointer flex-col outline-none transition-colors hover:text-inherit focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
                        onClick={e => {
                          if (e.defaultPrevented) return;
                          const href = openHrefCard(c);
                          if (e.metaKey || e.ctrlKey) {
                            window.open(href, '_blank', 'noopener,noreferrer');
                            return;
                          }
                          router.push(href);
                        }}
                        onAuxClick={e => {
                          if (e.button === 1) {
                            e.preventDefault();
                            window.open(openHrefCard(c), '_blank', 'noopener,noreferrer');
                          }
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            router.push(openHrefCard(c));
                          }
                        }}
                      >
                        <LibraryItemThumbnail imageUrl={cardThumb} label={cardSubtitle(c)} />
                        <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-3 p-5 pt-4 sm:p-6 sm:pt-5">
                          <div className="flex min-w-0 flex-col gap-2">
                            <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
                              <div className="min-w-0 flex-1">
                                <h3 className="truncate font-[var(--font-cinzel),serif] text-base font-semibold leading-tight text-gold">
                                  {cardSubtitle(c)}
                                </h3>
                                <p className="mt-0.5 truncate text-xs text-bronze">{c.title}</p>
                              </div>
                              <LibraryCardOverflowMenu
                                card={c}
                                folders={folders}
                                open={cardMenuOpen}
                                panel={cardMenuOpen ? menuPanel : 'main'}
                                onPanelChange={setMenuPanel}
                                onToggle={() => toggleMenu(menuKey)}
                                onClose={closeMenu}
                                onMove={toId => void handleMoveCard(c.id, toId)}
                                onDuplicate={() => void handleDuplicateCard(c.id)}
                                onDelete={() => void handleDeleteCard(c.id)}
                                onPublishToggle={pub => void handlePublishCard(c.id, pub)}
                                menuButtonId={`library-card-menu-btn-${c.id}`}
                                menuId={`library-card-menu-${c.id}`}
                              />
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`w-fit shrink-0 rounded-full border px-2 py-0.5 font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider ${
                                  c.item_type === 'card'
                                    ? 'border-amber-700/50 bg-amber-950/40 text-amber-200'
                                    : 'border-violet-800/50 bg-violet-950/40 text-violet-200'
                                }`}
                              >
                                {c.item_type === 'card' ? 'Card' : 'Block'}
                              </span>
                              {c.is_published ? (
                                <span className="w-fit shrink-0 rounded-full border border-emerald-800/50 bg-emerald-950/40 px-2 py-0.5 font-[var(--font-cinzel),serif] text-[0.65rem] uppercase tracking-wider text-emerald-200">
                                  Public
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                            <span>
                              {c.folder_id ? (
                                <>
                                  In{' '}
                                  <strong className="text-gold/90">
                                    {folderById[c.folder_id]?.name ?? '…'}
                                  </strong>
                                </>
                              ) : (
                                <span className="italic">No folder</span>
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
                        </div>
                      </div>
                    </div>
                  </li>
                );
              }

              const enc = it.encounter;
              const dragActive =
                draggingPayload?.entity === 'encounter' && draggingPayload.id === enc.id;
              const menuKey = `encounter:${enc.id}`;
              const encMenuOpen = menuOpenKey === menuKey;
              return (
                <li
                  key={`encounter-${enc.id}`}
                  draggable
                  onDragStart={e => onDragStart(e, 'encounter', enc.id)}
                  onDragEnd={onDragEnd}
                  className="list-none flex h-full min-h-0 flex-col"
                >
                  <div
                    className={`group relative flex h-full min-h-0 flex-col overflow-visible rounded-xl border bg-gradient-to-b from-panel to-mid/95 shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-200 ${
                      encMenuOpen ? 'z-[80]' : 'z-0'
                    } ${
                      dragActive
                        ? 'scale-[0.98] border-gold/50 opacity-90'
                        : 'border-bdr hover:border-gold/35 hover:shadow-[0_12px_40px_rgba(201,168,76,0.08)]'
                    }`}
                    >
                    <div
                      role="link"
                      tabIndex={0}
                      aria-label={`Open encounter ${enc.title}`}
                      className="flex min-h-0 flex-1 cursor-pointer flex-col outline-none transition-colors hover:text-inherit focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
                      onClick={e => {
                        if (e.defaultPrevented) return;
                        const href = `/encounters/${enc.id}${FROM_LIBRARY_QS}`;
                        if (e.metaKey || e.ctrlKey) {
                          window.open(href, '_blank', 'noopener,noreferrer');
                          return;
                        }
                        router.push(href);
                      }}
                      onAuxClick={e => {
                        if (e.button === 1) {
                          e.preventDefault();
                          window.open(
                            `/encounters/${enc.id}${FROM_LIBRARY_QS}`,
                            '_blank',
                            'noopener,noreferrer'
                          );
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(`/encounters/${enc.id}${FROM_LIBRARY_QS}`);
                        }
                      }}
                    >
                      <LibraryItemThumbnail imageUrl={enc.thumbnail_url} label={enc.title} />
                      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-3 p-5 pt-4 sm:p-6 sm:pt-5">
                        <div className="flex min-w-0 flex-col gap-2">
                          <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate font-[var(--font-cinzel),serif] text-base font-semibold leading-tight text-gold">
                                {enc.title}
                              </h3>
                              <p className="mt-0.5 text-xs text-bronze">
                                {enc.entry_count === 1 ? '1 entry' : `${enc.entry_count} entries`}
                              </p>
                            </div>
                            <LibraryEncounterOverflowMenu
                              encounter={enc}
                              folders={folders}
                              open={encMenuOpen}
                              panel={encMenuOpen ? menuPanel : 'main'}
                              onPanelChange={setMenuPanel}
                              onToggle={() => toggleMenu(menuKey)}
                              onClose={closeMenu}
                              onMove={toId => void handleMoveEncounter(enc.id, toId)}
                              onDuplicate={() => void handleDuplicateEncounter(enc.id)}
                              onDelete={() => void handleDeleteEncounter(enc.id)}
                              menuButtonId={`library-enc-menu-btn-${enc.id}`}
                              menuId={`library-enc-menu-${enc.id}`}
                            />
                          </div>
                          <span className="w-fit shrink-0 rounded-full border border-emerald-800/50 bg-emerald-950/40 px-2 py-0.5 font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-emerald-200">
                            Encounter
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                          <span>
                            {enc.folder_id ? (
                              <>
                                In{' '}
                                <strong className="text-gold/90">
                                  {folderById[enc.folder_id]?.name ?? '…'}
                                </strong>
                              </>
                            ) : (
                              <span className="italic">No folder</span>
                            )}
                          </span>
                          <span className="text-muted/60">·</span>
                          <time dateTime={enc.created_at}>
                            {new Date(enc.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function ScopeRow({
  label,
  count,
  active,
  onSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  dragOver,
  dropKey,
  highlightDrop,
  folderMenu,
}: {
  label: string;
  count: number;
  active: boolean;
  onSelect: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  dragOver: string | null;
  dropKey: string;
  highlightDrop?: boolean;
  folderMenu?: ReactNode;
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
        <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
        <span className="shrink-0 rounded-md bg-bg/50 px-1.5 py-0.5 text-xs tabular-nums text-gold/80">
          {count}
        </span>
      </button>
      {folderMenu ? <div className="shrink-0">{folderMenu}</div> : null}
    </div>
  );
}
