import React, { useState } from 'react';
import { MessageSquare, Plus, Search, Filter, Heart, Clock, CheckCircle } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Badge } from '@shared/components/ui/Badge';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { posts } from '@shared/constants/mockData';

interface DiscussionsPageProps {
  onPostClick: (postId: string) => void;
}

export const DiscussionsPage: React.FC<DiscussionsPageProps> = ({ onPostClick }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'questions'>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
            onClick={() => setActiveTab(tab.id as any)}
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
          <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">{post.author.name}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMembershipColor(post.author.membershipTier)}`}>
                      {post.author.membershipTier.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant={post.type === 'article' ? 'primary' : 'warning'}>
                  {post.type === 'article' ? '文章' : '问答'}
                </Badge>
                {post.type === 'question' && post.isAnswered && (
                  <Badge variant="success" className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>已解答</span>
                  </Badge>
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
              <button onClick={() => onPostClick(post.id)} className="text-left">
                {post.title}
              </button>
            </h3>
            
            <p className="text-gray-600 mb-4 line-clamp-3">
              {post.content}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" size="sm" className="hover:bg-blue-100 hover:text-blue-800 cursor-pointer">
                    #{tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1 hover:text-red-500 cursor-pointer transition-colors">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center space-x-1 hover:text-blue-500 cursor-pointer transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments}</span>
                </div>
              </div>
            </div>
          </Card>
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