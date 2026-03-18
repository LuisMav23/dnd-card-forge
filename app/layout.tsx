import type { Metadata } from 'next';
import { Cinzel, Crimson_Text } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});

const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-crimson',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'D&D Card Forge',
  description: 'Spells · Armor · Weapons · Items · Sidekicks · Anything — Export PNG',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${crimsonText.variable}`}>
      <body className="min-h-screen lg:h-screen lg:overflow-hidden overflow-x-hidden bg-bg text-parch font-[var(--font-crimson),Georgia,serif] flex flex-col">
        {children}
      </body>
    </html>
  );
}
