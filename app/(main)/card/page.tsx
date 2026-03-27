import ForgeItemsHub from '@/components/forge/ForgeItemsHub';

export default function CardHubPage() {
  return (
    <ForgeItemsHub
      itemTypeFilter="card"
      eyebrow="Create"
      heading="Card Forge"
      description="Design spells, gear, sidekicks, and more. Save to your library and export print-ready PNGs."
      routePrefix="card"
      newButtonLabel="New card"
    />
  );
}
