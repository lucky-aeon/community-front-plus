import React, { useState } from 'react';
import { Edit, Trash2, Eye, MoreHorizontal, Plus, Search, Filter } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';

export const MyArticlesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // 模拟文章数据
  const articles = [
    {
      id: '1',
      title: 'React Hooks 深入理解与实践',
      content: '本文详细介绍了React Hooks的使用方法和最佳实践...',
      status: 'published',
      views: 1234,
      likes: 45,
      comments: 12,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-16'
    },
    {
      id: '2', 
      title: 'TypeScript 在大型项目中的应用',
      content: '分享TypeScript在企业级项目中的应用经验...',
      status: 'draft',
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: '2024-01-14',
      updatedAt: '2024-01-14'
    },
    {
      id: '3',
      title: '前端性能优化实战指南',
      content: '从多个角度分析前端性能优化的方法和工具...',
      status: 'reviewing',
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: '2024-01-13',
      updatedAt: '2024-01-13'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">已发布</Badge>;
      case 'draft':
        return <Badge variant="secondary">草稿</Badge>;
      case 'reviewing':
        return <Badge variant="warning">审核中</Badge>;
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: 'published', label: '已发布' },
    { value: 'draft', label: '草稿' },
    { value: 'reviewing', label: '审核中' }
  ];

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的文章</h1>
          <p className="text-gray-600 mt-1">管理你发布的所有文章内容</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>写文章</span>
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">12</div>
            <div className="text-sm text-gray-600 mt-1">总文章数</div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">8</div>
            <div className="text-sm text-gray-600 mt-1">已发布</div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">2.5K</div>
            <div className="text-sm text-gray-600 mt-1">总阅读量</div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">126</div>
            <div className="text-sm text-gray-600 mt-1">总点赞数</div>
          </div>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="搜索文章标题或内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* 文章列表 */}
      <div className="space-y-4">
        {articles.map((article) => (
          <Card key={article.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {article.title}
                  </h3>
                  {getStatusBadge(article.status)}
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {article.content}
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{article.views} 阅读</span>
                  </span>
                  <span>{article.likes} 点赞</span>
                  <span>{article.comments} 评论</span>
                  <span>创建于 {article.createdAt}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 分页 */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>上一页</Button>
          <Button variant="outline" size="sm">1</Button>
          <Button size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">下一页</Button>
        </div>
      </div>
    </div>
  );
};