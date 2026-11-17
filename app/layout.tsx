import { BrandLoader } from '@/components/brand-loader';
import { AuthPopupProvider } from '@/components/auth-popup';
import { StorefrontProvider } from '@/components/storefront-data';
import { WishlistProvider } from '@/components/wishlist';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import './admin.css';
import './home.css';
import './heroes.css';
import { SiteProvider } from '@/components/site';

export const metadata: Metadata = {
  title: {
    default: 'Prakruthi Aqua — A little care. A world of life.',
    template: '%s | Prakruthi Aqua',
  },
  description: 'Thoughtful fish nutrition, aquatic plant care, water care and bird food. Explore Prakruthi Aqua, your aquarium care partners in Bengaluru.',
  icons: { icon: '/images/prakruthi-icon.svg' },
};

export const viewport: Viewport = { themeColor: '#0a0a0a' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <BrandLoader />
        <a className="skip-link" href="#main">Skip to content</a>
        <StorefrontProvider><WishlistProvider><AuthPopupProvider><SiteProvider>{children}</SiteProvider></AuthPopupProvider></WishlistProvider></StorefrontProvider>
      </body>
    </html>
  );
}
