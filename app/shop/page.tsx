import { Suspense } from 'react';
import Shop from '@/components/shop';
import PageBanner from '@/components/page-banner';

export const metadata = {
  title: 'Shop All Products',
  description: 'Explore the full Prakruthi Aqua catalog of fish foods, aquatic fertilizers, conditioners, medicines and bird food.',
};

export default function ShopPage() {
  return (
    <main id="main">
      <PageBanner
        label="Shop"
        eyebrow="The Prakruthi collection"
        title="Thoughtful essentials."
        accent="Thriving little worlds."
        description="Fish nutrition, aquatic plant care, water care and bird food — everything that helps your aquarium thrive."
        image="/images/plants.jpg"
        imageAlt="A lush underwater garden of aquatic plants"
        disc={{ image: '/images/macro-nutrients-CEJJs9.webp', alt: 'Prakruthi Aqua Macro Nutrients', name: 'Macro Nutrients', price: 'Bestseller · Plant care', label: 'Customer favourite', href: '/product/?id=macro-nutrients-CEJJs9' }}
        primaryLabel="Browse products"
        primaryHref="#catalog"
        secondaryLabel="Need help choosing?"
        secondaryHref="/contact/"
        stats={[['5', 'Categories'], ['Pan-India', 'Delivery'], ['100%', 'Confirmed personally']]}
      />
      <div id="catalog" className="anchor">
        <Suspense fallback={<div className="loading">Loading products…</div>}>
          <Shop />
        </Suspense>
      </div>
    </main>
  );
}
