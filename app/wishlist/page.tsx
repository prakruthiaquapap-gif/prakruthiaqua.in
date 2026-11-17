import { WishlistContents } from '@/components/wishlist';
import PageBanner from '@/components/page-banner';

export const metadata = { title: 'Your wishlist', description: 'Your saved Prakruthi Aqua products.' };

export default function WishlistPage() {
  return (
    <main id="main">
      <PageBanner
        compact
        label="Wishlist"
        eyebrow="Your favourites"
        title="Your"
        accent="wishlist."
        description="Products you’ve saved on this browser — ready when you are."
        secondaryLabel="Keep exploring"
        secondaryHref="/shop/"
      />
      <section className="section">
        <div className="container">
          <WishlistContents />
        </div>
      </section>
    </main>
  );
}
