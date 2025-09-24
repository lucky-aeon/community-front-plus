import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { QrCode, Wallet } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 支付渠道弹窗：展示微信/支付宝二维码（从 public 目录加载）
 * 默认图片路径为 /wechat-qr.png 与 /alipay-qr.png，可根据实际替换。
 */
export const PaymentModal: React.FC<PaymentModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">选择支付方式</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <p className="text-sm text-gray-700 mt-2">
          支付完成后请添加老师微信：
          <span className="font-mono select-all text-emerald-700"> xhyQAQ250</span>
        </p>
      </DialogContent>
    </Dialog>
  );
};
