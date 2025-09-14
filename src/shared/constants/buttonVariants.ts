export interface ButtonVariantConfig {
  name: string;
  key: string;
  primary: string;
  secondary?: string;
  outline?: string;
  ghost?: string;
  description: string;
  category: 'classic-yellow' | 'warm-yellow' | 'premium-gold' | 'gradient-yellow' | 'soft-yellow';
  recommended?: boolean;
  colorFamily: string;
  brightness: 'light' | 'medium' | 'deep'; // 亮度分类
  warmth: 'cool' | 'neutral' | 'warm'; // 色温分类
}

// 专为敲鸭品牌设计的黄色延伸变体系统
export const buttonVariants: ButtonVariantConfig[] = [
  // === 经典黄色系列 - 不同饱和度的纯黄色 ===
  {
    name: '活力黄',
    key: 'vibrant-yellow',
    primary: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500',
    secondary: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 hover:border-yellow-300',
    outline: 'border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white',
    ghost: 'text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700',
    description: '纯正活力黄，饱和度高，充满生机',
    category: 'classic-yellow',
    colorFamily: '纯黄系',
    recommended: true,
    brightness: 'medium',
    warmth: 'neutral'
  },
  {
    name: '经典黄',
    key: 'classic-yellow',
    primary: 'bg-yellow-400 hover:bg-yellow-500 text-white shadow-md hover:shadow-lg focus:ring-yellow-400',
    secondary: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300',
    outline: 'border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-400 hover:text-white',
    ghost: 'text-yellow-600 hover:bg-yellow-100 hover:text-yellow-800',
    description: '经典敲鸭黄，平衡的饱和度',
    category: 'classic-yellow',
    colorFamily: '纯黄系',
    recommended: true,
    brightness: 'medium',
    warmth: 'neutral'
  },
  {
    name: '深邃黄',
    key: 'deep-yellow',
    primary: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg hover:shadow-xl focus:ring-yellow-600',
    secondary: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-200 hover:border-yellow-300',
    outline: 'border-2 border-yellow-600 text-yellow-700 hover:bg-yellow-600 hover:text-white',
    ghost: 'text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800',
    description: '深邃浓郁，专业感强',
    category: 'classic-yellow',
    colorFamily: '纯黄系',
    brightness: 'deep',
    warmth: 'neutral'
  },

  // === 暖调黄色系列 - 偏橙调的温暖黄色 ===
  {
    name: '当前黄橙渐变',
    key: 'current-yellow',
    primary: 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500',
    secondary: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300',
    outline: 'border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-400 hover:text-white',
    ghost: 'text-yellow-600 hover:bg-yellow-100 hover:text-yellow-800',
    description: '现有经典渐变，活力橙黄',
    category: 'gradient-yellow',
    colorFamily: '渐变黄系',
    recommended: true,
    brightness: 'medium',
    warmth: 'warm'
  },
  {
    name: '暖金黄',
    key: 'warm-yellow',
    primary: 'bg-yellow-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500',
    secondary: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 hover:border-amber-300',
    outline: 'border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white',
    ghost: 'text-amber-600 hover:bg-amber-50 hover:text-amber-700',
    description: '温暖金黄调，亲和力强',
    category: 'warm-yellow',
    colorFamily: '暖黄系',
    brightness: 'medium',
    warmth: 'warm'
  },
  {
    name: '蜂蜜黄',
    key: 'honey-yellow',
    primary: 'bg-amber-400 hover:bg-amber-500 text-white shadow-md hover:shadow-lg focus:ring-amber-400',
    secondary: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 hover:border-amber-300',
    outline: 'border-2 border-amber-400 text-amber-600 hover:bg-amber-400 hover:text-white',
    ghost: 'text-amber-600 hover:bg-amber-50 hover:text-amber-700',
    description: '自然蜂蜜色，甜美温暖',
    category: 'warm-yellow',
    colorFamily: '暖黄系',
    brightness: 'medium',
    warmth: 'warm'
  },
  {
    name: '琥珀黄',
    key: 'amber-yellow',
    primary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl focus:ring-amber-600',
    secondary: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 hover:border-amber-300',
    outline: 'border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white',
    ghost: 'text-amber-700 hover:bg-amber-50 hover:text-amber-800',
    description: '深度琥珀色，沉稳大气',
    category: 'warm-yellow',
    colorFamily: '暖黄系',
    brightness: 'deep',
    warmth: 'warm'
  },

  // === 高级金色系列 - 有质感的金黄色 ===
  {
    name: '香槟金',
    key: 'champagne-gold',
    primary: 'bg-gradient-to-r from-yellow-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 text-yellow-900 shadow-lg hover:shadow-xl focus:ring-yellow-400',
    secondary: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 hover:border-yellow-300',
    outline: 'border-2 border-yellow-300 text-yellow-600 hover:bg-yellow-300 hover:text-yellow-900',
    ghost: 'text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700',
    description: '优雅香槟金，高级质感',
    category: 'premium-gold',
    colorFamily: '金色系',
    recommended: true,
    brightness: 'light',
    warmth: 'neutral'
  },
  {
    name: '古典金',
    key: 'classic-gold',
    primary: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500',
    secondary: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300',
    outline: 'border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white',
    ghost: 'text-yellow-600 hover:bg-yellow-100 hover:text-yellow-800',
    description: '古典金色，庄重典雅',
    category: 'premium-gold',
    colorFamily: '金色系',
    brightness: 'medium',
    warmth: 'neutral'
  },
  {
    name: '阳光金',
    key: 'sunshine-gold',
    primary: 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-md hover:shadow-lg focus:ring-yellow-400',
    secondary: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 hover:border-yellow-300',
    outline: 'border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-400 hover:text-white',
    ghost: 'text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700',
    description: '明亮阳光金，活力四射',
    category: 'premium-gold',
    colorFamily: '金色系',
    brightness: 'medium',
    warmth: 'warm'
  },

  // === 柔和黄色系列 - 淡雅温和的黄色 ===
  {
    name: '柔和黄',
    key: 'soft-yellow',
    primary: 'bg-yellow-300 hover:bg-yellow-400 text-yellow-900 shadow-md hover:shadow-lg focus:ring-yellow-300',
    secondary: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 hover:border-yellow-300',
    outline: 'border-2 border-yellow-300 text-yellow-600 hover:bg-yellow-300 hover:text-yellow-900',
    ghost: 'text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700',
    description: '柔和温雅，舒适护眼',
    category: 'soft-yellow',
    colorFamily: '柔和黄系',
    brightness: 'light',
    warmth: 'neutral'
  },
  {
    name: '淡雅黄',
    key: 'elegant-yellow',
    primary: 'bg-yellow-200 hover:bg-yellow-300 text-yellow-800 shadow-sm hover:shadow-md focus:ring-yellow-200',
    secondary: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-150 hover:border-yellow-200',
    outline: 'border-2 border-yellow-200 text-yellow-600 hover:bg-yellow-200 hover:text-yellow-800',
    ghost: 'text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700',
    description: '淡雅清新，优雅气质',
    category: 'soft-yellow',
    colorFamily: '柔和黄系',
    brightness: 'light',
    warmth: 'cool'
  },

  // === 特殊渐变系列 - 创意黄色渐变 ===
  {
    name: '金黄渐变',
    key: 'gold-gradient',
    primary: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-yellow-500 hover:from-amber-500 hover:via-yellow-500 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500',
    secondary: 'bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 text-yellow-700 border border-yellow-200',
    outline: 'border-2 border-yellow-400 text-yellow-600 hover:bg-gradient-to-r hover:from-amber-400 hover:to-yellow-500 hover:text-white',
    ghost: 'text-yellow-600 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50',
    description: '奢华金黄渐变，层次丰富',
    category: 'gradient-yellow',
    colorFamily: '渐变黄系',
    recommended: true,
    brightness: 'medium',
    warmth: 'warm'
  },
  {
    name: '柔和渐变',
    key: 'soft-gradient',
    primary: 'bg-gradient-to-r from-yellow-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 text-yellow-900 shadow-md hover:shadow-lg focus:ring-yellow-400',
    secondary: 'bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-150 text-yellow-700 border border-yellow-200',
    outline: 'border-2 border-yellow-300 text-yellow-600 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-yellow-400 hover:text-yellow-900',
    ghost: 'text-yellow-600 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-yellow-100',
    description: '温和渐变过渡，自然舒适',
    category: 'gradient-yellow',
    colorFamily: '渐变黄系',
    brightness: 'light',
    warmth: 'neutral'
  }
];

