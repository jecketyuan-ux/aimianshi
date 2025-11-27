import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store';
import { cn } from '@/utils';

const Layout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: '仪表板', href: '/dashboard', icon: HomeIcon },
    { name: '面试', href: '/interview', icon: ClipboardDocumentListIcon },
    { name: '题库', href: '/questions', icon: QuestionMarkCircleIcon },
    { name: '个人资料', href: '/profile', icon: UserIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:static lg:inset-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-secondary-200">
            <h1 className="text-xl font-bold text-primary-600">AI面试助手</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-secondary-200">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">
                  {user?.profile.firstName?.charAt(0)}{user?.profile.lastName?.charAt(0)}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900">
                  {user?.profile.firstName} {user?.profile.lastName}
                </p>
                <p className="text-xs text-secondary-500">{user?.email}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-secondary-600 rounded-lg hover:bg-secondary-50 hover:text-secondary-900">
                <Cog6ToothIcon className="w-4 h-4 mr-3" />
                设置
              </button>
              <button 
                onClick={logout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-secondary-600 rounded-lg hover:bg-secondary-50 hover:text-secondary-900"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-secondary-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-lg font-semibold text-secondary-900">
                  {navigation.find(item => isActive(item.href))?.name || 'AI面试助手'}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="p-2 text-secondary-400 hover:text-secondary-500">
                  <BellIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;