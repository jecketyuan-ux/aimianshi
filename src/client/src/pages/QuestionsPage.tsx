import React from 'react';

const QuestionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">题库</h1>
        <p className="text-secondary-600">
          这里是题库功能的详细实现区域，包括：
        </p>
        <ul className="mt-4 list-disc list-inside text-secondary-600 space-y-2">
          <li>题目浏览和搜索</li>
          <li>难度分类和筛选</li>
          <li>在线编程练习</li>
          <li>题目收藏和笔记</li>
          <li>解题思路和讨论</li>
        </ul>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800">开发中</h3>
        <p className="mt-1 text-sm text-yellow-700">
          题库功能正在开发中，敬请期待！
        </p>
      </div>
    </div>
  );
};

export default QuestionsPage;