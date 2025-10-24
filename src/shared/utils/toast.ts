import { toast } from '@/hooks/use-toast';

export const showToast = {
  success: (message: string) => {
    toast({
      description: message,
      variant: "success",
      duration: 2200,
    });
  },

  error: (message: string) => {
    toast({
      description: message,
      variant: "destructive",
      duration: 3000,
    });
  },

  warning: (message: string) => {
    toast({
      description: message,
      variant: "warning",
      duration: 2600,
    });
  },

  loading: (message: string) => {
    return toast({
      description: message,
      variant: "info",
      duration: 60000,
    });
  },

  info: (message: string) => {
    toast({
      description: message,
      variant: "info",
      duration: 2500,
    });
  },

  // 注意：shadcn 的编程式 dismiss 需要保存并调用 toast(...) 返回的 dismiss
  // 这里提供一个空实现以保持 API 兼容，推荐使用 loading(...) 的返回对象来 dismiss
  dismiss: () => { /* no-op for compatibility */ },
};
