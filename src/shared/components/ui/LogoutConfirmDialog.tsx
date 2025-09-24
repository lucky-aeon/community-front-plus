import React from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  const handleConfirm = () => {
    onConfirm();
    onCancel(); // Close dialog after confirming
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent
        className="max-w-sm bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl"
        // 允许按 ESC 或点击遮罩层关闭
      >
        <DialogHeader className="text-center pt-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg mb-4">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            退出登录
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base mt-2">
            确定要退出当前账户吗？您需要重新登录才能访问个人内容。
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-6 px-2 pb-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-11 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 h-11 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            <LogOut className="h-4 w-4 mr-2" />
            退出登录
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};