// 获取推荐的黄色变体
export const getRecommendedYellowVariants = (): ButtonVariantConfig[] => {
  return buttonVariants.filter(variant => variant.recommended);
};

// 根据类别获取黄色变体
export const getYellowVariantsByCategory = (category: ButtonVariantConfig['category']): ButtonVariantConfig[] => {
  return buttonVariants.filter(variant => variant.category === category);
};

// 根据亮度获取黄色变体
export const getYellowVariantsByBrightness = (brightness: 'light' | 'medium' | 'deep'): ButtonVariantConfig[] => {
  return buttonVariants.filter(variant => variant.brightness === brightness);
};

// 根据色温获取黄色变体
export const getYellowVariantsByWarmth = (warmth: 'cool' | 'neutral' | 'warm'): ButtonVariantConfig[] => {
  return buttonVariants.filter(variant => variant.warmth === warmth);
};

// 根据色系获取黄色变体
export const getYellowVariantsByColorFamily = (colorFamily: string): ButtonVariantConfig[] => {
  return buttonVariants.filter(variant => variant.colorFamily === colorFamily);
};

// 根据key获取黄色变体
export const getVariantByKey = (key: string): ButtonVariantConfig | undefined => {
  return buttonVariants.find(variant => variant.key === key);
};

// 获取所有黄色变体
export const getAllYellowVariants = (): ButtonVariantConfig[] => {
  return buttonVariants;
};

