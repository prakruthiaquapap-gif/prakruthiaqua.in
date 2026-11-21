import { Suspense } from 'react';
import Shop from '@/components/shop';
import PageBanner from '@/components/page-banner';

export const metadata = {
  title: 'Shop All Products',
  description: 'Explore the full Prakruthi Aqua catalog of fish foods, aquatic fertilizers, conditioners, medicines and bird food.',
};

export default function ShopPage() {
  return (
    <main id="main" className="shop-page">
      <PageBanner
        compact
        backdropImage="/images/shop-aquarium.jpg"
        label="Shop all"
        eyebrow="The Prakruthi collection"
        title="Thoughtful essentials."
        accent="Thriving little worlds."
        description="Fish nutrition, aquatic plant care, water care and bird food — everything that helps your aquarium thrive."
        primaryLabel="Browse products"
        primaryHref="#catalog"
        secondaryLabel="Need help choosing?"
        secondaryHref="/contact/"
      />
      <div id="catalog" className="anchor">
        <Suspense fallback={<div className="loading">Loading products…</div>}>
          <Shop />
        </Suspense>
      </div>
    </main>
  );
}
