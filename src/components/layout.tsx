import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  user?: {
    id: number;
    email: string;
    username?: string | null;
    is_admin?: boolean;
  } | null;
}

export function Layout({ children, user }: LayoutProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', requiresAuth: true },
    { name: 'Profile', href: '/profile', requiresAuth: true },
  ];

  const authLinks = [
    { name: 'Sign In', href: '/login', requiresAuth: false },
    { name: 'Sign Up', href: '/register', requiresAuth: false },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="font-bold text-xl text-blue-600">
                  ADCDN
                </Link>
              </div>
              <nav className="ml-6 flex space-x-8">
                {navigation.map((item) => {
                  if (item.requiresAuth && !user) return null;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        pathname === item.href
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {user.username || user.email}
                  </span>
                  <Link
                    href="/api/auth/logout"
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Sign Out
                  </Link>
                </div>
              ) : (
                <div className="flex space-x-4">
                  {authLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md ${
                        pathname === item.href
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ADCDN - Simple and secure content sharing
          </div>
        </div>
      </footer>
    </div>
  );
}