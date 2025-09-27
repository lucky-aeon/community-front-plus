import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { showToast } from '@shared/utils/toast';
import { UserSubscriptionService } from '@shared/services/api/user-subscription.service';
import { AuthService } from '@shared/services/api/auth.service';

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
      await UserSubscriptionService.activateCDK(code.trim());
      // 刷新本地用户信息（便于立即显示最新套餐）
      try { await AuthService.refreshUserInfo(); } catch { /* ignore */ }
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
          <Button variant="honeySoft" onClick={handleSubmit} disabled={loading}>
            {loading ? '激活中...' : '激活'}
          </Button>
        </div>
        <p className="text-xs text-warm-gray-500">提示：激活后权益将自动应用至当前账号</p>
      </DialogContent>
    </Dialog>
  );
};
