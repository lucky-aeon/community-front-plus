import React, { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Z_INDEX, ZIndexLevel } from '../../constants/z-index';

export interface PortalModalProps {
  /** 是否显示模态框 */
  isOpen: boolean;
  /** 关闭模态框的回调函数 */
  onClose: () => void;
  /** 模态框内容 */
  children: ReactNode;
  /** Z-index层级，默认为普通模态框层级 */
  zIndex?: ZIndexLevel;
  /** 是否显示遮罩层，默认为true */
  showOverlay?: boolean;
  /** 点击遮罩层是否关闭，默认为true */
  closeOnOverlayClick?: boolean;
  /** 按ESC键是否关闭，默认为true */
  closeOnEscape?: boolean;
  /** 自定义容器类名 */
  containerClassName?: string;
  /** 自定义遮罩层类名 */
  overlayClassName?: string;
  /** 模态框的ARIA标签 */
  ariaLabel?: string;
  /** 模态框的ARIA描述 */
  ariaDescribedBy?: string;
}

/**
 * 通用Portal模态框组件
 * 提供统一的弹窗管理、层级控制、可访问性支持
 */
export const PortalModal: React.FC<PortalModalProps> = ({
  isOpen,
  onClose,
  children,
  zIndex = Z_INDEX.MODAL,
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  containerClassName = '',
  overlayClassName = '',
  ariaLabel,
  ariaDescribedBy
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // 处理ESC键关闭
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, closeOnEscape, onClose]);

  // 焦点管理
  useEffect(() => {
    if (isOpen) {
      // 保存当前焦点元素
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // 将焦点移到模态框
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 0);

      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复焦点
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }

      // 恢复滚动
      document.body.style.overflow = '';
    }

    // 清理函数
    return () => {
      if (!isOpen) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  // 处理遮罩层点击
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  // 如果不显示则返回null
  if (!isOpen) {
    return null;
  }

  // 获取Portal容器
  const portalContainer = document.getElementById('modal-root');
  if (!portalContainer) {
    console.warn('PortalModal: modal-root容器未找到，请确保在index.html中添加了<div id="modal-root"></div>');
    return null;
  }

  const modalContent = (
    <div
      ref={modalRef}
      className={`fixed inset-0 flex items-center justify-center ${containerClassName}`}
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      tabIndex={-1}
      onClick={handleOverlayClick}
    >
      {/* 遮罩层 */}
      {showOverlay && (
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity ${overlayClassName}`}
          aria-hidden="true"
        />
      )}
      
      {/* 模态框内容 */}
      <div 
        className="relative z-10 max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, portalContainer);
};

/**
 * 模态框Hook - 提供更简洁的使用方式
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};