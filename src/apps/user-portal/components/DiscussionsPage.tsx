import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Search, Filter, CheckCircle } from 'lucide-react';
import { Badge } from '@shared/components/ui/Badge';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { PostCard } from '@shared/components/business/PostCard';
import { posts } from '@shared/constants/mockData';
import { routeUtils } from '@shared/routes/routes';

export const DiscussionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'questions'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handlePostClick = (postId: string) => {
    navigate(routeUtils.getPostDetailRoute(postId));
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'articles' && post.type === 'article') ||
                      (activeTab === 'questions' && post.type === 'question');
    return matchesSearch && matchesTab;
  });

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'vip': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'all', name: '全部讨论', count: posts.length },
    { id: 'articles', name: '文章', count: posts.filter(p => p.type === 'article').length },
    { id: 'questions', name: '问答', count: posts.filter(p => p.type === 'question').length }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">社区讨论</h1>
          <p className="text-gray-600">分享知识，解答疑问，共同成长</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="搜索讨论内容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>筛选</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'all' | 'articles' | 'questions')}
            className={`
              flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <span>{tab.name}</span>
            <Badge variant="secondary" size="sm">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <PostCard 
            key={post.id}
            post={post}
            onPostClick={handlePostClick}
            variant="default"
          />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无相关讨论</h3>
          <p className="text-gray-600">尝试调整搜索条件或发布新的讨论内容</p>
        </div>
      )}
    </div>
  );
};