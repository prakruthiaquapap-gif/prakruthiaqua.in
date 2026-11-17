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
        image="/images/shop-aquarium.jpg"
        imageAlt="A lush planted aquarium with neon tetras and an angelfish under rays of light"
        disc={{ image: '/images/aquarium.jpg', alt: 'Colourful fish swimming in a bright aquarium', name: 'Fish · Plants · Water', price: 'Everything your tank needs', label: 'The full collection', href: '#catalog', photo: true }}
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
