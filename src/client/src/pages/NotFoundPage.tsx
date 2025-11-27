import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-secondary-300">404</h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            页面未找到
          </h2>
          <p className="text-secondary-600">
            抱歉，您访问的页面不存在或已被移动。
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            返回首页
          </Link>
          
          <div className="text-sm text-secondary-500">
            或者{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-500">
              登录您的账户
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;