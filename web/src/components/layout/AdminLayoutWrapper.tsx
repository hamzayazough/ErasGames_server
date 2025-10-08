'use client';

import { usePathname } from 'next/navigation';
import { AdminHeader } from '@/components/ui/AdminHeader';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <>
      {!isLoginPage && <AdminHeader />}
      <main className={isLoginPage ? '' : 'min-h-screen bg-gray-50'}>
        {children}
      </main>
    </>
  );
}