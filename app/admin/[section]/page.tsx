export const dynamicParams = false;
export function generateStaticParams() {
  return ['overview', 'banners', 'products', 'categories', 'orders', 'setup'].map(section => ({ section }));
}
export default function AdminSectionPage() { return null; }
