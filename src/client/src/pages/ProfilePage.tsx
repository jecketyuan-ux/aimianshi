import React from 'react';

const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">个人资料</h1>
        <p className="text-secondary-600">
          这里是个人资料功能的详细实现区域，包括：
        </p>
        <ul className="mt-4 list-disc list-inside text-secondary-600 space-y-2">
          <li>个人信息编辑</li>
          <li>面试统计数据</li>
          <li>学习进度跟踪</li>
          <li>成就和徽章</li>
          <li>设置和偏好</li>
        </ul>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800">开发中</h3>
        <p className="mt-1 text-sm text-yellow-700">
          个人资料功能正在开发中，敬请期待！
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;