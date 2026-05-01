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

function buildTourSteps(installCommand?: string): TourStep[] {
  const steps: TourStep[] = [
    {
      target: 'brand',
      title: '你已开通敲鸭 Plus',
      description: '这个导览会在开通 Plus 套餐后首次出现，带你认识敲鸭里最常用的内容入口。完整看完后，以后不会重复打扰你。',
    },
  ];

  // 仅当后端配置了安装命令时才显示该步骤
  if (installCommand) {
    steps.push({
      title: '让 AI 先了解敲鸭',
      description: '把这行命令交给 Codex、Claude Code、Cursor、Windsurf 或 OpenClaw 等 Agent 工具执行。安装后，AI 会获得敲鸭的社区说明和查询入口，你可以直接问它有哪些课程、Plus 能看什么、最近更新了什么，或让它按你的目标推荐学习路线。',
      command: installCommand,
    });
  }

  steps.push(
    {
      path: ROUTES.DASHBOARD_HOME,
      target: 'home-ai-daily',
      title: '首页的 AI 日报',
      description: '这是首页里的 AI 日报摘要。每天先看这里，可以快速知道今天有哪些 AI 热点，再决定要不要进入完整日报深读。',
    },
    {
      path: ROUTES.DASHBOARD_HOME,
      target: 'home-learning',
      title: '学习记录',
      description: '这里记录你最近的学习进度。回到这里就能接着上次的课程继续往下看。',
    },
    {
      path: ROUTES.DASHBOARD_HOME,
      target: 'home-pinned-posts',
      title: '推荐文章',
      description: '置顶或重点推荐的文章会出现在这里，适合先了解社区里最有价值的内容。',
    },
    {
      path: ROUTES.DASHBOARD_HOME,
      target: 'home-recent-chapters',
      title: '最新章节',
      description: '最近更新的课程章节会出现在这里。新内容上线后，可以从这里直接进入学习。',
    },
    {
      path: ROUTES.DASHBOARD_HOME,
      target: 'home-recent-articles',
      title: '最新文章',
      description: '社区里最新的文章会出现在这里，适合快速浏览最近发布的内容。',
    },
    {
      path: ROUTES.DASHBOARD_HOME,
      target: 'home-update-logs',
      title: '更新日志',
      description: '这里记录社区最近的更新和变化。如果好奇最近加了什么功能或改了什么，可以从这里查看。',
    },
    {
      path: ROUTES.DASHBOARD_COURSES,
      resolvePath: resolveLatestCourseDetailPath,
      target: 'course-detail-subscribe',
      title: '课程详情订阅',
      description: '这是课程详情页。订阅感兴趣的课程后，可以第一时间收到新章节通知，也能在学习记录里持续追踪进度。',
    },
    {
      path: ROUTES.DASHBOARD_DISCUSSIONS,
      target: 'discussions-content',
      title: '讨论区',
      description: '这里是社区讨论区。学习时遇到问题或想法，可以在这里提问和交流，也能看看别人在聊什么。',
    },
    {
      path: ROUTES.DASHBOARD_INTERVIEWS,
      target: 'interviews-list',
      title: '题库列表',
      description: '这里收录了常见面试题。准备面试或想自测时，可以从这里按主题挑选题目练习。',
    },
    {
      target: 'user-menu',
      title: '用户菜单',
      description: '点击这里可以进入个人设置、查看会员信息或退出登录。如果以后需要修改资料或调整设置，从这里进入就行。',
    },
  );

  return steps;
}

export const PlusCommunityOnboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [commandCopied, setCommandCopied] = useState(false);
  const resolvedPathCacheRef = useRef<Record<number, string>>({});

  const planLevel = Number(user?.currentSubscriptionLevel ?? user?.currentSubscriptionPlanLevel ?? 0);
  const shouldRun = Boolean(user?.id && planLevel >= MIN_PLUS_LEVEL);
  const storageKey = useMemo(() => {
    if (!user?.id) return '';
    return `plus-community-onboarding:${GUIDE_VERSION}:${user.id}`;
  }, [user?.id]);

  useEffect(() => {
    if (!shouldRun) return;

    let cancelled = false;

    const fetchConfig = async () => {
      try {
        const { UserService } = await import('@shared/services/api');
        const config = await UserService.getPlusGuideConfig();
        if (!cancelled) {
          setTourSteps(buildTourSteps(config.installCommand || undefined));
        }
      } catch (error) {
        console.error('获取Plus指引配置失败:', error);
        if (!cancelled) {
          // 降级：不传安装命令
          setTourSteps(buildTourSteps());
        }
      }
    };

    void fetchConfig();

    return () => {
      cancelled = true;
    };
  }, [shouldRun]);

  const activeStep = tourSteps[activeIndex];
  const isFirstStep = activeIndex === 0;
  const isLastStep = activeIndex === tourSteps.length - 1;

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

    // 需要等 tourSteps 加载完成
    if (tourSteps.length === 0) return;

    const timer = window.setTimeout(() => {
      setActiveIndex(0);
      setOpen(true);
    }, 600);

    return () => window.clearTimeout(timer);
  }, [shouldRun, storageKey, user?.plusGuideCompletedAt, tourSteps]);

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
                {activeIndex + 1} / {tourSteps.length}
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
          {tourSteps.map((step, index) => (
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
