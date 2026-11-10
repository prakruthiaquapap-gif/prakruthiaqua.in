import { Suspense } from 'react';
import Checkout from '@/components/checkout';
export const metadata={title:'Order checkout'};
export default function Page(){return <Suspense fallback={<div className="admin-loading">Loading checkout…</div>}><Checkout/></Suspense>}
