import React from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

// Toast 配置
export const toastConfig = {
  duration: 3000,
  position: 'top-center' as const,
  
  // 自定义样式
  style: {
    background: '#ffffff',
    color: '#374151',
    padding: '16px 20px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #f3f4f6',
    fontSize: '14px',
    fontWeight: '500',
    maxWidth: '400px',
  },

  // 成功样式
  success: {
    style: {
      background: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
    },
    iconTheme: {
      primary: '#16a34a',
      secondary: '#f0fdf4',
    },
  },

  // 错误样式
  error: {
    style: {
      background: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca',
    },
    iconTheme: {
      primary: '#dc2626',
      secondary: '#fef2f2',
    },
  },

  // 警告样式
  loading: {
    style: {
      background: '#fefce8',
      color: '#a16207',
      border: '1px solid #fef08a',
    },
    iconTheme: {
      primary: '#ca8a04',
      secondary: '#fefce8',
    },
  },
};

// 自定义 Toast 组件
export const CustomToaster: React.FC = () => {
  return (
    <Toaster
      position={toastConfig.position}
      toastOptions={{
        duration: toastConfig.duration,
        style: toastConfig.style,
        success: toastConfig.success,
        error: toastConfig.error,
        loading: toastConfig.loading,
      }}
    />
  );
};

// Toast 工具函数
export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      icon: <CheckCircle className="w-5 h-5" />,
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      icon: <XCircle className="w-5 h-5" />,
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message, {
      icon: <AlertCircle className="w-5 h-5" />,
    });
  },
  
  info: (message: string) => {
    toast(message, {
      icon: <Info className="w-5 h-5" />,
      style: {
        background: '#eff6ff',
        color: '#1e40af',
        border: '1px solid #bfdbfe',
      },
    });
  },
  
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};