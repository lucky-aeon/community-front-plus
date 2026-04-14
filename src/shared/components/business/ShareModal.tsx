import React, { useState, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showToast } from '@shared/utils/toast';
import { ImageIcon, Loader2 } from 'lucide-react';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';

export type ShareTargetType = 'POST' | 'COMMENT' | 'COURSE' | 'CHAPTER' | 'INTERVIEW_QUESTION';

const BADGE_MAP: Record<ShareTargetType, string> = {
  POST: '社区文章',
  COURSE: '在线课程',
  CHAPTER: '课程章节',
  INTERVIEW_QUESTION: '题库精选',
  COMMENT: '精彩评论',
};

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  businessType: ShareTargetType;
  defaultTitle?: string;
  defaultDescription?: string;
  shareUrl?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  open,
  onClose,
  businessType,
  defaultTitle = '',
  defaultDescription = '',
  shareUrl,
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [generating, setGenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const effectiveUrl = shareUrl || window.location.href;

  const handlePreview = useCallback(async () => {
    if (!title.trim()) {
      showToast.error('请输入标题');
      return;
    }
    setGenerating(true);
    setQrDataUrl(null);
    try {
      const url = await QRCode.toDataURL(effectiveUrl, {
        width: 200,
        margin: 1,
        color: { dark: '#292524', light: '#ffffff' },
      });
      setQrDataUrl(url);
    } catch {
      showToast.error('生成二维码失败，请重试');
    } finally {
      setGenerating(false);
    }
  }, [title, effectiveUrl]);

  const handleClose = () => {
    setQrDataUrl(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent
        className="max-w-3xl w-full max-h-[90vh] flex flex-col"
        style={{ zIndex: 1100 }}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>生成分享卡片</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* 表单 */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="share-title">标题 <span className="text-red-500">*</span></Label>
              <Input
                id="share-title"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setQrDataUrl(null); }}
                placeholder="请输入分享标题"
                maxLength={60}
              />
            </div>
            <div className="space-y-1.5">
              <Label>描述</Label>
              <MarkdownEditor
                value={description}
                onChange={(v) => { setDescription(v); setQrDataUrl(null); }}
                height={160}
                placeholder="请输入分享描述（支持 Markdown，可选）"
                toolbar
                enableFullscreen={false}
                enableToc={false}
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <Button
            onClick={handlePreview}
            disabled={generating || !title.trim()}
            className="flex items-center gap-2"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            {generating ? '生成中…' : '预览卡片'}
          </Button>

          {/* 卡片预览（HTML，支持 Markdown 样式，用户自行截图） */}
          {qrDataUrl ? (
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              {/* 卡片主体 */}
              <div className="bg-white p-8">
                {/* 头部：Logo + 社区名 + 徽章 */}
                <div className="flex items-center gap-2.5 mb-3">
                  <img
                    src="/logo.jpg"
                    alt="logo"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <span className="font-bold text-lg text-[#292524]">敲鸭社区</span>
                  <span className="bg-[#fef3c7] text-[#a16207] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {BADGE_MAP[businessType]}
                  </span>
                </div>

                {/* 渐变分割线 */}
                <div
                  className="h-0.5 rounded mb-5"
                  style={{ background: 'linear-gradient(90deg, #f59e0b, #84cc16, transparent)' }}
                />

                {/* 标题 */}
                <h2 className="text-2xl font-bold text-[#292524] mb-3 leading-snug">
                  {title}
                </h2>

                {/* 描述（Markdown 预览） */}
                {description && (
                  <div className="text-[#6b7280] mb-5">
                    <MarkdownEditor
                      value={description}
                      onChange={() => {}}
                      previewOnly
                      height="auto"
                      toolbar={false}
                      enableFullscreen={false}
                      enableToc={false}
                      className="!border-none !shadow-none !bg-transparent p-0"
                    />
                  </div>
                )}

                {/* 底部分割线 */}
                <div className="border-t border-[#e5e7eb] mt-4 pt-4 flex items-center justify-between">
                  {/* 左：域名 */}
                  <div>
                    <p className="text-xs text-[#a8a29e] mb-1">扫码或访问</p>
                    <p className="text-sm font-bold text-[#f59e0b]">🔗 code.xhyovo.cn</p>
                  </div>
                  {/* 右：二维码 */}
                  <div className="text-center">
                    <img src={qrDataUrl} alt="QR Code" className="w-20 h-20 rounded border border-[#e5e7eb]" />
                    <p className="text-xs text-[#9ca3af] mt-1">扫码查看</p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            !generating && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-gray-400">
                <ImageIcon className="h-10 w-10 mb-2 opacity-40" />
                <p className="text-sm">填写标题后点击「预览卡片」，然后截图保存</p>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
