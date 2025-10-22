import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { installResourceImageFallback } from '@shared/utils/resource-image-fallback';
import './index.css';

// 先安装资源图片占位符兜底（在应用渲染前挂载错误监听）
installResourceImageFallback();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
