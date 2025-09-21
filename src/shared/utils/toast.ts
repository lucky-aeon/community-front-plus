import { toast } from '@/hooks/use-toast';

export const showToast = {
  success: (message: string) => {
    toast({
      title: "成功",
      description: message,
      variant: "default",
    });
  },

  error: (message: string) => {
    toast({
      title: "错误",
      description: message,
      variant: "destructive",
    });
  },

  loading: (message: string) => {
    return toast({
      title: "加载中",
      description: message,
      variant: "default",
    });
  },

  info: (message: string) => {
    toast({
      title: "提示",
      description: message,
      variant: "default",
    });
  },

  dismiss: (toastId?: string) => {
    // shadcn toast 的 dismiss 方法
    if (toastId) {
      // 需要通过 useToast hook 调用，这里简化处理
      toast({ title: "", description: "", variant: "default" });
    }
  },
};