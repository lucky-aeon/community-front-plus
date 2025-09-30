import React, { useEffect, useMemo, useState } from 'react';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@shared/utils/cn';
import { ExpressionsService, type ExpressionTypeDTO, ReactionsService, type ReactionSummaryDTO } from '@shared/services/api';
import type { ReactionBusinessType } from '@shared/services/api/reactions.service';

interface ReactionBarProps {
  businessType: ReactionBusinessType;
  businessId: string;
  className?: string;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({ businessType, businessId, className }) => {
  const [expressions, setExpressions] = useState<ExpressionTypeDTO[]>([]);
  const [summaries, setSummaries] = useState<ReactionSummaryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [picking, setPicking] = useState(false);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  const codeToMeta = useMemo(() => {
    const map = new Map<string, { name: string; url?: string }>();
    expressions.forEach(e => map.set(e.code, { name: e.name || e.code, url: ExpressionsService.toImageUrl(e.imageUrl) }));
    return map;
  }, [expressions]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      // 表情列表全局缓存，重复调用也只会请求一次
      const [list, sum] = await Promise.all([
        ExpressionsService.getAll().catch(() => []),
        ReactionsService.getSummary(businessType, businessId).catch(() => []),
      ]);
      setExpressions(list);
      setSummaries(sum);
    } catch (e) {
      console.error('加载表情或统计失败', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSummaries([]);
    void fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, businessType]);

  const sortedSummaries = useMemo(() => {
    return [...summaries].sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [summaries]);

  const toggle = async (code: string) => {
    if (!code || toggling[code]) return;
    setToggling(prev => ({ ...prev, [code]: true }));
    try {
      await ReactionsService.toggle({ businessType, businessId, reactionType: code });
      // 切换后刷新统计，保持与后端一致
      const sum = await ReactionsService.getSummary(businessType, businessId);
      setSummaries(sum);
    } catch (e) {
      console.error('切换表情失败', e);
    } finally {
      setToggling(prev => ({ ...prev, [code]: false }));
    }
  };

  return (
    <div className={cn('mt-3 flex items-center gap-3', className)}>
      {/* 添加表情 */}
      <Popover open={picking} onOpenChange={setPicking}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Smile className="h-4 w-4 mr-2" /> 添加表情
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="text-sm font-medium mb-2">选择一个表情</div>
          <div className="grid grid-cols-4 gap-2 max-h-64 overflow-auto">
            {expressions.map(expr => {
              const url = ExpressionsService.toImageUrl(expr.imageUrl) || '';
              return (
                <button
                  key={expr.code}
                  className="p-2 rounded-lg border hover:bg-honey-50 transition-colors flex items-center justify-center"
                  onClick={() => { setPicking(false); toggle(expr.code); }}
                  title={expr.name || expr.code}
                >
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <img src={url} alt="" className="h-8 w-8 object-contain" />
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* 已有反应列表 */}
      <div className="flex items-center gap-2 flex-wrap">
        {sortedSummaries.length === 0 && !loading && (
          <span className="text-xs text-warm-gray-500">快来第一个添加表情吧</span>
        )}
        {sortedSummaries.map(item => {
          const meta = codeToMeta.get(item.reactionType);
          const url = meta?.url || '';
          const reacted = !!item.userReacted;
          return (
            <Popover key={item.reactionType}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    'h-9 px-2 rounded-full border flex items-center gap-2 transition-colors',
                    reacted ? 'border-emerald-300 bg-emerald-50' : 'hover:bg-honey-50',
                  )}
                  onClick={() => toggle(item.reactionType)}
                  disabled={!!toggling[item.reactionType]}
                >
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <img src={url} alt="" className="h-6 w-6 object-contain" />
                  <span className={cn('text-sm', reacted ? 'text-emerald-700' : 'text-warm-gray-700')}>{item.count || 0}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="flex items-center gap-2 pb-2 mb-2 border-b">
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <img src={url} alt="" className="h-6 w-6" />
                  <div className="text-sm font-medium">{meta?.name || item.reactionType}</div>
                </div>
                <div className="space-y-1 max-h-48 overflow-auto">
                  {(item.users || []).length === 0 ? (
                    <div className="text-xs text-warm-gray-500">暂无用户</div>
                  ) : (
                    (item.users || []).map(u => (
                      <div key={u.userId} className="text-sm text-warm-gray-700 truncate">{u.userName}</div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
};

export default ReactionBar;

