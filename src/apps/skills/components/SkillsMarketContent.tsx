import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Github, RefreshCw, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AdminPagination from '@shared/components/AdminPagination';
import { SharedMarkdownRenderer } from '@shared/components/ui/SharedMarkdownRenderer';
import { SkillsService } from '@shared/services/api/skills.service';
import type { PageResponse, SkillDTO } from '@shared/types';
import { ROUTES } from '@shared/routes/routes';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@shared/utils/cn';

interface SkillsMarketContentProps {
  title: string;
  subtitle?: string;
  compact?: boolean;
  headerVariant?: 'default' | 'dashboard';
  showRefreshButton?: boolean;
  showUploadButton?: boolean;
  showEmptyStateUploadCta?: boolean;
  emptyStateDescription?: string;
  uploadButtonLabel?: string;
  dashboardActionEyebrow?: string;
  dashboardActionTitle?: string;
  dashboardActionDescription?: string;
  dashboardActionFootnote?: string;
}

const DEFAULT_PAGE_SIZE = 12;

interface SkillDetailPanelProps {
  skill: SkillDTO;
  onClose?: () => void;
  className?: string;
}

const SkillDetailPanel: React.FC<SkillDetailPanelProps> = ({ skill, onClose, className }) => {
  return (
    <Card className={cn('border-honey-200 bg-white/95 shadow-sm', className)}>
      <CardHeader className="space-y-4 border-b border-honey-100 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-honey-200 bg-honey-50 px-3 py-1 text-xs font-medium text-honey-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Skill 详情</span>
            </div>
            <CardTitle className="mt-4 text-2xl leading-tight text-gray-900">{skill.name}</CardTitle>
            <p className="mt-3 text-sm leading-6 text-warm-gray-600">{skill.summary}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full text-honey-700 hover:bg-honey-50 hover:text-honey-800">
              <a href={skill.githubUrl} target="_blank" rel="noreferrer" aria-label="打开 GitHub" title="打开 GitHub">
                <Github className="h-4 w-4" />
              </a>
            </Button>
            {onClose ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-warm-gray-500 hover:bg-honey-50 hover:text-honey-700"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div>
          <div className="text-sm font-semibold text-gray-900">描述</div>
          <div className="prose-content mt-3 rounded-2xl border border-honey-100 bg-honey-50/40 p-4">
            {skill.description?.trim() ? (
              <SharedMarkdownRenderer
                content={skill.description}
                className="text-sm leading-7 text-gray-700"
              />
            ) : (
              <p className="text-sm text-warm-gray-500">暂无描述</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SkillsMarketContent: React.FC<SkillsMarketContentProps> = ({
  title,
  subtitle,
  compact = false,
  headerVariant = 'default',
  showRefreshButton = true,
  showUploadButton = true,
  showEmptyStateUploadCta,
  emptyStateDescription = '第一批 skill 还在路上，稍后再来看看社区最新收录的内容。',
  uploadButtonLabel = '上传 Skills',
  dashboardActionEyebrow = '创作者入口',
  dashboardActionTitle = '上传你的 Skills',
  dashboardActionDescription = '进入后台继续上传、编辑和维护你收录到社区市场的 skills。',
  dashboardActionFootnote = '统一在 Skills 管理页维护内容',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pageInfo, setPageInfo] = useState<PageResponse<SkillDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSkill, setSelectedSkill] = useState<SkillDTO | null>(null);

  const loadSkills = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await SkillsService.getPublicSkills({
        pageNum: page,
        pageSize: DEFAULT_PAGE_SIZE,
      });
      setPageInfo(response);
      setCurrentPage(response.current);
    } catch (error) {
      console.error('加载 skills 市场失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSkills(1);
  }, [loadSkills]);

  const handleUpload = () => {
    if (user) {
      navigate(ROUTES.USER_BACKEND_SKILLS);
      return;
    }
    navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.USER_BACKEND_SKILLS)}`);
  };

  const records = useMemo(() => pageInfo?.records ?? [], [pageInfo]);
  const total = pageInfo?.total ?? 0;
  const isDashboardHeader = headerVariant === 'dashboard';
  const shouldShowEmptyStateUploadCta = showEmptyStateUploadCta ?? (isDashboardHeader ? false : showUploadButton);
  const headerLayoutClass = `flex ${compact ? 'flex-col gap-4' : 'flex-col lg:flex-row lg:items-end lg:justify-between gap-6'}`;
  const dashboardHeaderDescription = subtitle ?? '浏览社区收录的 Skills，关注社区最新上架的能力与工具。';
  const dashboardContentLayoutClass = showUploadButton
    ? 'grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-center'
    : 'grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start';
  const dashboardStatsCard = (
    <div className="w-full max-w-[320px] rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur xl:ml-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-warm-gray-500">当前收录</div>
          <div className="mt-3 text-4xl font-semibold leading-none text-gray-900">{total}</div>
          <div className="mt-2 text-sm text-warm-gray-500">社区市场已公开展示的 Skills 数量</div>
        </div>
        <div className="rounded-2xl bg-honey-50 p-3 text-honey-600 shadow-sm">
          <Github className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
  useEffect(() => {
    if (!selectedSkill) {
      return;
    }

    const currentSelectedSkill = records.find((skill) => skill.id === selectedSkill.id);
    if (!currentSelectedSkill) {
      setSelectedSkill(null);
      return;
    }

    if (currentSelectedSkill !== selectedSkill) {
      setSelectedSkill(currentSelectedSkill);
    }
  }, [records, selectedSkill]);

  return (
    <div className="space-y-6">
      {isDashboardHeader ? (
        <Card className="relative overflow-hidden border-honey-200 bg-gradient-to-br from-[#fffdf5] via-white to-honey-100/90 shadow-[0_22px_60px_-34px_rgba(217,119,6,0.42)]">
          <div className="pointer-events-none absolute -top-20 right-8 h-48 w-48 rounded-full bg-honey-200/60 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-12 h-32 w-32 rounded-full bg-orange-100/70 blur-3xl" />
          <CardContent className="relative p-5 sm:p-6 lg:p-8">
            <div className={dashboardContentLayoutClass}>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-honey-200 bg-white/85 px-3 py-1 text-sm text-honey-700 shadow-sm backdrop-blur">
                    <Sparkles className="h-4 w-4" />
                    <span>社区 Skills 市场</span>
                  </div>
                  <div className="max-w-3xl">
                    <h1 className={`${compact ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'} font-bold tracking-tight text-gray-900`}>
                      {title}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-warm-gray-600 sm:text-base">
                      {dashboardHeaderDescription}
                    </p>
                  </div>
                </div>

                {showUploadButton ? dashboardStatsCard : null}
              </div>

              {showUploadButton ? (
                <div className="rounded-[28px] border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_24px_48px_-28px_rgba(15,23,42,0.88)] sm:p-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-[0.18em] text-white/70">
                    <Sparkles className="h-3.5 w-3.5 text-honey-300" />
                    <span>{dashboardActionEyebrow}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold leading-tight">{dashboardActionTitle}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{dashboardActionDescription}</p>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/45">管理入口</div>
                    <div className="mt-2 text-sm font-medium text-white/85">上传、编辑、删除与维护全部在同一页面完成</div>
                  </div>

                  <Button
                    className="mt-6 h-12 w-full justify-between rounded-2xl bg-gradient-to-r from-honey-400 to-honey-500 px-5 text-sm font-semibold text-slate-950 shadow-lg hover:from-honey-500 hover:to-honey-600"
                    onClick={handleUpload}
                  >
                    <span>{uploadButtonLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <div className="mt-3 text-xs leading-5 text-slate-400">{dashboardActionFootnote}</div>
                </div>
              ) : dashboardStatsCard}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={headerLayoutClass}>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-honey-200 bg-honey-50 px-3 py-1 text-sm text-honey-700">
              <Sparkles className="h-4 w-4" />
              <span>社区 Skills 市场</span>
            </div>
            <div>
              <h1 className={`${compact ? 'text-3xl' : 'text-4xl'} font-bold text-gray-900`}>{title}</h1>
              {subtitle ? (
                <p className="mt-2 max-w-2xl text-sm sm:text-base text-warm-gray-600">{subtitle}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Card className="min-w-[180px] border-honey-200 bg-white/90 shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-warm-gray-500">收录数</div>
                  <div className="mt-2 text-3xl font-semibold text-gray-900">{total}</div>
                </div>
                <Github className="h-8 w-8 text-honey-500" />
              </CardContent>
            </Card>
            {(showRefreshButton || showUploadButton) ? (
              <div className="flex gap-2">
                {showRefreshButton ? (
                  <Button variant="outline" onClick={() => void loadSkills(currentPage)} disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    刷新
                  </Button>
                ) : null}
                {showUploadButton ? (
                  <Button onClick={handleUpload}>
                    {uploadButtonLabel}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-honey-100 shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="h-6 w-2/3 rounded bg-gray-100" />
                  <div className="h-4 w-full rounded bg-gray-100" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-10 rounded bg-gray-100" />
                </CardContent>
              </Card>
            ))
          ) : records.length === 0 ? (
            <Card className="col-span-full border-dashed border-honey-200 bg-honey-50/60">
              <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                <Sparkles className="h-10 w-10 text-honey-500" />
                <h2 className="mt-4 text-xl font-semibold text-gray-900">还没有收录任何 Skill</h2>
                <p className="mt-2 max-w-md text-sm text-warm-gray-600">
                  {emptyStateDescription}
                </p>
                {shouldShowEmptyStateUploadCta ? (
                  <Button className="mt-6" onClick={handleUpload}>去上传</Button>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            records.map((skill) => {
              const isSelected = selectedSkill?.id === skill.id;

              return (
                <Card
                  key={skill.id}
                  className={cn(
                    'cursor-pointer border-honey-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                    isSelected && 'border-honey-300 ring-2 ring-honey-200 shadow-md'
                  )}
                  onClick={() => setSelectedSkill(skill)}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="line-clamp-2 text-xl text-gray-900">{skill.name}</CardTitle>
                        <p className="mt-2 line-clamp-2 text-sm text-warm-gray-600">{skill.summary}</p>
                      </div>
                      <div className="rounded-full bg-honey-50 p-2 text-honey-600">
                        <Github className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-3 border-t border-honey-100 pt-4">
                      <div className="min-w-0 text-xs text-warm-gray-500">
                        更新于 {new Date(skill.updateTime).toLocaleString('zh-CN')}
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        <a href={skill.githubUrl} target="_blank" rel="noreferrer" aria-label="打开 GitHub">
                          <Github className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {pageInfo && pageInfo.pages > 1 && (
          <AdminPagination
            current={pageInfo.current}
            totalPages={pageInfo.pages}
            total={pageInfo.total}
            onChange={(page) => { void loadSkills(page); }}
            mode="full"
          />
        )}
      </div>

      <Dialog open={!!selectedSkill} onOpenChange={(open) => {
        if (!open) {
          setSelectedSkill(null);
        }
      }}>
        <DialogContent
          hideClose
          className="left-auto right-0 top-0 h-screen max-h-screen w-full max-w-[420px] translate-x-0 translate-y-0 overflow-y-auto rounded-none border-l border-honey-200 p-0 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-top-0 sm:max-w-[460px] sm:rounded-none"
        >
          {selectedSkill ? (
            <SkillDetailPanel skill={selectedSkill} className="border-0 shadow-none" />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkillsMarketContent;
