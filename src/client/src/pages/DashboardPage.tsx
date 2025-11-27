import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon, 
  ClockIcon, 
  TrophyIcon,
  PlayIcon,
  BookOpenIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store';
import { useInterviewStore } from '@/store';
import { formatDuration, formatRelativeTime, getScoreColor } from '@/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { interviews, fetchInterviews, isLoading } = useInterviewStore();

  useEffect(() => {
    fetchInterviews({ limit: 5 });
  }, [fetchInterviews]);

  const recentInterviews = interviews.slice(0, 3);
  const completedInterviews = interviews.filter(i => i.status === 'completed');
  
  const stats = {
    totalInterviews: interviews.length,
    completedInterviews: completedInterviews.length,
    averageScore: completedInterviews.length > 0 
      ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / completedInterviews.length)
      : 0,
    totalDuration: interviews.reduce((sum, i) => sum + i.duration, 0),
  };

  const quickActions = [
    {
      title: '开始新面试',
      description: '立即开始一次AI模拟面试',
      icon: PlayIcon,
      action: () => navigate('/interview'),
      color: 'bg-primary-500',
    },
    {
      title: '浏览题库',
      description: '查看和练习面试题目',
      icon: BookOpenIcon,
      action: () => navigate('/questions'),
      color: 'bg-secondary-500',
    },
    {
      title: '查看统计',
      description: '分析您的面试表现',
      icon: ChartBarIcon,
      action: () => navigate('/profile'),
      color: 'bg-success-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          欢迎回来，{user?.profile.firstName}！
        </h1>
        <p className="text-primary-100">
          准备好今天的面试练习了吗？让我们开始吧！
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3">
              <UserGroupIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">总面试次数</p>
              <p className="text-2xl font-semibold text-secondary-900">{stats.totalInterviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-success-100 rounded-lg p-3">
              <TrophyIcon className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">已完成面试</p>
              <p className="text-2xl font-semibold text-secondary-900">{stats.completedInterviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-warning-100 rounded-lg p-3">
              <ChartBarIcon className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">平均分数</p>
              <p className={`text-2xl font-semibold ${getScoreColor(stats.averageScore)}`}>
                {stats.averageScore}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-secondary-100 rounded-lg p-3">
              <ClockIcon className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">总练习时长</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {formatDuration(stats.totalDuration)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left group"
            >
              <div className="flex items-center mb-4">
                <div className={`${action.color} rounded-lg p-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-secondary-600">
                {action.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Recent Interviews */}
      {recentInterviews.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-secondary-200">
            <h2 className="text-lg font-semibold text-secondary-900">最近的面试</h2>
          </div>
          <div className="divide-y divide-secondary-200">
            {recentInterviews.map((interview) => (
              <div key={interview.id} className="px-6 py-4 hover:bg-secondary-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-secondary-900">
                        {interview.type === 'technical' ? '技术面试' :
                         interview.type === 'behavioral' ? '行为面试' :
                         interview.type === 'coding' ? '编程面试' :
                         interview.type === 'system-design' ? '系统设计' : '面试'}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        interview.status === 'completed' ? 'bg-success-100 text-success-800' :
                        interview.status === 'in-progress' ? 'bg-warning-100 text-warning-800' :
                        interview.status === 'scheduled' ? 'bg-primary-100 text-primary-800' :
                        'bg-secondary-100 text-secondary-800'
                      }`}>
                        {interview.status === 'completed' ? '已完成' :
                         interview.status === 'in-progress' ? '进行中' :
                         interview.status === 'scheduled' ? '已安排' :
                         interview.status === 'cancelled' ? '已取消' : '已暂停'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-secondary-500">
                      <span>时长: {formatDuration(interview.duration)}</span>
                      <span>难度: {interview.difficulty === 'easy' ? '简单' :
                                   interview.difficulty === 'medium' ? '中等' : '困难'}</span>
                      {interview.score && (
                        <span className={`font-medium ${getScoreColor(interview.score)}`}>
                          分数: {interview.score}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-secondary-500">
                    {formatRelativeTime(interview.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-secondary-50 text-center">
            <button
              onClick={() => navigate('/interview')}
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              查看所有面试 →
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {recentInterviews.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="mx-auto h-12 w-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
            <PlayIcon className="h-6 w-6 text-secondary-600" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">开始您的第一次面试</h3>
          <p className="text-sm text-secondary-600 mb-6">
            还没有进行过面试？点击下方按钮开始您的第一次AI模拟面试。
          </p>
          <button
            onClick={() => navigate('/interview')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            开始面试
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;