// 当前使用的变体key
export const DEFAULT_VARIANT_KEY = 'elegant-yellow'; // 淡雅黄 - 敲鸭官方推荐主题色
export const RECOMMENDED_VARIANT_KEY = 'elegant-yellow'; // 淡雅黄 - 优雅气质，符合品牌调性

// 获取当前变体
export const getCurrentVariant = (): ButtonVariantConfig => {
  return getVariantByKey(DEFAULT_VARIANT_KEY) || buttonVariants[0];
};

// 获取推荐变体
export const getRecommendedVariant = (): ButtonVariantConfig => {
  return getVariantByKey(RECOMMENDED_VARIANT_KEY) || buttonVariants[0];
};

// 兼容旧版本API - 重定向到黄色变体
export const getVariantsByCategory = (category: string): ButtonVariantConfig[] => {
  // 兼容旧的调用，返回对应的黄色类别
  const categoryMap: Record<string, ButtonVariantConfig['category']> = {
    'premium': 'premium-gold',
    'classic': 'classic-yellow',
    'warm': 'warm-yellow',
    'soft': 'soft-yellow',
    'gradient': 'gradient-yellow'
  };
  
  const yellowCategory = categoryMap[category];
  return yellowCategory ? getYellowVariantsByCategory(yellowCategory) : [];
};

export const getVariantsByColorFamily = (colorFamily: string): ButtonVariantConfig[] => {
  return getYellowVariantsByColorFamily(colorFamily);
};

export const getWhiteThemeRecommendedVariants = (): ButtonVariantConfig[] => {
  return getRecommendedYellowVariants();
};

export const getVariantsByWhiteThemeScore = (): ButtonVariantConfig[] => {
  return getRecommendedYellowVariants();
};

export const getVariantsByContrast = (): ButtonVariantConfig[] => {
  return getRecommendedYellowVariants();
};