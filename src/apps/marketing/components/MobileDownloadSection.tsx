import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  AlertCircle,
  Bot,
  Box,
  Download,
  FileText,
  Globe2,
  Loader2,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { MobileReleaseService, type MobileReleaseDTO } from '@shared/services/api';

function formatFileSize(size?: number | null) {
  if (!size || size <= 0) {
    return '获取中';
  }
  const mb = size / 1024 / 1024;
  return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return '等待发布';
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value }) => (
  <div className="flex min-h-[84px] items-center gap-3 rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-4 shadow-sm">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-orange-600">
      {icon}
    </div>
    <div>
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-base font-black text-slate-950">{value}</div>
    </div>
  </div>
);

export const MobileDownloadSection: React.FC = () => {
  const [release, setRelease] = useState<MobileReleaseDTO | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const pageUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return window.location.href;
  }, []);

  const apkUrl = release?.apkUrl;
  const versionText = release ? `v${release.versionName}` : loading ? '加载中' : '暂无版本';
  const releaseNotes = release?.releaseNotes?.length
    ? release.releaseNotes.slice(0, 2)
    : ['新版发布后，这里会自动更新下载信息。'];

  useEffect(() => {
    let cancelled = false;

    const loadRelease = async () => {
      try {
        setLoading(true);
        setFailed(false);
        const latest = await MobileReleaseService.getLatestAndroidRelease();
        if (!cancelled) {
          setRelease(latest);
        }
      } catch (error) {
        console.error('加载 Android 版本信息失败', error);
        if (!cancelled) {
          setFailed(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRelease();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pageUrl) {
      return;
    }
    QRCode.toDataURL(pageUrl, {
      width: 208,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    }).then(setQrCodeUrl).catch(() => setQrCodeUrl(''));
  }, [pageUrl]);

  return (
    <section className="relative overflow-hidden bg-[#fff8ed] py-14 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_4%_92%,rgba(254,215,170,0.72)_0,rgba(254,215,170,0.28)_12%,transparent_28%),radial-gradient(circle_at_36%_86%,rgba(251,146,60,0.18)_0,transparent_22%),linear-gradient(115deg,#fff2d9_0%,#fffaf3_52%,#ffffff_100%)]" />
      <div className="pointer-events-none absolute bottom-[-110px] left-[28%] h-64 w-64 rounded-full bg-orange-200/25 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 xl:gap-12">
        <div className="max-w-2xl">
          <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-orange-200 bg-white/70 px-4 text-sm font-bold text-orange-600 shadow-sm backdrop-blur">
            <Smartphone className="h-4 w-4" />
            手机访问更方便
          </div>

          <h1 className="mt-8 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            在手机上继续逛
            <span className="block text-orange-600">敲鸭社区</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            Android 用户可以下载敲鸭社区 App，在手机上看课程、读文章、收消息。iPhone 用户可以继续使用网页版。
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            {apkUrl ? (
              <a
                href={apkUrl}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-orange-600 px-7 text-base font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200 sm:text-lg"
              >
                <Bot className="h-6 w-6" />
                下载 Android App
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex min-h-14 cursor-not-allowed items-center justify-center gap-3 rounded-2xl bg-orange-300 px-7 text-base font-black text-white sm:text-lg"
              >
                <Loader2 className="h-6 w-6 animate-spin" />
                正在获取版本
              </button>
            )}

            <a
              href="/"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-7 text-base font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-100 sm:text-lg"
            >
              <Globe2 className="h-6 w-6" />
              继续使用网页版
            </a>
          </div>

          <div className="mt-6 flex items-start gap-2 text-sm font-medium leading-6 text-slate-500">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            如果下载没有开始，可扫码或稍后重试。
          </div>
        </div>

        <div className="rounded-[2rem] bg-white/90 p-5 shadow-2xl shadow-orange-200/30 ring-1 ring-white/80 backdrop-blur md:p-7">
          <div className="flex flex-col gap-6 border-b border-orange-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-lg font-black text-slate-900 sm:text-xl">当前最新版本</div>
              <div className="mt-5 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-5xl font-black leading-none tracking-tight text-transparent sm:text-6xl">
                {versionText}
              </div>
              <div className="mt-4 text-sm font-semibold text-slate-500">发布时间：{formatDate(release?.publishedAt)}</div>
            </div>

            <div className="w-fit rounded-2xl border-2 border-orange-300 bg-white p-3 text-center shadow-sm">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="扫码在手机上下载敲鸭社区 App" className="h-32 w-32 sm:h-36 sm:w-36" />
              ) : (
                <div className="h-32 w-32 rounded-2xl bg-slate-100 sm:h-36 sm:w-36" />
              )}
              <div className="mt-2 text-sm font-black text-slate-600">扫码在手机上下载</div>
            </div>
          </div>

          {failed ? (
            <div className="mt-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              版本信息加载失败，请稍后刷新页面。
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <InfoCard icon={<Box className="h-7 w-7" />} label="安装包大小" value={formatFileSize(release?.fileSize)} />
            <InfoCard icon={<Smartphone className="h-7 w-7" />} label="适用设备" value="Android 手机" />
            <InfoCard icon={<ShieldCheck className="h-7 w-7" />} label="系统要求" value="Android 8.0 及以上" />
          </div>

          {apkUrl ? (
            <a
              href={apkUrl}
              className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-orange-600 px-6 text-lg font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200"
            >
              <Download className="h-6 w-6" />
              下载 Android 安装包 (.apk)
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="mt-6 inline-flex min-h-14 w-full cursor-not-allowed items-center justify-center gap-3 rounded-2xl bg-orange-300 px-6 text-lg font-black text-white"
            >
              <Loader2 className="h-6 w-6 animate-spin" />
              正在获取下载地址
            </button>
          )}

          <div className="mt-6 rounded-2xl border border-orange-200 bg-[#fffaf3] p-5">
            <div className="mb-4 flex items-center gap-3 text-lg font-black text-slate-950">
              <FileText className="h-6 w-6 text-orange-600" />
              安装说明
            </div>
            <ol className="space-y-3 text-sm font-semibold leading-7 text-slate-600 sm:text-base">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-black text-white">1</span>
                下载完成后，点击安装包并按提示完成安装。
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-black text-white">2</span>
                如果手机提示需要确认，请按系统提示允许本次安装。
              </li>
            </ol>
          </div>

          <div className="mt-6 border-t border-orange-100 pt-5">
            <ul className="space-y-2 text-sm font-medium leading-6 text-slate-500">
              {releaseNotes.map((note, index) => (
                <li key={`${note}-${index}`} className="flex gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
