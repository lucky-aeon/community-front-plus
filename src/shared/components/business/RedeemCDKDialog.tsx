import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { showToast } from '@shared/utils/toast';
import { UserSubscriptionService } from '@shared/services/api/user-subscription.service';
import { useAuth } from '@/context/AuthContext';

interface RedeemCDKDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RedeemCDKDialog: React.FC<RedeemCDKDialogProps> = ({ open, onOpenChange }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();

  const handleSubmit = async () => {
    if (!code.trim()) return showToast.error('请输入 CDK 激活码');
    setLoading(true);
    try {
      await UserSubscriptionService.activateCDK(code.trim());
      // 刷新全局用户状态（以便 UI 立即更新套餐信息）
      await refreshUser();
      // 激活成功后刷新菜单权限，避免权限栏仍显示未授权
      window.dispatchEvent(new Event('menu-codes:refresh'));
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
