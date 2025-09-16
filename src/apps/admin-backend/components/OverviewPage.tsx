import React from 'react';
import { Users, FileText, Activity, DollarSign, TrendingUp, MessageSquare, Eye, Clock } from 'lucide-react';
import { StatsCard } from '../widgets/StatsCard';
import { Card } from '@shared/components/ui/Card';

// 模拟数据
const mockStats = {
  totalUsers: 1247,
  totalPosts: 89,
  dailyActive: 156,
  monthlyRevenue: 12450,
  userGrowth: 12.5,
  postGrowth: 8.2,
  activeGrowth: 15.3,
  revenueGrowth: -2.1
};

const mockRecentUsers = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', joinTime: '2024-01-15 10:30', membershipTier: 'premium' },
  { id: '2', name: '李四', email: 'lisi@example.com', joinTime: '2024-01-15 09:15', membershipTier: 'basic' },
  { id: '3', name: '王五', email: 'wangwu@example.com', joinTime: '2024-01-14 16:45', membershipTier: 'vip' },
  { id: '4', name: '赵六', email: 'zhaoliu@example.com', joinTime: '2024-01-14 14:20', membershipTier: 'basic' },
  { id: '5', name: '孙七', email: 'sunqi@example.com', joinTime: '2024-01-14 11:10', membershipTier: 'premium' }
];

const mockHotPosts = [
  { id: '1', title: 'React 18 新特性详解', author: '技术达人', views: 2456, comments: 23, publishTime: '2024-01-14' },
  { id: '2', title: 'TypeScript 类型体操实战', author: 'TS专家', views: 1892, comments: 18, publishTime: '2024-01-13' },
  { id: '3', title: '前端性能优化最佳实践', author: '性能专家', views: 1634, comments: 15, publishTime: '2024-01-12' },
  { id: '4', title: 'Node.js 微服务架构设计', author: '后端大师', views: 1423, comments: 12, publishTime: '2024-01-11' },
  { id: '5', title: 'Vue 3 Composition API 深度剖析', author: 'Vue专家', views: 1256, comments: 10, publishTime: '2024-01-10' }
];

const getMembershipColor = (tier: string) => {
  switch (tier) {
    case 'basic': return 'bg-blue-100 text-blue-800';
    case 'premium': return 'bg-purple-100 text-purple-800';
    case 'vip': return 'bg-yellow-200 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const OverviewPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据总览</h1>
          <p className="text-gray-600 mt-1">掌握平台运营核心指标</p>
        </div>
        <div className="text-sm text-gray-500">
          最后更新: {new Date().toLocaleString('zh-CN')}
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="用户总数"
          value={mockStats.totalUsers.toLocaleString()}
          icon={Users}
          trend={{
            value: mockStats.userGrowth,
            isPositive: mockStats.userGrowth > 0
          }}
          color="blue"
        />
        <StatsCard
          title="文章总数"
          value={mockStats.totalPosts}
          icon={FileText}
          trend={{
            value: mockStats.postGrowth,
            isPositive: mockStats.postGrowth > 0
          }}
          color="green"
        />
        <StatsCard
          title="今日活跃"
          value={mockStats.dailyActive}
          icon={Activity}
          trend={{
            value: mockStats.activeGrowth,
            isPositive: mockStats.activeGrowth > 0
          }}
          color="yellow"
        />
        <StatsCard
          title="月度收入"
          value={`¥${mockStats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{
            value: mockStats.revenueGrowth,
            isPositive: mockStats.revenueGrowth > 0
          }}
          color="purple"
        />
      </div>

      {/* 趋势图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">用户增长趋势</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>图表组件开发中...</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">内容发布统计</h3>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>图表组件开发中...</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 数据表格区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最新用户 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">最新用户</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            {mockRecentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMembershipColor(user.membershipTier)}`}>
                    {user.membershipTier.toUpperCase()}
                  </span>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {user.joinTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 热门文章 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">热门文章</h3>
            <Eye className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-3">
            {mockHotPosts.map((post) => (
              <div key={post.id} className="py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                    <p className="text-xs text-gray-500">by {post.author}</p>
                  </div>
                  <div className="ml-2 text-xs text-gray-500">{post.publishTime}</div>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <Eye className="h-3 w-3 mr-1" />
                    {post.views}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {post.comments}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};