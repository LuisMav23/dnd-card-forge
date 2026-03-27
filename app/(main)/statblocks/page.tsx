import ForgeItemsHub from '@/components/forge/ForgeItemsHub';

export default function StatBlocksHubPage() {
  return (
    <ForgeItemsHub
      itemTypeFilter="statblock"
      eyebrow="Create"
      heading="Stat blocks"
      description="Build Daggerheart stat blocks for adversaries, NPCs, and environments. Save to your library and export PNGs."
      routePrefix="statblocks"
      newButtonLabel="New stat block"
    />
  );
}
