import { getSiteUrlString } from '@/lib/siteUrl';

const APP_NAME = 'Card Forge';

export default function LandingJsonLd() {
  const base = getSiteUrlString();
  const url = `${base}/`;

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: base,
        name: APP_NAME,
        description:
          'Free online item card maker and stat block builder for fantasy tabletop RPGs. Export PNGs, publish to Explore, and share with the community.',
        publisher: { '@id': `${base}/#app` },
      },
      {
        '@type': 'WebApplication',
        '@id': `${base}/#app`,
        name: APP_NAME,
        url,
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Modern evergreen browser.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Item card templates: spells, armor, weapons, equipment, sidekicks',
          'Stat block builder for NPCs, monsters, and environments',
          'PNG export for handouts and virtual tabletops',
          'Publish and browse community creations on Explore',
          'Comments, votes, favorites, and creator follows',
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
