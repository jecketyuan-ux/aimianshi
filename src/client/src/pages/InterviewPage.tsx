import React from 'react';

const InterviewPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">面试中心</h1>
        <p className="text-secondary-600">
          这里是面试功能的详细实现区域，包括：
        </p>
        <ul className="mt-4 list-disc list-inside text-secondary-600 space-y-2">
          <li>AI面试官对话界面</li>
          <li>代码编辑器和执行环境</li>
          <li>语音识别和合成</li>
          <li>实时反馈和评分</li>
          <li>面试记录和回放</li>
        </ul>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800">开发中</h3>
        <p className="mt-1 text-sm text-yellow-700">
          面试功能正在开发中，敬请期待！
        </p>
      </div>
    </div>
  );
};

export default InterviewPage;