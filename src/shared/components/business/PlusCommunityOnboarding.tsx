import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Copy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { CoursesService } from '@shared/services/api';
import { ROUTES, routeUtils } from '@shared/routes/routes';
import { cn } from '@shared/utils/cn';
import { showToast } from '@shared/utils/toast';

type TourStep = {
  path?: string;
  resolvePath?: () => Promise<string | undefined>;
  target?: string;
  title: string;
  description: string;
  command?: string;
};

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const GUIDE_VERSION = 'v4';
const MIN_PLUS_LEVEL = 2;
const QIAOYA_INSTALL_COMMAND = 'curl -fsSL https://code.xhyovo.cn/install | sh';

const resolveLatestCourseDetailPath = async () => {
  try {
    const page = await CoursesService.getFrontCoursesList({ pageNum: 1, pageSize: 1 });
    const latestCourse = page.records[0];
    return latestCourse?.id ? routeUtils.getCourseDetailRoute(latestCourse.id) : ROUTES.DASHBOARD_COURSES;
  } catch (error) {
    console.error('获取导览课程失败:', error);
    return ROUTES.DASHBOARD_COURSES;
  }
};

const TOUR_STEPS: TourStep[] = [
  {
    target: 'brand',
    title: '你已开通敲鸭 Plus',
    description: '这个导览会在开通 Plus 套餐后首次出现，带你认识敲鸭里最常用的内容入口。完整看完后，以后不会重复打扰你。',
  },
  {
    title: '让 AI 先了解敲鸭',
    description: '把这行命令交给 Codex、Claude Code、Cursor、Windsurf 或 OpenClaw 等 Agent 工具执行。安装后，AI 会获得敲鸭的社区说明和查询入口，你可以直接问它有哪些课程、Plus 能看什么、最近更新了什么，或让它按你的目标推荐学习路线。',
    command: QIAOYA_INSTALL_COMMAND,
  },
  {
    path: ROUTES.DASHBOARD_HOME,
    target: 'home-ai-daily',
    title: '首页的 AI 日报',
    description: '这是首页里的 AI 日报摘要。每天先看这里，可以快速知道今天有哪些 AI 热点，再决定要不要进入完整日报深读。',
  },
  {
    path: ROUTES.DASHBOARD_HOME,
    target: 'home-learning',
    title: '继续学习',
    description: '最近学习会记录你上次看到的课程和章节。下次回来时直接从这里继续，不用重新找课程位置。',
  },
  {
    path: ROUTES.DASHBOARD_HOME,
    target: 'home-pinned-posts',
    title: '置顶推荐文章',
    description: '置顶推荐是社区希望你优先看的文章或讨论。遇到方向不明确时，先从这里看精选内容。',
  },
  {
    path: ROUTES.DASHBOARD_HOME,
    target: 'home-recent-chapters',
    title: '最新章节',
    description: '最新章节告诉你课程最近更新了什么。看到感兴趣的章节，可以直接进入课程或章节详情。',
  },
  {
    path: ROUTES.DASHBOARD_HOME,
    target: 'home-recent-articles',
    title: '最新文章',
    description: '最新文章是社区内容流的核心单元。这里能看到文章标题、摘要、作者和互动数据，适合快速判断是否值得打开。',
  },
  {
    path: ROUTES.DASHBOARD_HOME,
    target: 'home-update-logs',
    title: '首页更新日志',
    description: '这个小模块会提示近期平台功能变化。点击任意更新可以看详情，方便你知道哪些入口或能力刚上线。',
  },
  {
    resolvePath: resolveLatestCourseDetailPath,
    target: 'course-detail-subscribe',
    title: '课程详情里的订阅课程',
    description: '这里的“订阅课程”不是购买套餐，而是关注这门课。订阅后，课程新增章节、资料或其它更新时，你会收到通知；如果课程提供在线演示，也可以在详情页直接查看项目效果。',
  },
  {
    path: ROUTES.DASHBOARD_DISCUSSIONS,
    target: 'discussions-content',
    title: '讨论区的文章和问答',
    description: '讨论区可以切换全部、文章和问答，也可以搜索标题。找不到答案时再发布问题，标题和背景越清楚越容易被回应。',
  },
  {
    path: ROUTES.DASHBOARD_INTERVIEWS,
    target: 'interviews-list',
    title: '题库列表',
    description: '题库卡片会展示难度、分类、标签和互动数据。适合按知识点查漏补缺，也适合准备面试。',
  },
  {
    target: 'user-menu',
    title: '用户中心找回你的动作',
    description: '右上角头像里可以进入用户中心、会员与服务、CDK 激活和消息中心。收藏、评论、学习记录、设备管理都从这里回看。',
  },
];

