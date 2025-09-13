import React, { useRef, useEffect, useState, useCallback } from 'react';
import Cherry from 'cherry-markdown';
import 'cherry-markdown/dist/cherry-markdown.css';
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  previewOnly?: boolean;
  height?: string | number;
  placeholder?: string;
  toolbar?: boolean | string[];
  className?: string;
  enableFullscreen?: boolean;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  previewOnly = false,
  height = 400,
  placeholder = '请输入markdown内容...',
  toolbar = true,
  className = '',
  enableFullscreen = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cherryInstanceRef = useRef<Cherry | null>(null);
  const containerIdRef = useRef(`markdown-editor-${Math.random().toString(36).substr(2, 9)}`);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 添加更新来源跟踪，防止循环更新
  const isUserInputRef = useRef(false);
  const lastValueRef = useRef(value);

  // 全屏切换功能
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

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

  // 文件上传处理
  const handleFileUpload = useCallback(async (file: File, callback: (url: string, params?: Record<string, unknown>) => void) => {
    // 简单的本地文件预览实现
    // 在实际项目中，这里应该上传到服务器
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      callback(result, {
        name: file.name.replace(/\.[^.]+$/, ''),
        isShadow: true,
        isRadius: true,
        width: '100%',
        height: 'auto'
      });
    };
    reader.readAsDataURL(file);
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
            engine: 'MathJax',
            src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js'
          },
          inlineMath: {
            engine: 'MathJax'
          },
          codeBlock: {
            expandCode: true
          }
        }
      },
      toolbars: {
        showToolbar: toolbar !== false
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
        },
        afterInit: (cherry: Cherry) => {
          setIsInitialized(true);
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
        }
      },
      fileUpload: handleFileUpload
    };

    // 工具栏配置
    if (Array.isArray(toolbar)) {
      if (toolbar.length === 0) {
        config.toolbars.showToolbar = false;
      } else {
        config.toolbars.toolbar = toolbar;
      }
    }

    return config;
  }, [previewOnly, height, placeholder, toolbar, handleImageClick, handleFileUpload, enableFullscreen, isFullscreen, toggleFullscreen]);

  // 初始化Cherry编辑器
  useEffect(() => {
    if (!containerRef.current) return;

    const initEditor = async () => {
      try {
        const config = getCherryConfig();
        cherryInstanceRef.current = new Cherry(config);
        
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
  }, [getCherryConfig]);

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

  return (
    <div 
      className={`markdown-editor-wrapper ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}
      style={{ 
        height: isFullscreen ? '100vh' : (typeof height === 'number' ? `${height}px` : height),
        width: isFullscreen ? '100vw' : '100%'
      }}
    >
      <div 
        ref={containerRef}
        id={containerIdRef.current}
        className="cherry-editor-container w-full h-full rounded-xl border border-gray-300 overflow-hidden"
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: isFullscreen ? '0' : undefined,
          border: isFullscreen ? 'none' : undefined
        }}
      />
    </div>
  );
};