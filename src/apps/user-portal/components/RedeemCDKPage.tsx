import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { showToast } from '@shared/utils/toast';
import { UserSubscriptionService } from '@shared/services/api/user-subscription.service';
import { useAuth } from '@/context/AuthContext';

export const RedeemCDKPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();

  const handleRedeem = async () => {
    if (!code.trim()) {
      return showToast.error('请输入 CDK 激活码');
    }
    setLoading(true);
    try {
      await UserSubscriptionService.activateCDK(code.trim());
      await refreshUser();
      showToast.success('激活成功');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">CDK 激活</h1>
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">激活码</label>
            <Input
              placeholder="请输入你的 CDK 激活码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
            />
          </div>
          <Button variant="honeySoft" onClick={handleRedeem} disabled={loading} className="w-full sm:w-auto">
            {loading ? '激活中...' : '立即激活'}
          </Button>
          <p className="text-xs text-warm-gray-500">提示：激活后权益将自动应用至当前账号</p>
        </div>
      </Card>
    </div>
  );
};
