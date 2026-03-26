import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calendar, ExternalLink, User } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { GithubMarkIcon } from '@shared/components/business/SkillCard';
import { Comments } from '@shared/components/ui/Comments';
import { FavoriteButton } from '@shared/components/business/FavoriteButton';
import { LikeButton } from '@shared/components/ui/LikeButton';
import { FavoritesService, LikesService, SkillsService } from '@shared/services/api';
import { routeUtils } from '@shared/routes/routes';
import type { PublicSkillDetailDTO, SkillInteractionState } from '@shared/types';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN');
};

export const SkillDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const listRoute = useMemo(() => routeUtils.getSkillsRoute(isDashboard), [isDashboard]);

  const [data, setData] = useState<PublicSkillDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [interactionState, setInteractionState] = useState<SkillInteractionState | null>(null);

  useDocumentTitle(data?.name || 'Skill 详情');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!id) {
        navigate(listRoute, { replace: true });
        return;
      }

      try {
        setLoading(true);
        const detail = await SkillsService.getPublicSkillById(id);
        if (!cancelled) {
          setData(detail);
        }

        if (user) {
          if (!cancelled) {
            setInteractionState({
              liked: false,
              likeCount: detail.likeCount ?? 0,
              isFavorited: false,
              favoritesCount: detail.favoriteCount ?? 0,
            });
          }

          const [likeStatuses, favoriteStatuses] = await Promise.all([
            LikesService.batchGetStatus([{ targetId: id, targetType: 'SKILL' }]).catch(() => []),
            FavoritesService.batchGetFavoriteStatus([{ targetId: id, targetType: 'SKILL' }]).catch(() => []),
          ]);

          if (!cancelled) {
            setInteractionState((prev) => ({
              liked: likeStatuses[0]?.isLiked ?? prev?.liked ?? false,
              likeCount: likeStatuses[0]?.likeCount ?? prev?.likeCount ?? detail.likeCount ?? 0,
              isFavorited: favoriteStatuses[0]?.isFavorited ?? prev?.isFavorited ?? false,
              favoritesCount: favoriteStatuses[0]?.favoritesCount ?? prev?.favoritesCount ?? detail.favoriteCount ?? 0,
            }));
          }
        } else if (!cancelled) {
          setInteractionState(null);
        }
      } catch (error) {
        console.error('加载 skill 详情失败:', error);
        if (!cancelled) {
          navigate(listRoute, { replace: true });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, listRoute, navigate, user]);

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-warm-gray-500 sm:px-6 lg:px-8">加载中...</div>;
  }

  if (!data) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-red-500 sm:px-6 lg:px-8">Skill 不存在</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <Button variant="ghost" onClick={() => navigate(listRoute)} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        返回 Skills
      </Button>

      <Card className="overflow-hidden border-honey-100 bg-white/95 shadow-sm">
        <div className="border-b border-honey-100 bg-gradient-to-br from-honey-50 via-white to-orange-50/70 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-4">
              <div className="inline-flex items-center rounded-full bg-honey-100 px-3 py-1 text-sm font-medium text-honey-700">
                Public Skill Detail
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{data.name}</h1>
                <p className="text-sm leading-7 text-warm-gray-600 sm:text-base">
                  {data.summary || '作者暂未填写简介。'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-warm-gray-500">
                <span className="inline-flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {data.authorName || '匿名作者'}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDateTime(data.createTime)}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3">
              {data.githubUrl ? (
                <Button
                  asChild
                  variant="outline"
                  className="gap-2 border-honey-200 bg-white text-gray-800 hover:bg-honey-50"
                >
                  <a href={data.githubUrl} target="_blank" rel="noopener noreferrer">
                    <GithubMarkIcon className="h-4 w-4" />
                    GitHub
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 border-honey-200 bg-white text-gray-500"
                  disabled
                >
                  <GithubMarkIcon className="h-4 w-4" />
                  暂无 GitHub
                </Button>
              )}

              {user && interactionState && (
                <div className="flex items-center gap-2">
                  <LikeButton
                    businessType="SKILL"
                    businessId={data.id}
                    initialLiked={interactionState.liked}
                    initialCount={interactionState.likeCount}
                    skipInitialFetch
                    onChange={(next) => {
                      setInteractionState((prev) => prev ? { ...prev, liked: next.liked, likeCount: next.likeCount } : prev);
                      setData((prev) => prev ? { ...prev, likeCount: next.likeCount } : prev);
                    }}
                  />
                  <FavoriteButton
                    targetId={data.id}
                    targetType="SKILL"
                    variant="ghost"
                    size="sm"
                    showCount
                    initialIsFavorited={interactionState.isFavorited}
                    initialCount={interactionState.favoritesCount}
                    skipInitialFetch
                    onToggle={(next) => {
                      setInteractionState((prev) => {
                        if (!prev) return prev;
                        const favoritesCount = next
                          ? prev.favoritesCount + 1
                          : Math.max(0, prev.favoritesCount - 1);
                        return { ...prev, isFavorited: next, favoritesCount };
                      });
                      setData((prev) => {
                        if (!prev) return prev;
                        const favoritesCount = next
                          ? (prev.favoriteCount ?? 0) + 1
                          : Math.max(0, (prev.favoriteCount ?? 0) - 1);
                        return { ...prev, favoriteCount: favoritesCount };
                      });
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">详细说明</h2>
          </div>
          {data.description ? (
            <div className="prose-content">
              <MarkdownEditor
                value={data.description}
                onChange={() => {}}
                previewOnly
                height="auto"
                toolbar={false}
                className="!border-none !bg-transparent !shadow-none"
                enableFullscreen={false}
                enableToc={false}
              />
            </div>
          ) : (
            <p className="text-sm text-warm-gray-500">作者暂未补充详细说明。</p>
          )}
        </div>
      </Card>

      {user && (
        <div className="mt-6">
          <Comments
            businessId={data.id}
            businessType="SKILL"
          />
        </div>
      )}
    </div>
  );
};

export default SkillDetailPage;
