import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import Cherry from 'cherry-markdown';
import 'cherry-markdown/dist/cherry-markdown.css';
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';
import './MarkdownEditor.css';
import { UploadService } from '@shared/services/api/upload.service';
import { NO_LIMIT_UPLOAD_CONFIG } from '@shared/types/upload.types';
import { ResourceAccessService } from '@shared/services/api/resource-access.service';
import { ExpressionsService, type ExpressionTypeDTO } from '@shared/services/api/expressions.service';
import { MarkdownContent } from './MarkdownContent';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { showToast } from '@shared/utils/toast';

export interface MarkdownEditorHandle {
  insertMarkdown: (snippet: string) => void;
  focus: () => void;
  // 根据纯文本下标范围替换（用于 @ 提及等场景），会尽量保持光标
  replaceRangeByIndex: (start: number, end: number, replacement: string) => void;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  previewOnly?: boolean;
  height?: string | number;
  placeholder?: string;
  toolbar?: boolean | string[];
  className?: string;
  enableFullscreen?: boolean;
  enableToc?: boolean;  // 是否启用目录功能
  // 新增：打开资源库回调（用于在工具栏添加按钮入口）
  onOpenResourcePicker?: () => void;
  // 透传键盘事件（用于聊天室发送/提及等场景）
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

function MarkdownEditorImpl(
  {
    value,
    onChange,
    previewOnly = false,
    height = 400,
    placeholder = '请输入markdown内容...',
    toolbar = true,
    className = '',
    enableFullscreen = true,
    enableToc = false,
    onOpenResourcePicker,
    onKeyDown,
  }: MarkdownEditorProps,
  ref: React.Ref<MarkdownEditorHandle>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cherryInstanceRef = useRef<Cherry | null>(null);
  const containerIdRef = useRef(`markdown-editor-${Math.random().toString(36).substr(2, 9)}`);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEchartsLoaded, setIsEchartsLoaded] = useState(false);
  const [expressions, setExpressions] = useState<ExpressionTypeDTO[]>([]);
  const [isExprOpen, setIsExprOpen] = useState(false);
  // 上传任务队列（用于显示进度与取消）
  const [uploadTasks, setUploadTasks] = useState<Array<{
    id: string;
    name: string;
    progress: number;
    status: 'uploading' | 'success' | 'error' | 'canceled';
    type: 'image' | 'video';
    xhrs: XMLHttpRequest[]; // 可能包含视频与poster两个xhr
    error?: string;
  }>>([]);
  
  // 添加更新来源跟踪，防止循环更新
  const isUserInputRef = useRef(false);
  const lastValueRef = useRef(value);

  // 全屏切换功能
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // 动态加载 echarts
  useEffect(() => {
    if (previewOnly) {
      setIsEchartsLoaded(true);
      return;
    }
    const loadEcharts = async () => {
      try {
        // 检查是否已经加载
        if ((window as unknown as { echarts?: unknown }).echarts) {
          setIsEchartsLoaded(true);
          return;
        }

        // 动态导入 echarts
        const echarts = await import('echarts');
        
        // 将 echarts 挂载到 window 对象上
        (window as unknown as { echarts: unknown }).echarts = echarts;
        
        setIsEchartsLoaded(true);
      } catch (error) {
        console.warn('Failed to load echarts:', error);
        // 即使加载失败也设置为 true，让编辑器继续工作（只是图表功能不可用）
        setIsEchartsLoaded(true);
      }
    };

    loadEcharts();
  }, [previewOnly]);

  // ESC键盘支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // 保证资源访问会话有效（仅登录后才需建立，游客不触发401）
  useEffect(() => {
    (async () => {
      try {
        if (localStorage.getItem('auth_token')) {
          await ResourceAccessService.ensureSession();
        }
      } catch { /* ignore */ }
    })();
  }, []);

