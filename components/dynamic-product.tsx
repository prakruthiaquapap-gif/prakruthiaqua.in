'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useStorefront } from './storefront-data';
import ProductDetail from './product-detail';
import { ProductCard } from './site';

export default function DynamicProduct() {
  const params = useSearchParams();
  const { products, loading } = useStorefront();
  const product = products.find((p) => p.slug === params.get('id'));
  if (loading) return <div className="loading">Loading product…</div>;
  if (!product) return <main id="main" className="container"><div className="empty-state"><h1>Product not available</h1><Link className="btn btn-dark" href="/shop/">Back to shop</Link></div></main>;
  const related = products.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 4);
  return (
    <main id="main">
      <div className="container">
        <nav className="crumbs crumbs-dark" aria-label="Breadcrumb">
          <Link href="/shop/"><ArrowLeft size={14} /> Shop</Link><span>/</span>
          <Link href={`/shop/?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
        </nav>
        <ProductDetail key={product.slug} product={product} />
      </div>
      {related.length > 0 && (
        <section className="section section-paper">
          <div className="container">
            <div className="section-head">
              <div><p className="eyebrow"><span className="dot" />You may also like</p><h2>More {product.category.toLowerCase()}</h2></div>
              <Link className="link-arrow" href={`/shop/?category=${encodeURIComponent(product.category)}`}>View category <ArrowUpRight size={16} /></Link>
            </div>
            <div className="product-grid">{related.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
          </div>
        </section>
      )}
    </main>
  );
}
