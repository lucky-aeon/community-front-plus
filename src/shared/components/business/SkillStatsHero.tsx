import React from 'react';
import { Code2, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SkillStatsHeroProps {
  totalCount: number;
  isLoading?: boolean;
  isDashboard?: boolean;
}

export const SkillStatsHero: React.FC<SkillStatsHeroProps> = ({ totalCount, isLoading = false, isDashboard = false }) => {
  return (
    <div className="border-b border-honey-100 bg-gradient-to-br from-honey-50 via-white to-orange-50/70">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-honey-200 bg-white/80 px-3 py-1 text-sm font-medium text-honey-700">
              <Sparkles className="h-4 w-4" />
              社区公开技能市场
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Skills</h1>
              <p className="max-w-2xl text-sm leading-6 text-warm-gray-600 sm:text-base">
                {isDashboard ? '在社区内发现可复用的公开技能方案，快速找到值得参考的能力沉淀。' : '浏览社区公开分享的技能方案，从简介到完整说明都可以直接查看。'}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-honey-200 bg-white/90 p-6 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-honey-100 text-honey-700">
              <Code2 className="h-6 w-6" />
            </div>
            <div className="mt-4 text-sm font-medium text-warm-gray-500">公开 Skills 总数</div>
            <div className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
              {isLoading ? <Skeleton className="h-10 w-28" /> : totalCount.toLocaleString('zh-CN')}
            </div>
            <div className="mt-2 text-sm text-warm-gray-500">基于公开统计接口实时展示</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillStatsHero;
