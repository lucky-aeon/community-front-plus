import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { installResourceImageFallback } from '@shared/utils/resource-image-fallback';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
// 安装资源图片占位符兜底（处理无权限等导致的图片加载错误）
installResourceImageFallback();
