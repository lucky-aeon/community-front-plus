import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Search, Filter, CheckCircle, Heart } from 'lucide-react';
import { Badge } from '@shared/components/ui/Badge';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { PostCard } from '@shared/components/business/PostCard';
import { routeUtils } from '@shared/routes/routes';
import { PostsService } from '@shared/services/api/posts.service';
import { FrontPostDTO, PageResponse } from '@shared/types';

export const DiscussionsPage: React.FC = () => {
  const navigate = useNavigate();
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

  const handlePostClick = (postId: string) => {
    navigate(routeUtils.getPostDetailRoute(postId));
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handlePostClick(post.id)}>
                <div className="flex items-start space-x-4">
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    {post.summary && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {post.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{post.authorName}</span>
                        <span>{post.categoryName}</span>
                        <span>{new Date(post.publishTime).toLocaleDateString('zh-CN')}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.likeCount}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.commentCount}</span>
                        </span>
                        <span>浏览 {post.viewCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pageData && pageData.pages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                上一页
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                第 {currentPage} 页，共 {pageData.pages} 页
              </span>
              <Button
                variant="outline"
                disabled={currentPage === pageData.pages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
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