import { Suspense } from 'react';
import DynamicProduct from '@/components/dynamic-product';
export const metadata={title:'Product details'};
export default function Page(){return <Suspense fallback={<div className="admin-loading">Loading product…</div>}><DynamicProduct/></Suspense>}
