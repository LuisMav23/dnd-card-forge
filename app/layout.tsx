import type { Metadata } from 'next';
import { Cinzel, Crimson_Text } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

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
  title: 'Card Forge',
  description: 'Spells · Armor · Weapons · Items · Sidekicks · Anything — Export PNG',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cinzel.variable} ${crimsonText.variable}`}>
      <body className="min-h-screen overflow-x-hidden bg-bg text-parch font-[var(--font-crimson),Georgia,serif] flex flex-col transition-colors duration-200">
        <Script
          id="card-forge-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='card-forge-theme';var t=localStorage.getItem(k);var d=document.documentElement;if(t==='light')d.classList.remove('dark');else if(t==='dark')d.classList.add('dark');else if(t==='system'){if(window.matchMedia('(prefers-color-scheme: dark)').matches)d.classList.add('dark');else d.classList.remove('dark');}else d.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
