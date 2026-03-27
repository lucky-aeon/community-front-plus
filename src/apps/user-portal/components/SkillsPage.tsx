import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { SearchBar } from '@shared/components/ui/SearchBar';
import { SkillCard } from '@shared/components/business/SkillCard';
import { SkillStatsHero } from '@shared/components/business/SkillStatsHero';
import { FavoritesService, PublicStatsService, SkillsService, LikesService } from '@shared/services/api';
import { routeUtils } from '@shared/routes/routes';
import type { PublicSkillDTO, SkillInteractionState } from '@shared/types';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';

const PAGE_SIZE = 9;

export const SkillsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isDashboard = location.pathname.startsWith('/dashboard');

  useDocumentTitle('Skills 市场');

  const [skills, setSkills] = useState<PublicSkillDTO[]>([]);
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statsTotal, setStatsTotal] = useState(0);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [searchVersion, setSearchVersion] = useState(0);
  const [interactionMap, setInteractionMap] = useState<Record<string, SkillInteractionState>>({});

  useEffect(() => {
    let cancelled = false;

    const loadSkills = async () => {
      try {
        setIsLoadingList(true);
        const page = await SkillsService.getPublicSkills({
          pageNum: currentPage,
          pageSize: PAGE_SIZE,
          keyword: keyword || undefined,
        });

        if (!cancelled) {
          setSkills(page.records ?? []);
          setTotal(page.total ?? 0);
          setTotalPages(page.pages ?? 0);
        }
      } catch (error) {
        console.error('加载 skills 列表失败:', error);
        if (!cancelled) {
          setSkills([]);
          setTotal(0);
          setTotalPages(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingList(false);
        }
      }
    };

    void loadSkills();

    return () => {
      cancelled = true;
    };
  }, [currentPage, keyword]);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setInteractionMap({});
      return () => {
        cancelled = true;
      };
    }

    if (skills.length === 0) {
      setInteractionMap({});
      return () => {
        cancelled = true;
      };
    }

    const loadInteractionState = async () => {
      const baseMap = skills.reduce((acc, skill) => {
        acc[skill.id] = {
          liked: false,
          likeCount: skill.likeCount ?? 0,
          isFavorited: false,
          favoritesCount: skill.favoriteCount ?? 0,
        };
        return acc;
      }, {} as Record<string, SkillInteractionState>);
      setInteractionMap(baseMap);

      try {
        const targets = skills.map((skill) => ({ targetId: skill.id, targetType: 'SKILL' as const }));
        const [likeStatuses, favoriteStatuses] = await Promise.all([
          LikesService.batchGetStatus(targets).catch(() => []),
          FavoritesService.batchGetFavoriteStatus(targets).catch(() => []),
        ]);

        if (cancelled) return;

        setInteractionMap((prev) => {
          const nextMap = { ...prev };

          likeStatuses.forEach((status) => {
            nextMap[status.targetId] = {
              ...(nextMap[status.targetId] ?? baseMap[status.targetId]),
              liked: status.isLiked,
              likeCount: status.likeCount,
            };
          });

          favoriteStatuses.forEach((status) => {
            nextMap[status.targetId] = {
              ...(nextMap[status.targetId] ?? baseMap[status.targetId]),
              isFavorited: status.isFavorited,
              favoritesCount: status.favoritesCount,
            };
          });

          return nextMap;
        });
      } catch (error) {
        console.error('加载 skill 互动状态失败:', error);
      }
    };

    void loadInteractionState();

    return () => {
      cancelled = true;
    };
  }, [skills, user]);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        setIsLoadingStats(true);
        const totalCount = await PublicStatsService.getSkillsTotalCount();
        if (!cancelled) {
          setStatsTotal(totalCount);
        }
      } catch (error) {
        console.error('加载 skills 统计失败:', error);
        if (!cancelled) {
          setStatsTotal(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingStats(false);
        }
      }
    };

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (query: string) => {
    setKeyword(query.trim());
    setCurrentPage(1);
  };

  const handleReset = () => {
    setKeyword('');
    setCurrentPage(1);
    setSearchVersion((value) => value + 1);
  };

  const openDetail = (skillId: string) => {
    navigate(routeUtils.getSkillDetailRoute(skillId, isDashboard));
  };

  const pageCount = Math.max(totalPages, 1);

  return (
    <div className="relative pb-12">
      <SkillStatsHero totalCount={statsTotal} isLoading={isLoadingStats} isDashboard={isDashboard} />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-honey-100 bg-white/90 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-2xl">
              <SearchBar
                key={searchVersion}
                placeholder="搜索 Skills 名称或简介..."
                onSearch={handleSearch}
                showRecent={false}
                showSuggestions={false}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-honey-50 px-3 py-2 text-sm text-honey-700">
                <Search className="h-4 w-4" />
                当前结果 {total.toLocaleString('zh-CN')} 条
              </div>
              {keyword && (
                <Button variant="ghost" onClick={handleReset}>
                  清除搜索
                </Button>
              )}
            </div>
          </div>
          {keyword && (
            <div className="mt-3 text-sm text-warm-gray-500">
              当前关键词：<span className="font-medium text-gray-900">{keyword}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {isLoadingList && skills.length === 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-warm-gray-200 p-5">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-full space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-6 w-3/4" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex items-start justify-between gap-3 pt-4">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : skills.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {skills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onClick={() => openDetail(skill.id)}
                  showInteraction={!!user}
                  interactionState={interactionMap[skill.id]}
                  onLikeChange={(next) => {
                    setInteractionMap((prev) => {
                      const current = prev[skill.id] ?? {
                        liked: false,
                        likeCount: skill.likeCount ?? 0,
                        isFavorited: false,
                        favoritesCount: skill.favoriteCount ?? 0,
                      };

                      return {
                        ...prev,
                        [skill.id]: {
                          ...current,
                          liked: next.liked,
                          likeCount: next.likeCount,
                        },
                      };
                    });
                  }}
                  onFavoriteChange={(next) => {
                    setInteractionMap((prev) => {
                      const current = prev[skill.id] ?? {
                        liked: false,
                        likeCount: skill.likeCount ?? 0,
                        isFavorited: false,
                        favoritesCount: skill.favoriteCount ?? 0,
                      };
                      const favoritesCount = next
                        ? current.favoritesCount + 1
                        : Math.max(0, current.favoritesCount - 1);

                      return {
                        ...prev,
                        [skill.id]: {
                          ...current,
                          isFavorited: next,
                          favoritesCount,
                        },
                      };
                    });
                  }}
                />
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-honey-100 bg-white/85 px-4 py-4 sm:flex-row">
              <div className="text-sm text-warm-gray-500">
                第 <span className="font-semibold text-gray-900">{currentPage}</span> / <span className="font-semibold text-gray-900">{pageCount}</span> 页，共{' '}
                <span className="font-semibold text-gray-900">{total.toLocaleString('zh-CN')}</span> 条公开 Skills
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage <= 1 || isLoadingList}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                  disabled={currentPage >= pageCount || isLoadingList}
                >
                  下一页
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Card className="border-dashed border-honey-200 bg-white/85 px-6 py-16 text-center">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">暂时没有可展示的 Skills</h2>
              <p className="text-sm text-warm-gray-500">
                {keyword ? `没有找到和 “${keyword}” 相关的公开 Skills，换个关键词试试。` : '当前还没有公开 Skills，稍后再来看看。'}
              </p>
              {keyword && (
                <div>
                  <Button variant="outline" onClick={handleReset}>
                    清空关键词
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SkillsPage;
