import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowUpRight, RefreshCw, Star } from 'lucide-react';
import { Header } from '@shared/components/common/Header';
import { AuthModal } from '@shared/components/business/AuthModal';
import { ContactUsDialog } from '@shared/components/common/ContactUsDialog';
import { PrivacyModal, TermsModal } from '@shared/components/common/LegalModals';
import { MarketingFooter } from './MarketingFooter';
import { CreatorAboutService } from '@shared/services/api';
import type { CreatorAboutPageDTO } from '@shared/types';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';
import { Skeleton } from '@/components/ui/skeleton';

const CURRENT_YEAR = new Date().getFullYear();

const BilibiliIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 10a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v6a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4v-6" />
    <path d="M8 3l2 3" />
    <path d="M16 3l-2 3" />
    <path d="M9 13v-2" />
    <path d="M15 11v2" />
  </svg>
);

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const AboutPageLoading: React.FC = () => (
  <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_30%),linear-gradient(180deg,_#fffaf2_0%,_#ffffff_62%)]">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="rounded-[32px] border border-amber-100 bg-white/90 shadow-[0_20px_80px_rgba(15,23,42,0.08)] p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.25fr,0.75fr]">
          <div>
            <Skeleton className="h-4 w-24 mb-5" />
            <Skeleton className="h-12 w-64 mb-6" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-5/6 mb-2" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <div className="rounded-[28px] border border-amber-100 p-6 space-y-4">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-[28px] border border-slate-200 bg-white p-6">
            <Skeleton className="h-7 w-40 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5 mb-4" />
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </main>
);

const AboutPageEmpty: React.FC = () => (
  <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_30%),linear-gradient(180deg,_#fffaf2_0%,_#ffffff_62%)]">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <section className="rounded-[32px] border border-dashed border-amber-200 bg-white/90 px-8 py-16 text-center shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">内容准备中</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          关于我页面暂未配置完成。你可以先回到首页继续了解课程和社区，也可以稍后再来查看。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/"
            className="inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            返回首页
          </a>
          <a
            href="/#pricing"
            className="inline-flex items-center rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            查看会员与服务
          </a>
        </div>
      </section>
    </div>
  </main>
);

const AboutPageError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_30%),linear-gradient(180deg,_#fffaf2_0%,_#ffffff_62%)]">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <section className="rounded-[32px] border border-dashed border-red-200 bg-white/90 px-8 py-16 text-center shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">加载失败</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          页面内容加载出错，请稍后重试。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            重试
          </button>
          <a
            href="/"
            className="inline-flex items-center rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            返回首页
          </a>
        </div>
      </section>
    </div>
  </main>
);

function formatStars(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(count);
}

export const AboutPage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [data, setData] = useState<CreatorAboutPageDTO | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');

  useDocumentTitle('关于我');

  const resolveStatus = (error: unknown) => {
    const statusCode =
      typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;
    return statusCode === 404 ? 'empty' : 'error';
  };

  const handleRetry = async () => {
    setStatus('loading');
    try {
      const next = await CreatorAboutService.getAboutPage();
      setData(next);
      setStatus('ready');
    } catch (error: unknown) {
      console.error('加载关于我页面失败', error);
      setStatus(resolveStatus(error));
    }
  };

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    CreatorAboutService.getAboutPage()
      .then((next) => {
        if (!cancelled) {
          setData(next);
          setStatus('ready');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error('加载关于我页面失败', error);
          setStatus(resolveStatus(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />

      {status === 'loading' && <AboutPageLoading />}
      {status === 'empty' && <AboutPageEmpty />}
      {status === 'error' && <AboutPageError onRetry={handleRetry} />}
      {status === 'ready' && data && (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_28%),linear-gradient(180deg,_#fffaf2_0%,_#ffffff_58%)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <section className="rounded-[32px] border border-amber-100 bg-white/90 shadow-[0_20px_80px_rgba(15,23,42,0.08)] overflow-hidden">
              <div className="grid gap-8 lg:grid-cols-[1.25fr,0.75fr] p-8 lg:p-10">
                <div>
                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-amber-700">
                    ABOUT ME
                  </span>
                  <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                    {data.displayName}
                  </h1>
                  <p className="mt-6 whitespace-pre-line text-base leading-8 text-slate-600 sm:text-lg">
                    {data.introduction}
                  </p>
                </div>

                <div className="rounded-[28px] border border-amber-100 bg-[linear-gradient(180deg,_rgba(255,249,235,0.98),_rgba(255,255,255,0.98))] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                  <div className="space-y-4">
                    <a
                      href={data.bilibiliUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between rounded-2xl border border-amber-100 bg-white px-4 py-4 transition hover:border-amber-300 hover:bg-amber-50/40"
                    >
                      <div className="flex items-center gap-3">
                        <BilibiliIcon className="h-5 w-5 text-slate-500" />
                        <div className="text-sm text-slate-500">B站主页</div>
                      </div>
                      <ArrowUpRight aria-hidden="true" className="h-5 w-5 text-amber-600 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                    <a
                      href={data.githubProfileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between rounded-2xl border border-amber-100 bg-white px-4 py-4 transition hover:border-amber-300 hover:bg-amber-50/40"
                    >
                      <div className="flex items-center gap-3">
                        <GithubIcon className="h-5 w-5 text-slate-500" />
                        <div className="text-sm text-slate-500">GitHub</div>
                      </div>
                      <ArrowUpRight aria-hidden="true" className="h-5 w-5 text-amber-600 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-10">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Projects</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-950">精选代表作</h2>
                </div>
              </div>

              {data.projects.length === 0 ? (
                <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
                  暂无项目
                </div>
              ) : (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {data.projects.map((project) => (
                    <article
                      key={project.name}
                      aria-label={project.name}
                      className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-950">{project.name}</h3>
                          <p className="mt-4 text-sm leading-7 text-slate-600">{project.description}</p>
                        </div>
                        {project.githubStars !== null ? (
                          <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                            <Star aria-hidden="true" className="h-4 w-4 fill-current" />
                            {formatStars(project.githubStars)}
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-6">
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group/btn inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          查看 GitHub 仓库
                          <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      )}

      <MarketingFooter
        year={CURRENT_YEAR}
        onContactClick={() => setIsContactOpen(true)}
        onTermsClick={() => setIsTermsOpen(true)}
        onPrivacyClick={() => setIsPrivacyOpen(true)}
      />

      <ContactUsDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <TermsModal open={isTermsOpen} onOpenChange={setIsTermsOpen} />
      <PrivacyModal open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen} />
    </div>
  );
};
