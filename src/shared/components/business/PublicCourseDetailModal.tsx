import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen, Clock, ExternalLink, Star, Tags } from 'lucide-react';
import { PublicCoursesService } from '@shared/services/api';
import { PublicCourseDetailDTO } from '@shared/types';
import { CoursesService } from '@shared/services/api';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';

interface PublicCourseDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId?: string | null;
}

export const PublicCourseDetailModal: React.FC<PublicCourseDetailModalProps> = ({ open, onOpenChange, courseId }) => {
  const [detail, setDetail] = useState<PublicCourseDetailDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!open || !courseId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await PublicCoursesService.getPublicCourseDetail(courseId);
        setDetail(data);
      } catch (e) {
        console.error('加载公开课程详情失败', e);
        setError('课程详情加载失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [open, courseId]);

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-';

  const firstChapter = useMemo(() => {
    if (!detail?.chapters?.length) return undefined;
    return [...detail.chapters].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  }, [detail]);

  const openUrl = (url?: string | null) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>课程详情</DialogTitle>
        </DialogHeader>

        {/* 加载/错误状态 */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-7 w-2/3" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="p-4 lg:col-span-2 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
              <Card className="p-4 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </Card>
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>加载失败</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : detail ? (
          <div className="space-y-4">
            {/* 顶部信息 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-900 line-clamp-2">{detail.title}</h2>
                <div className="shrink-0 flex items-center gap-2">
                  {detail.demoUrl && (
                    <Button variant="secondary" size="sm" onClick={() => openUrl(detail.demoUrl)}>
                      <ExternalLink className="h-4 w-4 mr-1" /> 在线演示
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-warm-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{(detail.rating ?? 0).toFixed(1)}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-warm-gray-300" />
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{CoursesService.formatReadingTime(detail.totalReadingTime)}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-warm-gray-300" />
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{(detail.chapters ?? []).length} 章节</span>
                </div>
              </div>
            </div>

            {/* 主体内容 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* 左侧：简介与标签 */}
              <Card className="p-4 lg:col-span-2 space-y-3">
                <h3 className="text-base font-semibold">课程介绍</h3>
                <div className="prose-content">
                  <MarkdownEditor
                    value={detail.description || ''}
                    onChange={() => {}}
                    previewOnly
                    height="auto"
                    toolbar={false}
                    enableFullscreen={false}
                    enableToc={false}
                    className="!border-none !shadow-none !bg-transparent"
                  />
                </div>

                {/* 技术栈与标签 */}
                <div className="pt-1 space-y-2">
                  {(detail.techStack?.length ?? 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <Tags className="h-4 w-4 text-honey-600" />
                      <div className="flex flex-wrap gap-2">
                        {detail.techStack!.map((t) => (
                          <Badge key={t} className="bg-honey-50 text-honey-700 border-honey-200">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {(detail.tags?.length ?? 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-warm-gray-500">分类标签</span>
                      <div className="flex flex-wrap gap-2">
                        {detail.tags!.map((t) => (
                          <Badge key={t} className="bg-sage-50 text-sage-700 border-sage-200">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* 右侧：章节列表（仅展示，不可点击） */}
              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">课程章节</h3>
                  <span className="text-xs text-warm-gray-500">共 {(detail.chapters ?? []).length} 章</span>
                </div>
                {(detail.chapters ?? []).length === 0 ? (
                  <div className="text-sm text-warm-gray-600">暂无章节</div>
                ) : (
                  <div className="space-y-2 pr-1">
                    {[...(detail.chapters ?? [])]
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((ch, idx) => (
                        <div
                          key={ch.id}
                          className="w-full text-left p-3 rounded-lg border bg-white"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-warm-gray-500 w-10">#{idx + 1}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">{ch.title}</div>
                                <div className="text-xs text-warm-gray-500 flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" /> 预计 {ch.readingTime} 分钟
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
