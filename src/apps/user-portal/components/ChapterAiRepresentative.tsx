import React, { useEffect, useMemo, useState } from 'react';
import { Copy, PlayCircle, Search, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChaptersService } from '@shared/services/api';
import { showToast } from '@shared/utils/toast';
import type { ChapterTranscriptDTO, ChapterTranscriptSegmentDTO } from '@shared/types';
import type { VideoPlayerRef } from '@shared/components/ui/VideoPlayer';

interface ChapterAiRepresentativeProps {
  chapterId: string;
  videoPlayerRef: React.RefObject<VideoPlayerRef | null>;
}

const RUNNING_STATUSES = new Set(['PENDING', 'SUBMITTED', 'RUNNING']);

export const ChapterAiRepresentative: React.FC<ChapterAiRepresentativeProps> = ({ chapterId, videoPlayerRef }) => {
  const [transcript, setTranscript] = useState<ChapterTranscriptDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  const loadTranscript = async () => {
    try {
      setLoading(true);
      const data = await ChaptersService.getChapterTranscript(chapterId);
      setTranscript(data);
    } catch (e) {
      console.error('加载章节文字稿失败:', e);
      setTranscript({ chapterId, status: 'FAILED' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTranscript();
  }, [chapterId]);

  useEffect(() => {
    if (!transcript || !RUNNING_STATUSES.has(transcript.status)) return;
    const timer = window.setInterval(loadTranscript, 10000);
    return () => window.clearInterval(timer);
  }, [transcript?.status, chapterId]);

  const segments = useMemo(() => {
    const source = transcript?.segments || [];
    const q = keyword.trim().toLowerCase();
    if (!q) return source;
    return source.filter((segment) => segment.text.toLowerCase().includes(q));
  }, [transcript?.segments, keyword]);

  const statusLabel = statusText(transcript?.status);
  const isReady = transcript?.status === 'SUCCEEDED';
  const isRunning = transcript?.status ? RUNNING_STATUSES.has(transcript.status) : false;
  const shouldRender = loading || isReady || isRunning || transcript?.status === 'FAILED' || transcript?.status === 'CANCELLED';

  const seekTo = (segment: ChapterTranscriptSegmentDTO) => {
    if (segment.startMs === undefined || !videoPlayerRef.current?.videoElement) return;
    videoPlayerRef.current.videoElement.currentTime = Math.max(0, segment.startMs / 1000);
    videoPlayerRef.current.videoElement.play().catch(() => {});
  };

  const copyText = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast.success('已复制到剪贴板');
    } catch {
      showToast.error('复制失败，请手动复制');
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <section className="rounded-lg border border-honey-200 bg-honey-50/40 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-honey-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900">AI 课代表</h2>
        </div>
        <Badge variant={isReady ? 'default' : 'secondary'}>{loading ? '加载中' : statusLabel}</Badge>
      </div>

      {isRunning && (
        <div className="text-sm text-warm-gray-600">AI 课代表正在整理本节内容。</div>
      )}

      {(transcript?.status === 'FAILED' || transcript?.status === 'CANCELLED') && (
        <div className="text-sm text-warm-gray-600">文字稿暂不可用。</div>
      )}

      {isReady && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
            <TabsTrigger value="summary">AI 总结</TabsTrigger>
            <TabsTrigger value="points">知识点</TabsTrigger>
            <TabsTrigger value="transcript">文字稿</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-3">
            <div className="text-sm leading-7 text-gray-800 whitespace-pre-wrap">
              {transcript.summary || '暂无总结。'}
            </div>
            {transcript.summary && (
              <Button variant="outline" size="sm" onClick={() => copyText(transcript.summary)}>
                <Copy className="h-4 w-4 mr-1" />
                复制总结
              </Button>
            )}
          </TabsContent>

          <TabsContent value="points">
            {(transcript.keyPoints?.length ?? 0) > 0 ? (
              <ul className="space-y-2 text-sm text-gray-800">
                {transcript.keyPoints!.map((point, index) => (
                  <li key={`${index}-${point}`} className="flex gap-2 leading-6">
                    <span className="text-honey-700 font-medium">{index + 1}.</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-warm-gray-600">暂无知识点。</div>
            )}
          </TabsContent>

          <TabsContent value="transcript" className="space-y-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-400" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索文字稿"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-warm-gray-500">
              <PlayCircle className="h-3.5 w-3.5" />
              <span>点击任意文字稿可跳转到对应视频时间点</span>
            </div>
            <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
              {segments.length === 0 ? (
                <div className="text-sm text-warm-gray-600">没有匹配的文字稿内容。</div>
              ) : (
                segments.map((segment, index) => (
                  <div
                    key={`${segment.startMs}-${index}`}
                    role="button"
                    tabIndex={0}
                    className="rounded-md border bg-white/80 p-3 cursor-pointer transition-colors hover:border-honey-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400"
                    onClick={() => seekTo(segment)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        seekTo(segment);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        className="text-xs font-mono tabular-nums text-honey-700 hover:text-honey-900 shrink-0 mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          seekTo(segment);
                        }}
                      >
                        {formatTime(segment.startMs)}
                      </button>
                      <div className="text-sm leading-6 text-gray-800 flex-1">{segment.text}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyText(segment.text);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </section>
  );
};

function statusText(status?: string): string {
  switch (status) {
    case 'SUCCEEDED':
      return '已生成';
    case 'PENDING':
    case 'SUBMITTED':
    case 'RUNNING':
      return '生成中';
    case 'FAILED':
      return '失败';
    case 'CANCELLED':
      return '已取消';
    case 'NOT_GENERATED':
      return '未生成';
    default:
      return '加载中';
  }
}

function formatTime(ms?: number): string {
  if (ms === undefined || !Number.isFinite(ms)) return '00:00';
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
