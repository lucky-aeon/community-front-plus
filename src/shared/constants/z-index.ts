/**
 * 全局 Z-Index 层级常量管理
 * 统一管理应用中所有元素的层级关系，避免层级冲突
 */

export const Z_INDEX = {
  // 基础层级
  BASE: 0,
  
  // 导航和布局层级
  NAVIGATION: 100,        // 主导航栏
  SIDEBAR: 90,            // 侧边栏
  HEADER: 80,             // 页面头部
  
  // 浮层元素
  DROPDOWN: 200,          // 下拉菜单
  TOOLTIP: 250,           // 工具提示
  POPOVER: 280,           // 气泡提示
  
  // 弹窗层级（核心）
  OVERLAY: 1000,          // 弹窗遮罩层
  MODAL: 1050,            // 普通弹窗
  IMPORTANT_MODAL: 1100,  // 重要弹窗（如章节管理）
  NESTED_MODAL: 1150,     // 嵌套弹窗（弹窗内的弹窗）
  
  // 顶层元素
  CONFIRM_DIALOG: 1200,   // 确认对话框
  TOAST: 1250,            // 通知提示
  LOADING: 1300,          // 全局加载状态
  
  // 调试和特殊用途
  DEBUG: 9999,            // 调试用最高层级
  EMERGENCY: 10000        // 紧急情况用（慎用）
} as const;

/**
 * 层级使用指南：
 * 
 * 1. NAVIGATION (100): 主导航栏、管理员导航等
 * 2. DROPDOWN (200): 下拉菜单、选择器等
 * 3. MODAL (1050): 普通弹窗、表单弹窗等
 * 4. IMPORTANT_MODAL (1100): 重要业务弹窗，需要突出显示
 * 5. CONFIRM_DIALOG (1200): 确认删除等重要确认弹窗
 * 6. TOAST (1250): 成功/错误提示等
 * 
 * 使用方法：
 * - CSS: z-index: 1050; (使用具体数值)
 * - React inline: style={{ zIndex: Z_INDEX.MODAL }}
 * - Tailwind: 暂不支持自定义z-index，使用style属性
 */

export type ZIndexLevel = typeof Z_INDEX[keyof typeof Z_INDEX];

/**
 * 获取指定层级的下一个可用层级
 * 用于需要在某个层级之上显示的场景
 */
export const getNextZIndex = (baseLevel: ZIndexLevel): number => {
  return baseLevel + 1;
};

/**
 * 层级验证函数
 * 确保使用的层级在合理范围内
 */
export const validateZIndex = (zIndex: number): boolean => {
  const values = Object.values(Z_INDEX);
  return values.includes(zIndex) || (zIndex > Z_INDEX.BASE && zIndex < Z_INDEX.EMERGENCY);
};