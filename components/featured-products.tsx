'use client';
import { useStorefront } from './storefront-data';
import { ProductCard } from './site';

export default function FeaturedProducts() {
  const { products } = useStorefront();
  const featured = products.filter((p) => p.featured);
  const shown = (featured.length ? featured : products).slice(0, 4);
  return <div className="product-grid">{shown.map((p) => <ProductCard product={p} key={p.slug} />)}</div>;
}
