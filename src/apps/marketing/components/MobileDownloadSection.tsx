import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { AlertTriangle, CheckCircle2, Download, Loader2, Smartphone } from 'lucide-react';
import { MobileReleaseService, type MobileReleaseDTO } from '@shared/services/api';

function formatFileSize(size?: number | null) {
  if (!size || size <= 0) {
    return '未知大小';
  }
  const mb = size / 1024 / 1024;
  return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return '暂未记录';
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

interface MobileDownloadSectionProps {
  compact?: boolean;
}

export const MobileDownloadSection: React.FC<MobileDownloadSectionProps> = ({ compact = false }) => {
  const [release, setRelease] = useState<MobileReleaseDTO | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const pageUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return compact ? window.location.href : `${window.location.origin}/mobile`;
  }, [compact]);

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
      width: 192,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    }).then(setQrCodeUrl).catch(() => setQrCodeUrl(''));
  }, [pageUrl]);

  return (
    <section id="mobile" className={`relative overflow-hidden bg-[#fff8ed] ${compact ? 'py-12' : 'py-20'}`}>
      <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-orange-300/40 blur-3xl" />
      <div className="absolute bottom-0 right-[-160px] h-96 w-96 rounded-full bg-yellow-300/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-bold text-orange-700 shadow-sm">
              <Smartphone className="h-4 w-4" />
              手机访问更方便
            </div>

            <h2 className="text-3xl font-black leading-tight tracking-tight text-gray-950 sm:text-5xl">
              在手机上继续逛
              <span className="block bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                敲鸭社区
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
              Android 用户可以下载敲鸭社区 App，在手机上看课程、读文章、收消息。iPhone 用户可以继续使用网页版。
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {release ? (
                <a
                  href={release.apkUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-950 px-6 py-4 text-base font-bold text-white shadow-xl shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-gray-800"
                >
                  <Download className="h-5 w-5" />
                  下载 Android 版
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-gray-300 px-6 py-4 text-base font-bold text-white"
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                  正在获取版本
                </button>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-2xl shadow-orange-200/40 backdrop-blur">
            <div className="rounded-[1.5rem] bg-gray-950 p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-orange-200">当前最新版</div>
                  <div className="mt-2 text-3xl font-black">
                    {release ? `v${release.versionName}` : loading ? '加载中' : '暂无版本'}
                  </div>
                  <div className="mt-2 text-sm text-gray-300">发布时间：{formatDate(release?.publishedAt)}</div>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="移动端下载二维码" className="h-24 w-24 sm:h-28 sm:w-28" />
                  ) : (
                    <div className="h-24 w-24 rounded-xl bg-gray-100 sm:h-28 sm:w-28" />
                  )}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-gray-300">安装包</div>
                  <div className="mt-1 font-bold">{formatFileSize(release?.fileSize)}</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-gray-300">适用设备</div>
                  <div className="mt-1 font-bold">Android 手机</div>
                </div>
              </div>
            </div>

            {failed ? (
              <div className="mt-4 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
                版本信息加载失败，请稍后刷新页面。
              </div>
            ) : null}

            <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 p-5">
              <h3 className="text-lg font-black text-gray-950">更新内容</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
                {(release?.releaseNotes?.length ? release.releaseNotes : ['新版 App 准备好后，这里会自动显示下载。']).slice(0, 3).map((note, index) => (
                  <li key={`${note}-${index}`} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-orange-500" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-gray-500">
              下载后按手机提示完成安装即可。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
