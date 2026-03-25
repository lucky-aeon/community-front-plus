import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calendar, ExternalLink, User } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { GithubMarkIcon } from '@shared/components/business/SkillCard';
import { SkillsService } from '@shared/services/api';
import { routeUtils } from '@shared/routes/routes';
import type { PublicSkillDetailDTO } from '@shared/types';
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
  const isDashboard = location.pathname.startsWith('/dashboard');
  const listRoute = useMemo(() => routeUtils.getSkillsRoute(isDashboard), [isDashboard]);

  const [data, setData] = useState<PublicSkillDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [id, listRoute, navigate]);

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
    </div>
  );
};

export default SkillDetailPage;
