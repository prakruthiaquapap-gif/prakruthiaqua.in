import { WishlistContents } from '@/components/wishlist';

export const metadata = { title: 'Your wishlist', description: 'Your saved Prakruthi Aqua products.' };

export default function WishlistPage() {
  return (
    <main id="main" className="section">
      <div className="container">
        <div className="page-head">
          <p className="eyebrow"><span className="dot" />Your favourites</p>
          <h1>Your <em>wishlist.</em></h1>
        </div>
        <WishlistContents />
      </div>
    </main>
  );
}
