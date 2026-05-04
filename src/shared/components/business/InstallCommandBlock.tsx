import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showToast } from '@shared/utils/toast';
import { cn } from '@shared/utils/cn';
import {
  detectInstallCommandPlatform,
  getInstallCommandPlatformLabel,
  resolveInstallCommands,
  type InstallCommandConfig,
  type InstallCommandPlatform,
} from '@shared/utils/install-command';

interface InstallCommandBlockProps {
  config: InstallCommandConfig;
  className?: string;
  commandClassName?: string;
}

const PLATFORMS: InstallCommandPlatform[] = ['macosLinux', 'windows'];

export const InstallCommandBlock: React.FC<InstallCommandBlockProps> = ({
  config,
  className,
  commandClassName,
}) => {
  const commands = useMemo(() => resolveInstallCommands(config), [config]);
  const [activePlatform, setActivePlatform] = useState<InstallCommandPlatform>(() => detectInstallCommandPlatform());
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setActivePlatform(detectInstallCommandPlatform());
    setCopied(false);

    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, [config]);

  useEffect(() => () => {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }
  }, []);

  const activeCommand = commands[activePlatform];

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(activeCommand);
      setCopied(true);
      showToast.success('命令已复制');
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        resetTimerRef.current = null;
      }, 2000);
    } catch (error) {
      console.error('复制 qiaoya 安装命令失败', error);
      showToast.error('复制失败，请手动复制');
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="inline-flex rounded-md border border-honey-200 bg-white p-0.5">
        {PLATFORMS.map((platform) => (
          <button
            key={platform}
            type="button"
            onClick={() => {
              setActivePlatform(platform);
              setCopied(false);
              if (resetTimerRef.current) {
                window.clearTimeout(resetTimerRef.current);
                resetTimerRef.current = null;
              }
            }}
            className={cn(
              'h-8 rounded px-3 text-xs font-medium text-warm-gray-600 transition-colors',
              activePlatform === platform && 'bg-honey-100 text-honey-900'
            )}
            aria-pressed={activePlatform === platform}
          >
            {getInstallCommandPlatformLabel(platform)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-honey-100 bg-gradient-to-r from-honey-50 via-white to-honey-50/80 p-3 sm:flex-row sm:items-center sm:justify-between">
        <code className={cn('min-w-0 overflow-x-auto text-sm font-semibold text-amber-800 sm:text-base', commandClassName)}>
          {activeCommand}
        </code>
        <Button
          type="button"
          variant="honeySoft"
          size="sm"
          onClick={copyCommand}
          aria-label={`复制 ${getInstallCommandPlatformLabel(activePlatform)} qiaoya 一键安装命令`}
          className="shrink-0"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? '已复制' : '复制命令'}
        </Button>
      </div>
    </div>
  );
};
