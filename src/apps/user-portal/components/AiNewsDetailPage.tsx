import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppAiNewsService } from '@shared/services/api';
import { sanitizeHtml } from '@shared/utils/sanitize-html';
import type { FrontDailyItemDTO } from '@shared/types';
import { ArrowLeft, ExternalLink, Newspaper } from 'lucide-react';

export const AiNewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<FrontDailyItemDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await AppAiNewsService.getDetail(id);
        if (!cancelled) setItem(data);
      } catch (e) { console.error('加载日报详情失败:', e); }
      finally { setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const formatDateTime = (s?: string) => !s ? '-' : new Date(s).toLocaleString('zh-CN');

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} title="返回">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Newspaper className="w-5 h-5 text-honey-600" />
        <h1 className="text-xl font-semibold">AI 日报详情</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          {!item ? (
            <div className="text-muted-foreground">{loading ? '加载中...' : '未找到内容'}</div>
          ) : (
            <article className="max-w-none">
              <header className="mb-5">
                <h2 className="text-2xl font-bold leading-snug text-gray-900">{item.title}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
                  <span className="px-2 py-0.5 rounded bg-honey-50 text-honey-700 border border-honey-100">{item.source}</span>
                  <span className="text-muted-foreground">发布时间：{formatDateTime(item.publishedAt)}</span>
                  <span className="text-muted-foreground">抓取时间：{formatDateTime(item.fetchedAt)}</span>
                </div>
              </header>
              <div className="prose prose-neutral max-w-none content-html" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content || item.summary || '') }} />
              <div className="mt-6">
                <Button asChild variant="outline">
                  <a href={item.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" /> 前往原文
                  </a>
                </Button>
              </div>
            </article>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AiNewsDetailPage;