  // 处理图片点击预览
  const handleImageClick = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const imgElement = target as HTMLImageElement;
      const viewer = new Viewer(imgElement, {
        button: false,
        navbar: false,
        title: [
          1,
          (image: HTMLImageElement) => {
            const imageData = {
              naturalWidth: image.naturalWidth,
              naturalHeight: image.naturalHeight
            };
            return `${image.alt || 'Image'} (${imageData.naturalWidth} × ${imageData.naturalHeight})`;
          }
        ],
        hidden() {
          viewer.destroy();
        }
      });
      viewer.show();
    }
  }, []);

  // 将 :code:/ :name: 文本节点替换为 <img>，并为图片绑定 onerror 以在 Cookie 过期时自动重试
  const processCustomEmojis = useCallback(() => {
    try {
      const previewEl = document.querySelector(`#${containerIdRef.current} .cherry-previewer`);
      if (!previewEl || !expressions || expressions.length === 0) return;

      const walker = document.createTreeWalker(
        previewEl,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            const parent = (node as any).parentNode as HTMLElement | null;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE' || parent.classList.contains('emoji-processed')) return NodeFilter.FILTER_REJECT;
            const val = node.nodeValue || '';
            return val.includes(':') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        } as any
      );

      const regex = /:([a-zA-Z0-9_\u4e00-\u9fa5]+):/g;
      const nodes: Node[] = [];
      let n: Node | null;
      // eslint-disable-next-line no-cond-assign
      while ((n = walker.nextNode())) nodes.push(n);

      nodes.forEach((textNode) => {
        const text = textNode.nodeValue || '';
        if (!regex.test(text)) return;
        regex.lastIndex = 0;
        const fragments: Node[] = [];
        let lastIndex = 0;
        let m: RegExpExecArray | null;
        // eslint-disable-next-line no-cond-assign
        while ((m = regex.exec(text)) !== null) {
          if (m.index > lastIndex) fragments.push(document.createTextNode(text.slice(lastIndex, m.index)));
          const name = m[1];
          const exp = expressions.find((e) => e.code === name || e.name === name);
          if (exp) {
            const base = ExpressionsService.toImageUrl(exp.imageUrl) || '';
            const img = document.createElement('img');
            img.src = base;
            img.alt = name;
            img.title = name;
            img.className = 'custom-expression';
            if (!img.getAttribute('data-emoji-bound')) {
              img.setAttribute('data-emoji-bound', '1');
              img.onerror = async () => {
                try { await ResourceAccessService.ensureSession(); } catch { /* ignore */ }
                try {
                  const next = base + (base.includes('?') ? '&' : '?') + '_=' + Date.now();
                  img.src = next;
                } catch { /* ignore */ }
              };
            }
            fragments.push(img);
          } else {
            fragments.push(document.createTextNode(m[0]));
          }
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < text.length) fragments.push(document.createTextNode(text.slice(lastIndex)));
        const wrapper = document.createElement('span');
        wrapper.className = 'emoji-processed';
        fragments.forEach((f) => wrapper.appendChild(f));
        const parent = (textNode as any).parentNode as Node | null;
        if (parent) parent.replaceChild(wrapper, textNode);
      });

      // 兜底：为已有的 <img.custom-expression> 绑定 onerror
      try {
        previewEl.querySelectorAll('img.custom-expression').forEach((node) => {
          const img = node as HTMLImageElement;
          if (img.getAttribute('data-emoji-bound')) return;
          img.setAttribute('data-emoji-bound', '1');
          const base = String(img.getAttribute('src') || '');
          img.onerror = async () => {
            try { await ResourceAccessService.ensureSession(); } catch { /* ignore */ }
            try {
              const next = base + (base.includes('?') ? '&' : '?') + '_=' + Date.now();
              img.src = next;
            } catch { /* ignore */ }
          };
        });
      } catch { /* ignore */ }
    } catch { /* ignore */ }
  }, [expressions]);

  

  // 文件上传处理
  const handleFileUpload = useCallback(async (file: File, callback: (url: string, params?: Record<string, unknown>) => void) => {
    try {
      // 根据文件类型选择上传方法
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      // 工具方法：在光标位置插入 Markdown 片段（用于非图片/视频等通用文件）
      const insertAtCursor = (snippet: string) => {
        try {
          const inst = cherryInstanceRef.current as unknown as { editor?: { editor?: { replaceSelection?: (text: string) => void; focus?: () => void } } } | null;
          const cm = inst?.editor?.editor;
          if (cm && typeof cm.replaceSelection === 'function') {
            cm.replaceSelection(snippet);
            cm.focus?.();
            return true;
          }
        } catch { /* ignore */ }
        try {
          const inst = cherryInstanceRef.current as unknown as { getValue?: () => string; setValue?: (v: string, keepCursor?: boolean) => void } | null;
          const cur = inst?.getValue ? inst.getValue() : lastValueRef.current || '';
          const needsLF = !!cur && !cur.endsWith('\n');
          const next = `${cur}${needsLF ? '\n' : ''}${snippet}`;
          if (inst?.setValue) { inst.setValue(next, false); } else { onChange(next); }
          return true;
        } catch { /* ignore */ }
        return false;
      };

      // 新建上传任务
      const taskId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      setUploadTasks((prev) => [
        ...prev,
        { id: taskId, name: file.name, progress: 0, status: 'uploading', type: isImage ? 'image' : 'video', xhrs: [] }
      ]);

      // 允许取消：收集xhr
      const collectedXhrs: XMLHttpRequest[] = [];
      const onCreateXhr = (xhr: XMLHttpRequest) => {
        collectedXhrs.push(xhr);
        setUploadTasks((prev) => prev.map(t => t.id === taskId ? { ...t, xhrs: [...collectedXhrs] } : t));
      };

      // 进度更新
      const onProgress = (p: number) => {
        setUploadTasks((prev) => prev.map(t => t.id === taskId ? { ...t, progress: p } : t));
      };

      if (isImage || isVideo) {
        let posterUrl: string | undefined;
        // 如果是视频，先并行准备 poster（首帧截图再上传）。不阻塞视频上传开始。
        const posterPromise = (async () => {
          if (!isVideo) return undefined;
          try {
            const blob = await captureVideoPoster(file, 800);
            const posterFile = new File([blob], `${file.name.replace(/\.[^.]+$/, '')}-poster.jpg`, { type: 'image/jpeg' });
            const posterResp = await UploadService.uploadImage(posterFile, { onCreateXhr, timeout: 0 });
            return posterResp.url;
          } catch (e) {
            console.warn('生成视频封面失败，继续无poster:', e);
            return undefined;
          }
        })();

        // 统一使用通用上传并传入“无限制配置”，同时保留图片压缩能力
        const resp = await UploadService.uploadFile(
          file,
          { onProgress, onCreateXhr, compress: isImage, timeout: 0 },
          NO_LIMIT_UPLOAD_CONFIG
        );

        if (!resp.url) {
          throw new Error('上传失败：未返回访问URL');
        }

        try { await ResourceAccessService.ensureSession(); } catch { void 0; }

        // 等待 poster（仅视频）
        if (isVideo) {
          posterUrl = await posterPromise;
        }

        // 图片/视频分别携带适合的渲染参数
        if (isImage) {
          callback(resp.url, {
            name: file.name.replace(/\.[^.]+$/, ''),
            isShadow: true,
            isRadius: true,
            width: '100%',
            height: 'auto'
          });
        } else {
          // 对视频，传入 poster 与常用控制属性
          const params: Record<string, unknown> = {
            controls: true,
            autoplay: false,
            loop: false,
            width: '100%',
            height: 'auto'
          };
          if (posterUrl) params.poster = posterUrl;
          callback(resp.url, params);
        }
      } else {
        // 其他类型：不做类型限制，直接作为通用文件上传并插入 Markdown 链接
        const resp = await UploadService.uploadFile(file, { onProgress, onCreateXhr, timeout: 0 }, NO_LIMIT_UPLOAD_CONFIG);
        if (!resp.url) throw new Error('上传失败：未返回访问URL');
        try { await ResourceAccessService.ensureSession(); } catch { /* ignore */ }
        const safeName = file.name || 'file';
        const snippet = `[${safeName}](${resp.url})`;
        // 直接插入到光标位置；为避免 Cherry 内部的占位处理与我们重复插入，这里仍调用 callback 但不传参，让其快速结束
        try { callback(''); } catch { /* ignore */ }
        insertAtCursor(snippet);
      }

      setUploadTasks((prev) => prev.map(t => t.id === taskId ? { ...t, status: 'success', progress: 100 } : t));
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传失败，请稍后重试';
      console.error('文件上传失败:', error);
      // 判定是否为取消
      const isCanceled = error instanceof Error && /取消/.test(error.message);
      setUploadTasks((prev) => prev.map(t => t.status === 'uploading' ? { ...t, status: isCanceled ? 'canceled' : 'error', error: message } : t));
      if (isCanceled) {
        showToast.info('上传已取消');
      } else {
        // Axios 异常交由拦截器提示；非 Axios（如 XHR）则本地提示
        const toastShown = typeof error === 'object' && error !== null && (error as any).__toastShown === true;
        if (!toastShown) showToast.error(message);
      }
    }
  }, []);

  // 取消上传
  const cancelUpload = useCallback((taskId: string) => {
    setUploadTasks((prev) => {
      const target = prev.find(t => t.id === taskId);
      if (target) {
        try { target.xhrs.forEach(x => x.abort()); } catch { void 0; }
      }
      return prev.map(t => t.id === taskId ? { ...t, status: 'canceled' } : t);
    });
  }, []);

  // 自动清理完成/取消的任务（短暂展示后隐藏）
  useEffect(() => {
    const timer = setTimeout(() => {
      setUploadTasks((prev) => prev.filter(t => t.status === 'uploading'));
    }, 2200);
    return () => clearTimeout(timer);
  }, [uploadTasks]);

  // 视频首帧截图
  const captureVideoPoster = useCallback((file: File, maxWidth = 800): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;
        const url = URL.createObjectURL(file);
        const cleanup = () => URL.revokeObjectURL(url);

        const onLoaded = () => {
          // 定位到 0.1s 以尽量避免黑帧
          const seekTo = Math.min(0.1, (video.duration || 1) / 10);
          const onSeeked = () => {
            try {
              const w = video.videoWidth;
              const h = video.videoHeight;
              if (!w || !h) throw new Error('无法获取视频尺寸');
              const ratio = Math.min(maxWidth / w, 1);
              const canvas = document.createElement('canvas');
              canvas.width = Math.round(w * ratio);
              canvas.height = Math.round(h * ratio);
              const ctx = canvas.getContext('2d');
              if (!ctx) throw new Error('无法创建画布上下文');
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              canvas.toBlob((blob) => {
                if (blob) resolve(blob); else reject(new Error('无法生成封面'));
                cleanup();
              }, 'image/jpeg', 0.85);
            } catch (e) {
              cleanup();
              reject(e instanceof Error ? e : new Error('封面生成失败'));
            }
          };
          video.removeEventListener('loadeddata', onLoaded);
          video.addEventListener('seeked', onSeeked, { once: true });
          try { video.currentTime = seekTo; } catch { onSeeked(); }
        };

        video.addEventListener('loadeddata', onLoaded);
        video.addEventListener('error', () => { cleanup(); reject(new Error('视频加载失败')); }, { once: true });
        video.src = url;
        // 某些浏览器需要 play 才能渲染首帧，但 muted + playsInline 可自动，不强制
      } catch (e) {
        reject(e instanceof Error ? e : new Error('封面生成失败'));
      }
    });
  }, []);

  // Cherry编辑器配置
  const getCherryConfig = useCallback(() => {
    const config = {
      id: containerIdRef.current,
      value: '', // 不在配置中设置初始值，避免重新初始化
      externals: {
        echarts: (window as unknown as { echarts?: unknown }).echarts,
        katex: (window as unknown as { katex?: unknown }).katex,
        MathJax: (window as unknown as { MathJax?: unknown }).MathJax
      },
      engine: {
        global: {
          urlProcessor: (url: string) => url
        },
       syntax: {
          fontEmphasis: {
            allowWhitespace: true
          },
          mathBlock: {
            engine: 'MathJax' as const,
            src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js'
          },
          inlineMath: {
            engine: 'MathJax' as const
          },
          // 启用内置emoji，并追加自定义映射（按已加载表情动态生成）
          emoji: {
            useUnicode: false,
            // 使用自定义映射的完整URL，不再拼接GitHub模板
            // 这里将 customEmoji 的 value 直接作为 src，因此占位符设置为 "${code}"
            upperCase: false,
            customResourceURL: '${code}',
            customEmoji: Object.fromEntries(
              (expressions || []).flatMap((exp) => {
                const url = ExpressionsService.toImageUrl(exp.imageUrl) || '';
                // 同时支持 name 与 code 两种写法
                return [[exp.name, url], [exp.code, url]] as Array<[string, string]>;
              })
            )
          },
          codeBlock: {
            expandCode: true
          },
          // 启用TOC功能
          toc: enableToc ? {
            allowMultiToc: true
          } : false
        },
        // 自定义语法：将 :code: 或 :name: 转为 <img>
        customSyntax: {
          customEmoji: {
            syntaxType: 'inline',
            makeHtml: (str: string) => {
              if (!expressions || expressions.length === 0) return str;
              const re = /:([a-zA-Z0-9_\u4e00-\u9fa5]+):/g;
              return str.replace(re, (match, name) => {
                const exp = expressions.find((e) => e.code === name || e.name === name);
                if (!exp) return match;
                const url = ExpressionsService.toImageUrl(exp.imageUrl) || '';
                if (!url) return match;
                return `<img src="${url}" alt="${name}" title="${name}" class="custom-expression" />`;
              });
            },
          },
        }
      },
      toolbars: {
        showToolbar: toolbar !== false,
        // 启用TOC悬浮工具栏
        toc: enableToc ? {
          updateLocationHash: false, // 不更新URL的hash
          defaultModel: 'full' // full: 完整模式，会展示所有标题
        } : false
      },
      editor: {
        defaultModel: previewOnly ? 'previewOnly' : 'editOnly',
        keepDocumentScrollAfterInit: true,
        height: typeof height === 'number' ? `${height}px` : height
      },
      callback: {
        onClickPreview: handleImageClick,
        afterChange: (content: string) => {
          // 标记为用户输入，防止循环更新
          isUserInputRef.current = true;
          lastValueRef.current = content;
          onChange(content);
          // 重置标记，允许后续的外部更新
          setTimeout(() => {
            isUserInputRef.current = false;
          }, 0);
          // 处理自定义表情渲染
          setTimeout(processCustomEmojis, 60);
        },
        afterInit: () => {
          setIsInitialized(true);

          // 监听预览区图片错误，尝试续签 Cookie 后重试一次
          try {
            const previewEl = document.querySelector(`#${containerIdRef.current} .cherry-previewer`);
            if (previewEl) {
              const bindImg = (img: HTMLImageElement) => {
                if (img.getAttribute('data-emoji-bound')) return;
                img.setAttribute('data-emoji-bound', '1');
                const base = String(img.getAttribute('src') || '');
                img.onerror = async () => {
                  try { await ResourceAccessService.ensureSession(); } catch { /* ignore */ }
                  try {
                    const next = base + (base.includes('?') ? '&' : '?') + '_=' + Date.now();
                    img.src = next;
                  } catch { /* ignore */ }
                };
              };
              // 初始绑定
              previewEl.querySelectorAll('img.custom-expression').forEach(img => bindImg(img as HTMLImageElement));
              // 变更绑定
              const mo = new MutationObserver((muts) => {
                muts.forEach((m) => {
                  (m.addedNodes || []).forEach((node) => {
                    if (node instanceof HTMLImageElement && node.classList.contains('custom-expression')) bindImg(node);
                    else if (node instanceof HTMLElement) node.querySelectorAll('img.custom-expression').forEach(img => bindImg(img as HTMLImageElement));
                  });
                });
              });
              mo.observe(previewEl, { childList: true, subtree: true });
            }
          } catch { /* ignore */ }
          
          // 添加全屏按钮 - 延迟确保DOM完全渲染
          setTimeout(() => {
            if (enableFullscreen) {
              try {
                const toolbarElement = document.querySelector(`#${containerIdRef.current} .cherry-toolbar .toolbar-right`);
                if (toolbarElement) {
                  // 检查是否已经存在全屏按钮，避免重复添加
                  const existingBtn = toolbarElement.querySelector('.cherry-fullscreen-btn');
                  if (!existingBtn) {
                    // 创建全屏按钮
                    const fullscreenBtn = document.createElement('span');
                    fullscreenBtn.className = 'cherry-toolbar-button cherry-fullscreen-btn';
                    fullscreenBtn.innerHTML = isFullscreen 
                      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 0 2-2h3M3 16h3a2 2 0 0 0 2 2v3"/></svg>'
                      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
                    
                    fullscreenBtn.style.cssText = `
                      cursor: pointer;
                      padding: 4px 8px;
                      border-radius: 4px;
                      display: inline-flex;
                      align-items: center;
                      justify-content: center;
                      transition: background-color 0.2s;
                      margin: 0 2px;
                    `;

                    fullscreenBtn.onmouseenter = () => {
                      fullscreenBtn.style.backgroundColor = '#f3f4f6';
                    };
                    fullscreenBtn.onmouseleave = () => {
                      fullscreenBtn.style.backgroundColor = 'transparent';
                    };

                    fullscreenBtn.onclick = (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFullscreen();
                    };

                    toolbarElement.appendChild(fullscreenBtn);
                  }
                }
              } catch (error) {
                console.warn('Failed to add fullscreen button:', error);
              }
            }
          }, 200);

          // 添加资源库按钮
          setTimeout(() => {
            try {
              const toolbarElement = document.querySelector(`#${containerIdRef.current} .cherry-toolbar .toolbar-right`);
              if (toolbarElement && onOpenResourcePicker) {
                const existingBtn = toolbarElement.querySelector('.cherry-resource-btn');
                if (!existingBtn) {
                  const resBtn = document.createElement('span');
                  resBtn.className = 'cherry-toolbar-button cherry-resource-btn';
                  resBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
                  resBtn.style.cssText = `cursor:pointer;padding:4px 8px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;transition:background-color .2s;margin:0 2px;`;
                  resBtn.onmouseenter = () => { resBtn.style.backgroundColor = '#f3f4f6'; };
                  resBtn.onmouseleave = () => { resBtn.style.backgroundColor = 'transparent'; };
                  resBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); try { onOpenResourcePicker(); } catch { /* ignore */ } };
                  toolbarElement.appendChild(resBtn);
                }
              }
            } catch (e) {
              console.warn('Failed to add resource button:', e);
            }
          }, 240);

          // 添加表情按钮
          setTimeout(() => {
            try {
              const toolbarElement = document.querySelector(`#${containerIdRef.current} .cherry-toolbar .toolbar-right`);
              if (toolbarElement) {
                const existingBtn = toolbarElement.querySelector('.cherry-emoji-btn');
                if (!existingBtn) {
                  const emojiBtn = document.createElement('span');
                  emojiBtn.className = 'cherry-toolbar-button cherry-emoji-btn';
                  emojiBtn.innerHTML = '😊';
                  emojiBtn.style.cssText = `cursor:pointer;padding:4px 8px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-size:16px;transition:background-color .2s;margin:0 2px;`;
                  emojiBtn.onmouseenter = () => { emojiBtn.style.backgroundColor = '#f3f4f6'; };
                  emojiBtn.onmouseleave = () => { emojiBtn.style.backgroundColor = 'transparent'; };
                  emojiBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); setIsExprOpen(true); };
                  toolbarElement.appendChild(emojiBtn);
                }
              }
            } catch (e) {
              console.warn('Failed to add emoji button:', e);
            }
          }, 260);

          // 初始化后先处理一次表情
          setTimeout(processCustomEmojis, 100);
        }
      },
      fileUpload: handleFileUpload
    };

    // 工具栏配置
    if (Array.isArray(toolbar)) {
      if (toolbar.length === 0) {
        config.toolbars.showToolbar = false;
      }
    }

    return config as unknown;
  }, [previewOnly, height, placeholder, toolbar, enableFullscreen, enableToc, expressions, processCustomEmojis]);

  // 初始化Cherry编辑器
  useEffect(() => {
    if (previewOnly) return;
    // 只有在容器可用且 echarts 加载完成后才初始化
    if (!containerRef.current || !isEchartsLoaded) return;

    const initEditor = async () => {
      try {
        const config = getCherryConfig();
        cherryInstanceRef.current = new Cherry(config as never);
        
        // 初始化时设置正确的初始值
        if (value && value !== placeholder) {
          cherryInstanceRef.current.setValue(value, false);
          lastValueRef.current = value;
        }
      } catch (error) {
        console.error('Failed to initialize Cherry editor:', error);
      }
    };

    initEditor();

    // 清理函数
    return () => {
      if (cherryInstanceRef.current) {
        try {
          cherryInstanceRef.current.destroy?.();
        } catch (error) {
          console.error('Failed to destroy Cherry editor:', error);
        }
        cherryInstanceRef.current = null;
      }
    };
  }, [getCherryConfig, isEchartsLoaded, previewOnly]);

  // 加载表情列表（需登录；游客跳过以避免 401）
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!localStorage.getItem('auth_token')) return;
      try {
        const list = await ExpressionsService.getAll();
        if (!mounted) return;
        setExpressions(list || []);
        setTimeout(processCustomEmojis, 120);
      } catch { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, [processCustomEmojis]);

  // 注意：不在全屏切换时重建实例，保持原行为，避免闪烁

  // 同步外部value变化（优化逻辑，避免循环更新）
  useEffect(() => {
    if (isInitialized && cherryInstanceRef.current && value !== undefined) {
      // 如果是用户输入引起的变化，跳过setValue
      if (isUserInputRef.current) {
        return;
      }
      
      const currentValue = cherryInstanceRef.current.getValue();
      // 只有当内容真正不同且不是用户刚刚输入的内容时才调用setValue
      if (currentValue !== value && lastValueRef.current !== value) {
        cherryInstanceRef.current.setValue(value, false); // 使用false保持光标位置
        lastValueRef.current = value;
      }
    }
  }, [value, isInitialized]);

  // 同步previewOnly模式变化
  useEffect(() => {
    if (isInitialized && cherryInstanceRef.current) {
      const targetModel = previewOnly ? 'previewOnly' : 'editOnly';
      cherryInstanceRef.current.switchModel(targetModel);
    }
  }, [previewOnly, isInitialized]);

  // 更新全屏按钮图标状态
  useEffect(() => {
    if (isInitialized && enableFullscreen) {
      const fullscreenBtn = document.querySelector(`#${containerIdRef.current} .cherry-fullscreen-btn`);
      if (fullscreenBtn) {
        fullscreenBtn.innerHTML = isFullscreen 
          ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 0 2-2h3M3 16h3a2 2 0 0 0 2 2v3"/></svg>'
          : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
      }
    }
  }, [isFullscreen, isInitialized, enableFullscreen]);

  // 向外暴露插入能力
  useImperativeHandle(ref, () => ({
    insertMarkdown: (snippet: string) => {
      try {
        const inst = cherryInstanceRef.current as unknown as { editor?: { editor?: { replaceSelection?: (text: string) => void; focus?: () => void } } } | null;
        const cm = inst?.editor?.editor;
        if (cm && typeof cm.replaceSelection === 'function') {
          cm.replaceSelection(snippet);
          cm.focus?.();
          return;
        }
      } catch { /* ignore */ }
      // 兼容：无法获取光标时，追加到末尾
      try {
        const inst = cherryInstanceRef.current as unknown as { getValue?: () => string; setValue?: (v: string, keepCursor?: boolean) => void } | null;
        const current = inst?.getValue ? inst.getValue() : value;
        const needsLF = !!current && !current.endsWith('\n');
        const next = `${current || ''}${needsLF ? '\n' : ''}${snippet}`;
        if (inst?.setValue) {
          inst.setValue(next, false);
        } else {
          onChange(next);
        }
      } catch {
        // 兜底：直接更新
        const current = value || '';
        const needsLF = !!current && !current.endsWith('\n');
        onChange(`${current}${needsLF ? '\n' : ''}${snippet}`);
      }
    },
    replaceRangeByIndex: (start: number, end: number, replacement: string) => {
      try {
        const inst = cherryInstanceRef.current as unknown as {
          editor?: { editor?: any }
        } | null;
        const cm = inst?.editor?.editor;
        if (cm && typeof cm.replaceRange === 'function') {
          const from = typeof cm.posFromIndex === 'function' ? cm.posFromIndex(start) : (() => {
            // 退化：手动计算行列
            const cur = (typeof cm.getValue === 'function' ? cm.getValue() : lastValueRef.current) || '';
            let line = 0; let ch = 0;
            for (let i = 0; i < Math.min(start, cur.length); i++) {
              if (cur[i] === '\n') { line++; ch = 0; } else { ch++; }
            }
            return { line, ch };
          })();
          const to = typeof cm.posFromIndex === 'function' ? cm.posFromIndex(end) : (() => {
            const cur = (typeof cm.getValue === 'function' ? cm.getValue() : lastValueRef.current) || '';
            let line = 0; let ch = 0;
            for (let i = 0; i < Math.min(end, cur.length); i++) {
              if (cur[i] === '\n') { line++; ch = 0; } else { ch++; }
            }
            return { line, ch };
          })();
          if (typeof cm.operation === 'function') {
            cm.operation(() => {
              cm.replaceRange(replacement, from, to, '+insert');
              if (typeof cm.posFromIndex === 'function') {
                const pos = cm.posFromIndex(start + replacement.length);
                cm.setCursor?.(pos);
              }
            });
          } else {
            cm.replaceRange(replacement, from, to, '+insert');
          }
          cm.focus?.();
          return;
        }
      } catch { /* ignore */ }
      // 无法直接操作编辑器，回退为字符串替换
      try {
        const inst = cherryInstanceRef.current as unknown as { getValue?: () => string; setValue?: (v: string, keepCursor?: boolean) => void } | null;
        const cur = inst?.getValue ? inst.getValue() : lastValueRef.current || '';
        const next = `${cur.slice(0, start)}${replacement}${cur.slice(end)}`;
        if (inst?.setValue) {
          inst.setValue(next, false);
        } else {
          onChange(next);
        }
      } catch {
        const cur = lastValueRef.current || '';
        const next = `${cur.slice(0, start)}${replacement}${cur.slice(end)}`;
        onChange(next);
      }
    },
    focus: () => {
      try {
        const inst = cherryInstanceRef.current as unknown as { editor?: { editor?: { focus?: () => void } } } | null;
        inst?.editor?.editor?.focus?.();
      } catch { /* ignore */ }
    }
  }), [value, onChange]);

  if (previewOnly) {
    return <MarkdownContent content={value || ''} className={className} />;
  }

  return (
    <div 
      className={`markdown-editor-wrapper ${isFullscreen ? 'fixed inset-0 z-[1200] bg-white overflow-auto' : 'relative'} ${className}`}
      style={{ 
        height: isFullscreen ? '100vh' : (typeof height === 'number' ? `${height}px` : height),
        width: isFullscreen ? '100vw' : '100%'
      }}
    >
      <div 
        ref={containerRef}
        id={containerIdRef.current}
        className={`cherry-editor-container w-full h-full overflow-hidden ${
          previewOnly ? '' : 'rounded-xl border border-gray-300'
        }`}
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: isFullscreen ? '0' : (previewOnly ? '0' : undefined),
          border: isFullscreen ? 'none' : (previewOnly ? 'none' : undefined)
        }}
        onKeyDown={onKeyDown}
      />
      {/* 上传任务小面板 */}
      {uploadTasks.length > 0 && (
        <div className="absolute right-3 bottom-3 z-50 max-w-[320px] space-y-2">
          {uploadTasks.map(task => (
            <div key={task.id} className={`rounded-lg border bg-white shadow-sm p-3 ${task.status !== 'uploading' ? 'opacity-90' : ''}`}>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="truncate mr-2" title={task.name}>
                  {task.type === 'image' ? '图片' : '视频'}上传中：{task.name}
                </div>
                {task.status === 'uploading' && (
                  <button
                    className="text-gray-500 hover:text-gray-800"
                    onClick={() => cancelUpload(task.id)}
                    title="取消上传"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${task.status === 'error' ? 'bg-red-400' : task.status === 'canceled' ? 'bg-gray-400' : 'bg-blue-500'}`}
                  style={{ width: `${task.status === 'success' ? 100 : task.progress}%` }}
                />
              </div>
              {task.status !== 'uploading' && (
                <div className="mt-1 text-xs text-gray-500">
                  {task.status === 'success' && '完成'}
                  {task.status === 'error' && (task.error || '失败')}
                  {task.status === 'canceled' && '已取消'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 表情选择弹窗 */}
      <Dialog open={isExprOpen} onOpenChange={setIsExprOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>插入表情</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-3">
            {(expressions || []).map((exp) => {
              const url = ExpressionsService.toImageUrl(exp.imageUrl) || '';
              return (
                <button
                  key={exp.code}
                  type="button"
                  className="flex flex-col items-center gap-2 p-2 rounded hover:bg-gray-100"
                  title={`${exp.name} (${exp.code})`}
                  onClick={() => {
                    try {
                      const inst = cherryInstanceRef.current as unknown as { editor?: { editor?: { replaceSelection?: (text: string) => void; focus?: () => void } } } | null;
                      const cm = inst?.editor?.editor;
                      const snippet = `:${exp.code}:`;
                      if (cm?.replaceSelection) {
                        cm.replaceSelection(snippet);
                        cm.focus?.();
                      } else {
                        // 兜底：直接更新
                        const current = lastValueRef.current || '';
                        const needsLF = !!current && !current.endsWith('\n');
                        onChange(`${current}${needsLF ? '\n' : ''}${snippet}`);
                      }
                    } catch { /* ignore */ }
                    setIsExprOpen(false);
                    // 选中后稍后渲染一次
                    setTimeout(processCustomEmojis, 120);
                  }}
                >
                  <img src={url} className="w-8 h-8 rounded object-contain" />
                  <span className="text-xs text-gray-600 truncate max-w-[80px]">{exp.name}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-gray-500">提示：支持直接输入 :表情代码: 插入表情</div>
          <div className="mt-2 text-right">
            <Button variant="secondary" onClick={() => setIsExprOpen(false)}>关闭</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const MarkdownEditor = forwardRef(MarkdownEditorImpl);
