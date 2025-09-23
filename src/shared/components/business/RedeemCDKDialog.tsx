import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { showToast } from '@shared/utils/toast';

interface RedeemCDKDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RedeemCDKDialog: React.FC<RedeemCDKDialogProps> = ({ open, onOpenChange }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) return showToast.error('请输入 CDK 激活码');
    setLoading(true);
    try {
      // TODO: 接入真实兑换接口
      await new Promise((r) => setTimeout(r, 600));
      showToast.success('激活成功');
      setCode('');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>CDK 激活</DialogTitle>
          <DialogDescription>输入你的兑换码，立即解锁对应权益</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input
            placeholder="输入 CDK 激活码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '激活中...' : '激活'}
          </Button>
        </div>
        <p className="text-xs text-warm-gray-500">提示：当前为前端示例，后续接入后端兑换接口</p>
      </DialogContent>
    </Dialog>
  );
};

