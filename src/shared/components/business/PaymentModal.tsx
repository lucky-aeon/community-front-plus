import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { QrCode, Wallet } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { TermsModal, PrivacyModal } from '@shared/components/common/LegalModals';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 支付渠道弹窗：展示微信/支付宝二维码（从 public 目录加载）
 * 默认图片路径为 /wechat-qr.png 与 /alipay-qr.png，可根据实际替换。
 */
export const PaymentModal: React.FC<PaymentModalProps> = ({ open, onOpenChange }) => {
  const [agree, setAgree] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">选择支付方式</DialogTitle>
        </DialogHeader>
        {/* 同意条款与不退款说明（支付前确认） */}
        <div className="mb-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <Checkbox id="agree-pay-terms" checked={agree} onCheckedChange={(v) => setAgree(Boolean(v))} />
            <label htmlFor="agree-pay-terms" className="select-none">
              我已阅读并同意
              <button type="button" onClick={() => setTermsOpen(true)} className="mx-1 text-blue-600 hover:underline">《服务条款》</button>
              和
              <button type="button" onClick={() => setPrivacyOpen(true)} className="mx-1 text-blue-600 hover:underline">《隐私政策》</button>
              ，并知悉<span className="font-semibold text-red-600">数字内容服务开通后不支持退款</span>。
            </label>
          </div>
        </div>

        <div className={`relative grid grid-cols-1 sm:grid-cols-2 gap-4 ${!agree ? 'pointer-events-none blur-[1px] opacity-70' : ''}`}>
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <QrCode className="h-5 w-5 text-emerald-600" />
              <span className="font-medium">微信支付</span>
            </div>
            <img
              src="/vx_pay_qr.png"
              alt="微信支付二维码"
              className="w-full aspect-square object-contain rounded-md border"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </Card>

          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              <span className="font-medium">支付宝</span>
            </div>
            <img
              src="/zfb_pay_qr.png"
              alt="支付宝二维码"
              className="w-full aspect-square object-contain rounded-md border"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </Card>
          {!agree && (
            <div className="absolute inset-0 bg-white/40 rounded-md flex items-center justify-center text-sm text-gray-600">
              请勾选同意后显示二维码
            </div>
          )}
        </div>

        <p className="text-sm text-gray-700 mt-2">
          支付完成后请添加老师微信：
          <span className="font-mono select-all text-emerald-700"> xhyQAQ250</span>
        </p>
      </DialogContent>
      {/* 条款与隐私弹窗 */}
      <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
      <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </Dialog>
  );
};
