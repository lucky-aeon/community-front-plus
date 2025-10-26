import React, { useMemo, useEffect, useState } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { ExpressionsService, type ExpressionTypeDTO } from '@shared/services/api/expressions.service';

// 配置 marked（只配置一次）
marked.setOptions({
  breaks: true, // 支持 GFM 换行
  gfm: true,
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch {
        return code;
      }
    }
    return code;
  },
});

interface SharedMarkdownRendererProps {
  /** Markdown 内容 */
  content: string;
  /** 自定义 class */
  className?: string;
}

/**
 * 轻量级 Markdown 渲染器
 * 使用 marked 库，性能比 Cherry 快 10 倍以上
 * 支持自定义表情语法 :name: 或 :code:
 */
export const SharedMarkdownRenderer: React.FC<SharedMarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  const [expressions, setExpressions] = useState<ExpressionTypeDTO[]>([]);

  // 加载表情列表
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!localStorage.getItem('auth_token')) return;
      try {
        const list = await ExpressionsService.getAll();
        if (!mounted) return;
        setExpressions(list || []);
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const html = useMemo(() => {
    if (!content) return '';

    try {
      // 1. 处理自定义表情：将 :name: 或 :code: 替换为 <img>
      let processed = content;
      if (expressions && expressions.length > 0) {
        const emojiMap = new Map<string, string>();
        expressions.forEach(exp => {
          const url = ExpressionsService.toImageUrl(exp.imageUrl) || '';
          emojiMap.set(exp.name, url);
          emojiMap.set(exp.code, url);
        });

        processed = content.replace(
          /:([a-zA-Z0-9_\u4e00-\u9fa5]+):/g,
          (match, name) => {
            const url = emojiMap.get(name);
            if (url) {
              return `<img src="${url}" class="custom-expression" alt="${name}" />`;
            }
            return match;
          }
        );
      }

      // 2. Markdown -> HTML（marked 非常快，~1ms）
      return marked.parse(processed, { async: false }) as string;
    } catch (error) {
      console.error('Markdown render failed:', error);
      // 降级：返回纯文本
      return content
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>');
    }
  }, [content, expressions]);

  if (!html) {
    return null;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
