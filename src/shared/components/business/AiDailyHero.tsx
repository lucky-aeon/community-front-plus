import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Sparkles } from 'lucide-react';
import { AppAiNewsService } from '@shared/services/api';
import type { TodayDailyDTO } from '@shared/types';
import { useNavigate } from 'react-router-dom';

/**
 * 首页顶部横幅：AI 日报摘要
 * - 展示今日（后端 latest）AI 日报的前若干条标题
 * - 提供跳转到 AI 日报页面的 CTA
 */
export const AiDailyHero: React.FC = () => {
  const [today, setToday] = useState<TodayDailyDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await AppAiNewsService.getToday();
        if (!cancelled) setToday(data);
      } catch (e) {
        console.error('加载AI日报摘要失败:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const titles = today?.titles ?? [];
  const title = useMemo(() => {
    const t = titles.slice(0, 3).filter(Boolean).join('；');
    return t || '今日 AI 日报';
  }, [titles]);

  const dateText = useMemo(() => {
    if (!today?.date) return '';
    try { return new Date(today.date).toLocaleDateString('zh-CN'); } catch { return today.date; }
  }, [today]);

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs md:text-sm">
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="mt-4">
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
      </Card>
    );
  }

  if (!titles.length) return null;

  return (
    <section className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="grid grid-cols-1 md:grid-cols-5">
        <div className="md:col-span-3 p-6 md:p-8">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-3 py-1 text-xs md:text-sm">
            <Calendar className="w-3.5 h-3.5" />
            {dateText && <span>{dateText}</span>}
            <span className="opacity-80">AI 日报</span>
          </div>
          <h2 className="mt-4 text-xl md:text-2xl font-bold leading-snug">
            {title}
          </h2>
          <Button
            onClick={() => navigate(today?.date ? `/dashboard/ai-news/daily/${encodeURIComponent(today.date)}` : '/dashboard/ai-news')}
            className="mt-6 bg-honey-500 hover:bg-honey-600"
          >
            查看日报
          </Button>
        </div>
        <div className="md:col-span-2 p-6 md:p-8 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_60%)]" />
          <div className="relative h-full flex items-center justify-center">
            <Sparkles className="w-20 h-20 text-honey-400 opacity-80" />
          </div>
        </div>
      </div>
      <div className="bg-white text-gray-900 p-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-honey-600">★</span>
          <span>包含 {titles.length} 个 AI 热点话题内容</span>
        </div>
        <ol className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 list-decimal list-inside">
          {titles.slice(0, 10).map((t, idx) => (
            <li key={idx} className="truncate">{t}</li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default AiDailyHero;
