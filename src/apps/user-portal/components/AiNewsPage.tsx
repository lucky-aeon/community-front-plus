import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Calendar, Newspaper, Sparkles } from 'lucide-react';
import { AppAiNewsService } from '@shared/services/api';
import { sanitizeHtml } from '@shared/utils/sanitize-html';
import type { HistoryDateDTO, FrontDailyItemDTO, DailyQueryRequest } from '@shared/types';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
// 分页在日期视图不再使用，此处不引入 AdminPagination

export const AiNewsPage: React.FC = () => {
  const [dates, setDates] = useState<HistoryDateDTO[]>([]);
  const [query, setQuery] = useState<DailyQueryRequest>({ pageNum: 1, pageSize: 10, date: undefined, withContent: false });
  const [items, setItems] = useState<FrontDailyItemDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });
  const listAnchor = React.useRef<HTMLDivElement | null>(null);
  const [pastPreview, setPastPreview] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { date: dateParamFromPath } = useParams();

  const loadDates = useCallback(async () => {
    try {
      const ds = await AppAiNewsService.getHistoryDates();
      setDates(ds);
    } catch (e) { console.error('加载AI日报日期失败:', e); }
  }, []);

  const loadDaily = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await AppAiNewsService.getDaily(query);
      const records = resp.records || [];
      setItems(records);
      setPagination({ current: resp.current, size: resp.size, total: resp.total, pages: resp.pages });
    } catch (e) {
      console.error('加载AI日报列表失败:', e);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { loadDates(); }, [loadDates]);
  // 当 URL 上携带 date 参数时，等 query 同步后再加载，避免先拉“最新”的 10 条
  useEffect(() => {
    if (dateParamFromPath && query.date !== dateParamFromPath) return;
    loadDaily();
  }, [query.pageNum, query.pageSize, query.date, query.withContent, loadDaily, dateParamFromPath]);

  const onPageChange = (p: number) => setQuery(prev => ({ ...prev, pageNum: p }));
  const formatDateTime = (s?: string) => !s ? '-' : new Date(s).toLocaleString('zh-CN');
  const activeDate = query.date || 'latest';
  const latestDate = useMemo(() => (dates.length > 0 ? dates[0].date : undefined), [dates]);
  const displayPastDates = useMemo(() => dates.filter(d => d.date !== latestDate).slice(0, 6), [dates, latestDate]);

  // 从 URL 同步查询条件，并在日期视图一次性拉全当天内容
  useEffect(() => {
    const dateParam = dateParamFromPath || searchParams.get('date') || undefined;
    setQuery(prev => {
      const next = {
        ...prev,
        date: dateParam,
        pageNum: 1,
        pageSize: dateParam ? 1000 : (prev.pageSize ?? 10),
        // 后端已在 daily 接口返回完整数据，是否带上 withContent 均可
        withContent: !!dateParam,
      };
      if (
        prev.date === next.date &&
        prev.pageNum === next.pageNum &&
        prev.pageSize === next.pageSize &&
        prev.withContent === next.withContent
      ) {
        return prev;
      }
      return next;
    });
  }, [dateParamFromPath, searchParams]);
  const listSection = useMemo(() => {
    if (activeDate === 'latest') return null;
    if (loading && items.length === 0) {
      return (
        <div className="space-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      );
    }
    if (items.length === 0) {
      return <div className="text-center text-muted-foreground py-10">暂无数据</div>;
    }
    return (
      <article className="max-w-3xl mx-auto">
        {/* 标题预留（无导语/无日期） */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">AI 日报</h1>
        </header>

        {/* 条目分节渲染 */}
        <div className="prose prose-neutral max-w-none">
          {items.map((it, idx) => (
            <section key={it.id} className="py-6">
              <h2 className="not-prose text-xl font-semibold leading-snug mb-2">
                {idx + 1}、{it.title}
              </h2>
              <div className="prose prose-neutral max-w-none content-html">
                {it.content && it.content.trim() !== '' ? (
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(it.content) }} />
                ) : (
                  <div className="text-muted-foreground">暂无正文</div>
                )}
              </div>
              {/* 原文按钮按需隐藏（按需求删除） */}
            </section>
          ))}
        </div>
      </article>
    );
  }, [activeDate, loading, items]);

  // 预取往期摘要（仅在“最新”视图）
  useEffect(() => {
    const loadPreviews = async () => {
      if (activeDate !== 'latest') return;
      const k = 4; // 取最近4天
      const targets = displayPastDates.slice(0, k);
      if (targets.length === 0) return;
      try {
        const results = await Promise.all(
          targets.map(async (d) => {
            try {
              const resp = await AppAiNewsService.getDaily({ date: d.date, pageNum: 1, pageSize: 3 });
              const title = (resp.records || []).slice(0, 3).map(i => i.title).join('；');
              return [d.date, title] as const;
            } catch (e) {
              console.error('加载往期预览失败:', d.date, e);
              return [d.date, 'AI 日报'] as const;
            }
          })
        );
        const map: Record<string, string> = {};
        results.forEach(([date, title]) => { map[date] = title || 'AI 日报'; });
        setPastPreview(map);
      } catch (e) {
        console.error('加载往期预览失败:', e);
      }
    };
    void loadPreviews();
  }, [activeDate, displayPastDates.length]);
  const gotoList = () => {
    // 跳转到当日路由，展示完整列表
    const dateFromItems = items[0]?.publishedAt ? String(items[0].publishedAt).slice(0, 10) : undefined;
    const date = latestDate || dateFromItems;
    if (date) navigate(`/dashboard/ai-news/daily/${encodeURIComponent(date)}`);
  };
  const gotoDate = (d: string) => {
    navigate(`/dashboard/ai-news/daily/${encodeURIComponent(d)}`);
  };
  // 监听 URL 中的 date 参数，驱动查询条件
  useEffect(() => {
    const dateParam = dateParamFromPath || searchParams.get('date') || undefined;
    setQuery(prev => {
      if (prev.date === dateParam && prev.pageNum === 1) return prev;
      return { ...prev, date: dateParam, pageNum: 1 };
    });
  }, [searchParams, dateParamFromPath]);

  const isDateRoute = !!(dateParamFromPath || searchParams.get('date'));
  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-honey-600" />
        <h1 className="text-xl font-semibold">AI 日报</h1>
        <div className="ml-auto flex items-center gap-2">
          {activeDate !== 'latest' && (
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/ai-news')}>回到今日</Button>
          )}
          <Button variant="outline" size="sm" onClick={() => loadDaily()} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-1" /> 刷新
          </Button>
        </div>
      </div>

      <div className="pt-2">
          {/* 今日头条式摘要（仅在“非日期路由”的最新视图展示） */}
          {activeDate === 'latest' && !isDateRoute && (
            <section className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
              <div className="grid grid-cols-1 md:grid-cols-5">
                <div className="md:col-span-3 p-6 md:p-8">
                  <div className="inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-3 py-1 text-xs md:text-sm">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDateTime(items[0]?.publishedAt)}</span>
                    <span className="opacity-80">AI 日报</span>
                  </div>
                  <h2 className="mt-4 text-xl md:text-2xl font-bold leading-snug">
                    {(() => {
                      const t = items.slice(0, 3).map(i => i.title).join('；');
                      return t || '今日 AI 日报';
                    })()}
                  </h2>
                  <Button onClick={gotoList} className="mt-6 bg-honey-500 hover:bg-honey-600">
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
                  <span>包含 {pagination.total} 个 AI 热点话题内容</span>
                </div>
                <ol className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 list-decimal list-inside">
                  {items.slice(0, 10).map((i) => (
                    <li key={i.id} className="truncate">{i.title}</li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {/* 往期日报（缩略卡片） - 仅在最新日期时展示 */}
          {activeDate === 'latest' && (
            <section className="mt-8">
              <div className="text-sm text-muted-foreground mb-3">往期日报~</div>
              <div className="space-y-6">
                {displayPastDates.map(d => (
                  <div key={d.date} className="rounded-2xl overflow-hidden bg-gray-900 text-white">
                    <div className="p-6 md:p-8">
                      <div className="inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-3 py-1 text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{d.date} AI 日报</span>
                      </div>
                      <h3 className="mt-4 text-xl font-semibold leading-snug">
                        {pastPreview[d.date] || 'AI 日报'}
                      </h3>
                      <div className="mt-2 text-sm opacity-80">AI 日报共 {d.count} 个热点内容</div>
                      <Button onClick={() => gotoDate(d.date)} className="mt-5 bg-white text-gray-900 hover:bg-gray-100">查看日报</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 卡片列表（仅在选择某个具体日期时展示） */}
          <div ref={listAnchor} />
          {listSection}

          {/* 日期视图不使用分页，全部展示 */}
      </div>
    </div>
  );
};

export default AiNewsPage;
