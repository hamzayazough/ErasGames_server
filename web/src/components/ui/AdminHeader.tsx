'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth.context';
import { Button } from './Button';

interface AdminHeaderProps {
  className?: string;
}

export function AdminHeader({ className = '' }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Don't show header on login page
  if (pathname === '/login') {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊'
    },
    {
      name: 'Questions',
      href: '/questions',
      icon: '❓'
    },
    {
      name: 'Daily Quiz',
      href: '/daily-quiz',
      icon: '📅'
    },
    {
      name: 'Seasons',
      href: '/seasons',
      icon: '🏆'
    }
  ];

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <span className="text-2xl">🎮</span>
              <span>ErasGames Admin</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navigationItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-medium text-gray-900">{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}