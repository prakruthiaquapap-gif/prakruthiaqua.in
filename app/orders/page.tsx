import MyOrders from '@/components/my-orders';
import PageBanner from '@/components/page-banner';

export const metadata = { title: 'My orders', description: 'Track your Prakruthi Aqua orders, payments and invoices.', robots: { index: false } };

export default function OrdersPage() {
  return (
    <main id="main">
      <PageBanner
        compact
        label="My orders"
        eyebrow="Your account"
        title="My"
        accent="orders."
        description="Track every order, check payments and download your invoices."
        secondaryLabel="Continue shopping"
        secondaryHref="/shop/"
      />
      <section className="section">
        <div className="container">
          <MyOrders />
        </div>
      </section>
    </main>
  );
}
