import React, { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { cn } from '@shared/utils/cn';
import { ExpressionsService, type ExpressionTypeDTO } from '@shared/services/api/expressions.service';
import { ResourceAccessService } from '@shared/services/api/resource-access.service';
import './MarkdownEditor.css';

marked.setOptions({
  breaks: true,
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

interface MarkdownContentProps {
  content: string;
  className?: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const normalizeResourceUrl = (value: string): string => {
  const raw = String(value || '').trim();
  if (!raw) return raw;
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/') || raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw;
  }
  return ResourceAccessService.getResourceAccessUrl(raw);
};

const preprocessMarkdown = (content: string, expressions: ExpressionTypeDTO[]): string => {
  let processed = content;

  if (expressions.length > 0) {
    const emojiMap = new Map<string, string>();
    expressions.forEach((exp) => {
      const url = ExpressionsService.toImageUrl(exp.imageUrl) || '';
      if (!url) return;
      emojiMap.set(exp.name, url);
      emojiMap.set(exp.code, url);
    });

    processed = processed.replace(/:([a-zA-Z0-9_\u4e00-\u9fa5]+):/g, (match, name) => {
      const url = emojiMap.get(name);
      if (!url) return match;
      return `<img src="${escapeHtml(url)}" class="custom-expression" alt="${escapeHtml(name)}" title="${escapeHtml(name)}" />`;
    });
  }

  processed = processed.replace(
    /!video\[([^\]]*)\]\(([^)]+)\)(?:\{poster=([^}]+)\})?/gi,
    (_match, _label, url, poster) => {
      const src = normalizeResourceUrl(url);
      const posterAttr = poster ? ` poster="${escapeHtml(normalizeResourceUrl(poster))}"` : '';
      return `<video src="${escapeHtml(src)}"${posterAttr} controls preload="metadata"></video>`;
    }
  );

  return processed;
};

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className }) => {
  const [expressions, setExpressions] = useState<ExpressionTypeDTO[]>([]);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await ResourceAccessService.ensureSession();
      } catch {
        // Passive resource session refresh; rendering still proceeds.
      }

      if (!localStorage.getItem('auth_token')) return;
      try {
        const list = await ExpressionsService.getAll();
        if (mounted) setExpressions(list || []);
      } catch {
        // Expressions are optional for markdown rendering.
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const html = useMemo(() => {
    if (!content) return '';
    try {
      const processed = preprocessMarkdown(content, expressions);
      return marked.parse(processed, { async: false }) as string;
    } catch (error) {
      console.error('Markdown render failed:', error);
      return escapeHtml(content).replace(/\n/g, '<br/>');
    }
  }, [content, expressions]);

  const handleMediaError = async (event: React.SyntheticEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (!target || (target.tagName !== 'IMG' && target.tagName !== 'VIDEO')) return;
    const media = target as HTMLImageElement | HTMLVideoElement;
    if (media.getAttribute('data-qiaoya-resource-retried') === '1') return;
    media.setAttribute('data-qiaoya-resource-retried', '1');

    try {
      await ResourceAccessService.ensureSession(true);
      const current = media.getAttribute('src') || '';
      if (current) {
        media.setAttribute('src', current + (current.includes('?') ? '&' : '?') + `_=${Date.now()}`);
      }
      setRetryKey((value) => value + 1);
    } catch {
      // Keep the original browser error state visible.
    }
  };

  if (!html) return null;

  return (
    <div
      key={retryKey}
      className={cn('qiaoya-markdown-content', className)}
      onError={handleMediaError}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
