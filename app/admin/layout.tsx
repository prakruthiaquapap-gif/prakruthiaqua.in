import AdminPanel from '@/components/admin-panel';
export const metadata = { title: 'Admin workspace', robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <><AdminPanel />{children}</>;
}
