import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import ProductDetail from '@/components/product-detail';
import { ProductCard } from '@/components/site';
import { products } from '@/lib/catalog';

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: products.find((p) => p.slug === slug)?.name || 'Product' };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = products.find((item) => item.slug === slug);
  if (!p) notFound();
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 4);

  return (
    <main id="main">
      <div className="container">
        <nav className="crumbs crumbs-dark" aria-label="Breadcrumb">
          <Link href="/shop/"><ArrowLeft size={14} /> Shop</Link><span>/</span>
          <Link href={`/shop/?category=${encodeURIComponent(p.category)}`}>{p.category}</Link>
        </nav>
        <ProductDetail product={p} />
      </div>
      {related.length > 0 && (
        <section className="section section-paper">
          <div className="container">
            <div className="section-head">
              <div><p className="eyebrow"><span className="dot" />You may also like</p><h2>More {p.category.toLowerCase()}</h2></div>
              <Link className="link-arrow" href={`/shop/?category=${encodeURIComponent(p.category)}`}>View category <ArrowUpRight size={16} /></Link>
            </div>
            <div className="product-grid">{related.map((x) => <ProductCard key={x.slug} product={x} />)}</div>
          </div>
        </section>
      )}
    </main>
  );
}