export const PlusCommunityOnboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [commandCopied, setCommandCopied] = useState(false);
  const resolvedPathCacheRef = useRef<Record<number, string>>({});

  const planLevel = Number(user?.currentSubscriptionLevel ?? user?.currentSubscriptionPlanLevel ?? 0);
  const shouldRun = Boolean(user?.id && planLevel >= MIN_PLUS_LEVEL);
  const storageKey = useMemo(() => {
    if (!user?.id) return '';
    return `plus-community-onboarding:${GUIDE_VERSION}:${user.id}`;
  }, [user?.id]);

  const activeStep = TOUR_STEPS[activeIndex];
  const isFirstStep = activeIndex === 0;
  const isLastStep = activeIndex === TOUR_STEPS.length - 1;

  useEffect(() => {
    if (!open || !activeStep) return;

    let cancelled = false;

    const syncStepPath = async () => {
      const cachedPath = resolvedPathCacheRef.current[activeIndex];
      const nextPath = cachedPath ?? (activeStep.resolvePath ? await activeStep.resolvePath() : activeStep.path);

      if (cancelled || !nextPath) return;

      if (activeStep.resolvePath && !cachedPath) {
        resolvedPathCacheRef.current[activeIndex] = nextPath;
      }

      if (location.pathname !== nextPath) {
        setTargetRect(null);
        navigate(nextPath);
      }
    };

    void syncStepPath();

    return () => {
      cancelled = true;
    };
  }, [activeIndex, activeStep, location.pathname, navigate, open]);

  useEffect(() => {
    if (!shouldRun || !storageKey) {
      setOpen(false);
      return;
    }

    // 优先使用后端状态
    if (user?.plusGuideCompletedAt) return;

    // 降级：检查 localStorage
    const completed = window.localStorage.getItem(storageKey);
    if (completed) return;

    const timer = window.setTimeout(() => {
      setActiveIndex(0);
      setOpen(true);
    }, 600);

    return () => window.clearTimeout(timer);
  }, [shouldRun, storageKey, user?.plusGuideCompletedAt]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const resolveTargetRect = useCallback(() => {
    if (!open || !activeStep?.target) {
      setTargetRect(null);
      return;
    }

    const candidates = Array.from(document.querySelectorAll<HTMLElement>(`[data-plus-guide="${activeStep.target}"]`));
    const visibleTarget = candidates.find((el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    });

    if (!visibleTarget) {
      setTargetRect(null);
      return;
    }

    const initialRect = visibleTarget.getBoundingClientRect();
    if (initialRect.top < 96 || initialRect.bottom > window.innerHeight - 96) {
      visibleTarget.scrollIntoView({ block: 'center', inline: 'nearest' });
    }

    const rect = visibleTarget.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, [activeStep?.target, open]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(resolveTargetRect);
    const interval = window.setInterval(resolveTargetRect, 300);
    window.addEventListener('resize', resolveTargetRect);
    window.addEventListener('scroll', resolveTargetRect, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
      window.removeEventListener('resize', resolveTargetRect);
      window.removeEventListener('scroll', resolveTargetRect, true);
    };
  }, [open, activeIndex, location.pathname, resolveTargetRect]);

  useEffect(() => {
    setCommandCopied(false);
  }, [activeIndex]);

  const completeGuide = async () => {
    // 调用后端接口标记完成
    try {
      const { UserService } = await import('@shared/services/api');
      await UserService.completePlusGuide();
    } catch (error) {
      console.error('标记Plus指引完成失败:', error);
    }

    // 同时写入 localStorage（降级）
    if (storageKey) {
      window.localStorage.setItem(storageKey, new Date().toISOString());
    }
    setOpen(false);
  };

  const goNext = () => {
    if (isLastStep) {
      void completeGuide();
      return;
    }
    setActiveIndex((value) => value + 1);
  };

  const goPrevious = () => {
    if (isFirstStep) return;
    setActiveIndex((value) => value - 1);
  };

  const copyCommand = async () => {
    if (!activeStep.command) return;
    try {
      await navigator.clipboard.writeText(activeStep.command);
      setCommandCopied(true);
      showToast.success('命令已复制');
    } catch (error) {
      console.error('复制敲鸭安装命令失败:', error);
      showToast.error('复制失败，请手动复制');
    }
  };

  if (!open || !activeStep) return null;

  const popoverWidth = Math.min(392, Math.max(320, window.innerWidth - 32));
  const targetPadding = 8;
  const highlightStyle = targetRect
    ? {
        top: targetRect.top - targetPadding,
        left: targetRect.left - targetPadding,
        width: targetRect.width + targetPadding * 2,
        height: targetRect.height + targetPadding * 2,
      }
    : undefined;

  const popoverStyle = targetRect
    ? getPopoverStyle(targetRect, popoverWidth)
    : {
        left: '50%',
        top: '50%',
        width: popoverWidth,
        transform: 'translate(-50%, -50%)',
      };

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-labelledby="plus-community-onboarding-title">
      <div className={cn('fixed inset-0', targetRect ? 'bg-transparent' : 'bg-slate-950/70')} />

      {targetRect && (
        <div
          className="fixed rounded-xl border-2 border-white bg-white/10 shadow-[0_0_0_9999px_rgba(15,23,42,0.68),0_18px_45px_rgba(15,23,42,0.25)] ring-4 ring-honey-300/80"
          style={highlightStyle}
        />
      )}

      <div
        className="fixed rounded-lg border border-honey-100 bg-white p-5 shadow-2xl"
        style={popoverStyle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-honey-100 text-honey-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-honey-700">
                {activeIndex + 1} / {TOUR_STEPS.length}
              </div>
              <h2 id="plus-community-onboarding-title" className="text-base font-semibold text-gray-900">
                {activeStep.title}
              </h2>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-warm-gray-600">{activeStep.description}</p>

        {activeStep.command && (
          <div className="mt-4 rounded-lg border border-honey-100 bg-honey-50/70 p-3">
            <div className="mb-2 text-xs font-medium text-honey-700">macOS / Linux 一键安装</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 overflow-x-auto rounded-md bg-white px-3 py-2 text-xs font-semibold text-amber-800">
                {activeStep.command}
              </code>
              <Button type="button" variant="outline" size="sm" onClick={copyCommand} className="shrink-0">
                {commandCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {commandCopied ? '已复制' : '复制'}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-1">
          {TOUR_STEPS.map((step, index) => (
            <div
              key={step.title}
              className={cn(
                'h-1.5 rounded-full transition-all',
                index === activeIndex ? 'w-8 bg-honey-500' : 'w-2 bg-honey-100'
              )}
            />
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <div className="flex gap-2">
            <Button variant="ghost" onClick={goPrevious} disabled={isFirstStep}>
              <ArrowLeft className="h-4 w-4" />
              上一步
            </Button>
            <Button onClick={goNext}>
              {isLastStep ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  我已了解
                </>
              ) : (
                <>
                  下一步
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

function getPopoverStyle(targetRect: TargetRect, width: number): React.CSSProperties {
  const gap = 18;
  const margin = 16;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const left = clamp(targetRect.left + targetRect.width / 2 - width / 2, margin, viewportWidth - width - margin);
  const preferredTop = targetRect.top + targetRect.height + gap;
  const top = preferredTop + 260 > viewportHeight
    ? Math.max(margin, targetRect.top - 286)
    : preferredTop;

  return {
    left,
    top,
    width,
  };
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}
