import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { ListChecks, Tag, Eye, MessageSquare, Heart, Star, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { InterviewQuestionsService, AppUnreadService } from '@shared/services/api';
import type { InterviewQuestionDTO, InterviewQuestionQueryRequest } from '@shared/types';
import { SearchBar } from '@shared/components/ui/SearchBar';
import { useNavigate } from 'react-router-dom';
import { routeUtils } from '@shared/routes/routes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategorySelect } from '@shared/components/common/CategorySelect';
import { Button } from '@/components/ui/button';
import { showToast } from '@shared/utils/toast';

export const InterviewQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const observerTarget = useRef<HTMLDivElement>(null);

  // 查询与分页状态
  const [list, setList] = useState<InterviewQuestionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const visitedRef = useRef<boolean>(false);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [minRating, setMinRating] = useState<number | 'all'>('all');
  const [maxRating, setMaxRating] = useState<number | 'all'>('all');
  const pageSize = 12;

  // 加载数据（追加或重置）
  const loadData = useCallback(async (page: number, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params: InterviewQuestionQueryRequest = {
        pageNum: page,
        pageSize,
        title: keyword.trim() || undefined,
        categoryId: categoryId || undefined,
        minRating: typeof minRating === 'number' ? minRating : undefined,
        maxRating: typeof maxRating === 'number' ? maxRating : undefined,
      };
      const result = await InterviewQuestionsService.getPublicQuestions(params);

      if (isLoadMore) {
        setList(prev => [...prev, ...result.records]);
      } else {
        setList(result.records);
      }

      setHasMore(page < result.pages);
      setCurrentPage(page);

      // 列表加载成功后清零题目频道未读（仅首次调用一次，幂等）
      try {
        if (!visitedRef.current) {
          visitedRef.current = true;
          await AppUnreadService.visit('QUESTIONS');
        }
      } catch (e) {
        console.error('清零题目未读失败:', e);
      }
    } catch (e) {
      console.error('加载题库失败:', e);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, [keyword, categoryId, minRating, maxRating]);

  // 筛选条件变化时重置列表
  useEffect(() => {
    setCurrentPage(1);
    void loadData(1, false);
  }, [keyword, categoryId, minRating, maxRating, loadData]);

  // 无限滚动监听
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !loadingMore) {
          void loadData(currentPage + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, isLoading, loadingMore, currentPage, loadData]);

  // 难度样式配置（仅用于徽章）
  const getDifficultyConfig = (rating: number | null | undefined) => {
    if (!rating) return { bgColor: 'bg-warm-gray-50', textColor: 'text-warm-gray-700', label: '-' };
    if (rating <= 2) return { bgColor: 'bg-sage-50', textColor: 'text-sage-700', label: '简单' };
    if (rating === 3) return { bgColor: 'bg-honey-100', textColor: 'text-honey-700', label: '中等' };
    return { bgColor: 'bg-red-50', textColor: 'text-red-700', label: '困难' };
  };

  return (
    <div className="relative">
      {/* 顶部区域 */}
      <div className="bg-gradient-to-br from-honey-50 via-white to-honey-50/60 border-b border-honey-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">题库</h1>
            <p className="text-warm-gray-600 text-sm sm:text-base">收录面试题与解答，助你高效复习备战</p>
          </div>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-3 items-start">
            <div className="lg:col-span-2">
              <SearchBar
                placeholder="搜索题目标题..."
                showRecent={false}
                showSuggestions={false}
                onSearch={(q) => setKeyword(q)}
              />
            </div>
            <div className="lg:col-span-1">
              <CategorySelect
                value={categoryId}
                onChange={(v) => setCategoryId(v)}
                label=""
                placeholder="请选择题库分类"
                categoryType="INTERVIEW"
              />
              {categoryId && (
                <div className="mt-1">
                  <Button variant="ghost" size="sm" onClick={() => setCategoryId('')}>清除分类</Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Select
                  value={minRating === 'all' ? 'all' : String(minRating)}
                  onValueChange={(v) => {
                    const val = v === 'all' ? 'all' : (Number(v) as number);
                    if (val !== 'all' && typeof maxRating === 'number' && val > maxRating) {
                      showToast.error('最低难度不能大于最高难度');
                    } else {
                      setMinRating(val);
                    }
                  }}
                >
                  <SelectTrigger className="h-10"><SelectValue placeholder="最低难度" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">最低难度</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={maxRating === 'all' ? 'all' : String(maxRating)}
                  onValueChange={(v) => {
                    const val = v === 'all' ? 'all' : (Number(v) as number);
                    if (val !== 'all' && typeof minRating === 'number' && val < minRating) {
                      showToast.error('最高难度不能小于最低难度');
                    } else {
                      setMaxRating(val);
                    }
                  }}
                >
                  <SelectTrigger className="h-10"><SelectValue placeholder="最高难度" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">最高难度</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 列表 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
        {isLoading && list.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: pageSize }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : list.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((q) => {
                const difficultyConfig = getDifficultyConfig(q.rating);
                const maxTags = 3;
                const visibleTags = q.tags?.slice(0, maxTags) || [];
                const remainingCount = (q.tags?.length || 0) - maxTags;

                return (
                  <Card
                    key={q.id}
                    className="p-5 border border-warm-gray-200 hover:border-honey-400 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(routeUtils.getInterviewDetailRoute(q.id))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') navigate(routeUtils.getInterviewDetailRoute(q.id)); }}
                  >
                    <div className="flex flex-col gap-3">
                      {/* 顶部：难度徽章 + 分类 */}
                      <div className="flex items-center justify-between gap-2">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${difficultyConfig.bgColor} ${difficultyConfig.textColor}`}>
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="text-xs font-semibold">{difficultyConfig.label}</span>
                        </div>
                        {q.categoryName && (
                          <Badge variant="outline" className="text-xs border-honey-200 text-honey-700">
                            {q.categoryName}
                          </Badge>
                        )}
                      </div>

                      {/* 标题 */}
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{q.title}</h3>

                      {/* 描述 */}
                      {q.description && (
                        <p className="text-sm text-warm-gray-600 line-clamp-2">{q.description}</p>
                      )}

                      {/* 标签 */}
                      {visibleTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {visibleTags.map((t, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-honey-50 text-honey-700 border-honey-200 flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {t}
                            </Badge>
                          ))}
                          {remainingCount > 0 && (
                            <Badge variant="secondary" className="text-xs bg-warm-gray-100 text-warm-gray-600">
                              +{remainingCount}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* 底部：作者 + 互动数据 */}
                      <div className="flex items-center justify-between text-xs text-warm-gray-500 pt-2 border-t border-warm-gray-100">
                        {q.authorName && (
                          <span className="truncate">作者：{q.authorName}</span>
                        )}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="inline-flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" />
                            {q.likeCount ?? 0}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {q.commentCount ?? 0}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {q.viewCount ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* 加载更多指示器 */}
            <div ref={observerTarget} className="mt-8 flex justify-center">
              {loadingMore ? (
                <div className="flex items-center gap-2 text-warm-gray-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>加载中...</span>
                </div>
              ) : hasMore ? (
                <div className="text-warm-gray-400 text-sm">向下滚动加载更多</div>
              ) : (
                <div className="text-warm-gray-400 text-sm">已加载全部内容</div>
              )}
            </div>
          </>
        ) : (
          <Card className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-warm-gray-600"><ListChecks className="h-5 w-5" />暂无题目</div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InterviewQuestionsPage;
