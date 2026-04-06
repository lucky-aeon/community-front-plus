import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, CheckCircle2, MessageSquare, PlayCircle } from 'lucide-react';

interface ContactUsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactUsDialog: React.FC<ContactUsDialogProps> = ({ open, onOpenChange }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-2 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              联系敲鸭
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mt-1">选择你更常用的联系渠道</p>
        </div>

        <div className="p-6 space-y-4">
          <a
            href="https://space.bilibili.com/152686439"
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg border border-blue-200/60 bg-white hover:shadow-md transition-shadow p-4 group"
          >
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
                <PlayCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">B站主页</div>
                <div className="text-xs text-gray-500 break-all">https://space.bilibili.com/152686439</div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 ml-2" />
            </div>
          </a>

          <div className="rounded-lg border border-emerald-200/60 bg-white p-4">
            <div className="flex items-center mb-2">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                <MessageSquare className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="font-medium text-gray-900">微信</div>
            </div>
            <div className="flex items-center justify-between bg-emerald-50 rounded-md px-3 py-2">
              <code className="font-mono text-emerald-700 select-all">xhyQAQ250</code>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText('xhyQAQ250');
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  } catch {
                    // ignore
                  }
                }}
                className="h-8 px-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> 已复制
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" /> 复制
                  </>
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500">复制微信号后，在微信中搜索添加。</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
