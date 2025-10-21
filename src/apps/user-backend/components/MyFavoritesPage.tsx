import React, { useState, useEffect } from 'react';
import { Star, FileText, BookOpen, MessageSquare, ListChecks, Trash2, Search, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingPage as LoadingSpinner } from '@shared/components/common/LoadingPage';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';
import { FavoritesService, ChaptersService } from '@shared/services/api';
import { FavoriteListItemDTO, PageResponse, FavoriteTargetType } from '@shared/types';
import { useNavigate } from 'react-router-dom';
import { routeUtils } from '@shared/routes/routes';

export const MyFavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteListItemDTO[]>([]);
  const [pageInfo, setPageInfo] = useState<PageResponse<FavoriteListItemDTO> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; favoriteId: string | null }>({
    isOpen: false,
    favoriteId: null
  });
  const [activeTab, setActiveTab] = useState<FavoriteTargetType | 'all'>('all');

  // 获取收藏列表
  const fetchFavorites = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await FavoritesService.getMyFavorites({
        pageNum: page,
        pageSize: 10,
        targetType: activeTab === 'all' ? undefined : activeTab
      });
      setPageInfo(response);
      setFavorites(response.records);
    } catch (error) {
      console.error('获取收藏列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 取消收藏
  const handleUnfavorite = async (favoriteItem: FavoriteListItemDTO) => {
    try {
      await FavoritesService.toggleFavorite(favoriteItem.targetId, favoriteItem.targetType);

      // 从本地状态中移除
      setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== favoriteItem.id));

      // 更新总数
      if (pageInfo) {
        setPageInfo(prevPageInfo => ({
          ...prevPageInfo!,
          total: prevPageInfo!.total - 1
        }));
      }

    } catch (error) {
      console.error('取消收藏失败:', error);
    }
  };

  // 初始化和页面变化时获取数据
  useEffect(() => {
    fetchFavorites(currentPage);
  }, [currentPage, activeTab]);

  // 搜索过滤
  const filteredFavorites = favorites.filter(fav =>
    searchTerm === '' ||
    fav.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fav.snippet?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 获取类型徽章
  const getTargetTypeBadge = (targetType: FavoriteTargetType) => {
    switch (targetType) {
      case 'POST':
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <FileText className="h-3 w-3" />
            <span>文章</span>
          </Badge>
        );
      case 'CHAPTER':
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <BookOpen className="h-3 w-3" />
            <span>章节</span>
          </Badge>
        );
      case 'COMMENT':
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <MessageSquare className="h-3 w-3" />
            <span>评论</span>
          </Badge>
        );
      case 'INTERVIEW_QUESTION':
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <ListChecks className="h-3 w-3" />
            <span>题目</span>
          </Badge>
        );
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  // 跳转到详情页
  const openTarget = async (fav: FavoriteListItemDTO) => {
    try {
      if (fav.targetType === 'POST') {
        navigate(routeUtils.getPostDetailRoute(fav.targetId));
        return;
      }
      if (fav.targetType === 'CHAPTER') {
        const detail = await ChaptersService.getFrontChapterDetail(fav.targetId);
        navigate(`/dashboard/courses/${detail.courseId}/chapters/${fav.targetId}`);
        return;
      }
      if (fav.targetType === 'INTERVIEW_QUESTION') {
        navigate(routeUtils.getInterviewDetailRoute(fav.targetId));
        return;
      }
      // COMMENT 类型：跳转到评论所在的业务对象页面，并添加 hash 定位到评论
      if (fav.targetType === 'COMMENT') {
        if (!fav.businessId || !fav.businessType) {
          console.error('评论收藏缺少业务对象信息');
          return;
        }

        // 根据业务类型构造跳转 URL
        let targetUrl = '';
        if (fav.businessType === 'POST') {
          targetUrl = routeUtils.getPostDetailRoute(fav.businessId);
        } else if (fav.businessType === 'CHAPTER') {
          const detail = await ChaptersService.getFrontChapterDetail(fav.businessId);
          targetUrl = `/dashboard/courses/${detail.courseId}/chapters/${fav.businessId}`;
        } else if (fav.businessType === 'INTERVIEW_QUESTION') {
          targetUrl = routeUtils.getInterviewDetailRoute(fav.businessId);
        }

        // 添加 hash 定位到具体评论
        if (targetUrl) {
          navigate(targetUrl + `#comment-${fav.targetId}`);
        }
        return;
      }
    } catch (e) {
      console.error('跳转目标打开失败：', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的收藏</h1>
          <p className="text-gray-600 mt-1">管理你收藏的内容</p>
        </div>
        <div className="text-sm text-gray-500">
          {pageInfo && <span>共 {pageInfo.total} 条收藏</span>}
        </div>
      </div>

      {/* 过滤与搜索 */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 w-full md:w-auto">
            <button
              type="button"
              className={`px-4 py-2 text-sm ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            >
              全部
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm border-l border-gray-200 ${activeTab === 'POST' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => { setActiveTab('POST'); setCurrentPage(1); }}
            >
              文章
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm border-l border-gray-200 ${activeTab === 'CHAPTER' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => { setActiveTab('CHAPTER'); setCurrentPage(1); }}
            >
              章节
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm border-l border-gray-200 ${activeTab === 'COMMENT' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => { setActiveTab('COMMENT'); setCurrentPage(1); }}
            >
              评论
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm border-l border-gray-200 ${activeTab === 'INTERVIEW_QUESTION' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => { setActiveTab('INTERVIEW_QUESTION'); setCurrentPage(1); }}
            >
              题目
            </button>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="搜索标题或内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* 收藏列表 */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredFavorites.length === 0 ? (
        <Card className="p-12 text-center">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm ? '没有找到匹配的收藏' : '暂无收藏'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm ? '尝试调整搜索条件' : '收藏你喜欢的内容，方便随时查看'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFavorites.map((fav) => (
            <Card
              key={fav.id}
              className="p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group"
              role="button"
              tabIndex={0}
              onClick={() => openTarget(fav)}
              onKeyDown={(e) => { if (e.key === 'Enter') openTarget(fav); }}
            >
              <div className="space-y-4">
                {/* 头部信息 */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getTargetTypeBadge(fav.targetType)}
                    <span className="text-sm text-gray-500">
                      {new Date(fav.createTime).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); openTarget(fav); }}
                      className="hidden sm:inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                    >
                      <span>查看详情</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, favoriteId: fav.id }); }}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>取消收藏</span>
                    </Button>
                  </div>
                </div>

                {/* 标题 */}
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {fav.title || '无标题'}
                </h3>

                {/* 摘要 */}
                {fav.snippet && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {fav.snippet}
                  </p>
                )}

                {/* 作者信息 */}
                {fav.authorName && (
                  <div className="flex items-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                    <span>作者：{fav.authorName}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 分页 */}
      {pageInfo && pageInfo.pages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="neutral"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              上一页
            </Button>
            {Array.from({ length: Math.min(5, pageInfo.pages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'neutral'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="neutral"
              size="sm"
              disabled={currentPage >= pageInfo.pages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onCancel={() => setDeleteConfirm({ isOpen: false, favoriteId: null })}
        onConfirm={() => {
          if (deleteConfirm.favoriteId) {
            const fav = favorites.find(f => f.id === deleteConfirm.favoriteId);
            if (fav) {
              handleUnfavorite(fav);
              setDeleteConfirm({ isOpen: false, favoriteId: null });
            }
          }
        }}
        title="确认取消收藏"
        message="取消后将从收藏列表中移除，您确定要继续吗？"
        confirmText="确认取消"
        cancelText="返回"
        variant="danger"
      />
    </div>
  );
};
