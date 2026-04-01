import { ICON_REGISTRY, resolveIconId } from '@/lib/iconRegistry';

interface IconDisplayProps {
  iconId: string;
  className?: string;
}

/**
 * Renders a registered SVG icon by ID. Falls back to raw text for
 * unregistered values (legacy emoji from saved data).
 */
export default function IconDisplay({ iconId, className }: IconDisplayProps) {
  const resolved = resolveIconId(iconId);
  const Icon = ICON_REGISTRY[resolved];

  if (!Icon) {
    return <span className={className}>{iconId}</span>;
  }

  return <Icon className={className} />;
}
