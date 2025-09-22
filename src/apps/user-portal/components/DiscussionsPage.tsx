import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RecentContent } from '@shared/components/business/RecentContent';
import { PostsService } from '@shared/services/api/posts.service';
import { FrontPostDTO, PageResponse } from '@shared/types';

export const DiscussionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'questions'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState<FrontPostDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageData, setPageData] = useState<PageResponse<FrontPostDTO> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 获取文章列表
  const fetchPosts = async (page: number = 1, categoryType?: 'ARTICLE' | 'QA') => {
    try {
      setIsLoading(true);
      const response = await PostsService.getPublicPosts({
        pageNum: page,
        pageSize,
        categoryType
      });
      setPosts(response.records);
      setPageData(response);
    } catch (error) {
      console.error('获取文章列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载和标签切换时重新加载数据
  useEffect(() => {
    const categoryType = activeTab === 'articles' ? 'ARTICLE' : activeTab === 'questions' ? 'QA' : undefined;
    setCurrentPage(1);
    fetchPosts(1, categoryType);
  }, [activeTab]);

  // 分页切换
  const handlePageChange = (page: number) => {
    const categoryType = activeTab === 'articles' ? 'ARTICLE' : activeTab === 'questions' ? 'QA' : undefined;
    setCurrentPage(page);
    fetchPosts(page, categoryType);
  };

  // 本地搜索过滤（在已加载的数据中搜索）
  const filteredPosts = posts.filter(post => {
    if (!searchTerm.trim()) return true;
    return post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (post.summary && post.summary.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const tabs = [
    { id: 'all', name: '全部讨论', count: pageData?.total || 0 },
    { id: 'articles', name: '文章', count: 0 }, // 这里可以单独调用接口获取数量，暂时设为0
    { id: 'questions', name: '问答', count: 0 } // 这里可以单独调用接口获取数量，暂时设为0
  ];

  // 处理标签页切换
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'all' | 'articles' | 'questions');
  };

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
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
              <span>{tab.name}</span>
              <Badge variant="secondary" size="sm">
                {tab.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Posts List */}
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="w-24 h-24 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <RecentContent
          posts={filteredPosts}
          pageData={pageData}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          showHeader={false}
          showPagination={true}
        />
      )}

      {!isLoading && filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无相关讨论</h3>
          <p className="text-gray-600">尝试调整搜索条件或发布新的讨论内容</p>
        </div>
      )}
    </div>
  );
};