'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from './site';
import { useStorefront } from './storefront-data';

export default function Shop() {
  const { products, categories } = useStorefront();
  const params = useSearchParams();
  const [range, setRange] = useState('');
  const [category, setCategory] = useState('All products');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    const update = () => {
      const c = params.get('category');
      setRange(['freeze-dried-foods', 'pellets-food'].includes(params.get('range') || '') ? params.get('range') || '' : '');
      setCategory(c && categories.includes(c) ? c : 'All products');
    };
    update();
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, [params, categories]);

  const select = (c: string) => {
    setCategory(c);
    setRange('');
    history.replaceState(null, '', c === 'All products' ? '/shop/' : `/shop/?category=${encodeURIComponent(c)}`);
  };

  let shown = products.filter((p) =>
    (category === 'All products' || p.category === category) &&
    (!range || (range === 'freeze-dried-foods' ? /worms|shrimp/i.test(p.name) : /pellet|bits|parrot|gold/i.test(p.name))) &&
    `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()));

  shown = [...shown].sort((a, b) =>
    sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : sort === 'name' ? a.name.localeCompare(b.name) : 0);

  return (
    <div className="container shop">
      <div className="shop-tabs" role="group" aria-label="Filter by category">
        {categories.map((c) => (
          <button key={c} aria-pressed={c === category} onClick={() => select(c)} className="pill">{c}</button>
        ))}
      </div>

      {range && (
        <div className="active-range">
          <span>Showing: <b>{range === 'freeze-dried-foods' ? 'Freeze-Live Dried Foods' : 'Pellets Food'}</b></span>
          <button onClick={() => select(category)}>View all fish foods <X size={13} /></button>
        </div>
      )}

      <div className="shop-toolbar">
        <label className="field-icon">
          <Search size={17} />
          <input type="search" placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" />
        </label>
        <div className="shop-toolbar-right">
          <span className="muted"><b>{shown.length}</b> {shown.length === 1 ? 'product' : 'products'}</span>
          <label className="select-wrap">
            <SlidersHorizontal size={15} />
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </label>
        </div>
      </div>

      {shown.length > 0 ? (
        <div className="product-grid">{shown.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon"><Search size={26} /></span>
          <h2>No products found</h2>
          <p>Try a different search or reset the category filter.</p>
          <button onClick={() => { setQuery(''); select('All products'); }} className="btn btn-outline">Reset filters <X size={15} /></button>
        </div>
      )}

      <p className="shop-note">Prices are a catalog snapshot. Our team confirms current stock, sizes and shipping before payment.</p>
    </div>
  );
}
