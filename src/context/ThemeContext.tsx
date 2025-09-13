import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ButtonVariantConfig, getVariantByKey, DEFAULT_VARIANT_KEY } from '@shared/constants/buttonVariants';

interface ThemeContextType {
  currentVariant: ButtonVariantConfig | null;
  setCurrentVariant: (variant: ButtonVariantConfig) => void;
  setVariantByKey: (key: string) => void;
  resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentVariant, setCurrentVariant] = useState<ButtonVariantConfig | null>(
    getVariantByKey(DEFAULT_VARIANT_KEY)
  );

  const setVariantByKey = (key: string) => {
    const variant = getVariantByKey(key);
    if (variant) {
      setCurrentVariant(variant);
    }
  };

  const resetToDefault = () => {
    const defaultVariant = getVariantByKey(DEFAULT_VARIANT_KEY);
    if (defaultVariant) {
      setCurrentVariant(defaultVariant);
    }
  };

  const value: ThemeContextType = {
    currentVariant,
    setCurrentVariant,
    setVariantByKey,
    resetToDefault
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};