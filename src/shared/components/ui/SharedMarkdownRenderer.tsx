import React from 'react';
import { MarkdownContent } from './MarkdownContent';

interface SharedMarkdownRendererProps {
  /** Markdown 内容 */
  content: string;
  /** 自定义 class */
  className?: string;
}

/**
 * 轻量级 Markdown 渲染器。
 * 保留旧组件名，内部统一复用 Web 端 MarkdownContent。
 */
export const SharedMarkdownRenderer: React.FC<SharedMarkdownRendererProps> = ({
  content,
  className = '',
}) => <MarkdownContent content={content} className={className} />;
