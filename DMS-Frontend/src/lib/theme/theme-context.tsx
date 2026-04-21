'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { brandColors } from './colors';

interface ThemeContextType {
  pageColor: string;
  setPageColor: (color: string) => void;
  resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultColor?: string;
}

/**
 * Theme Provider for Don & Sons DMS
 * Manages per-page color coding system
 * Admin can configure custom colors for each page via Label Settings
 */
export function ThemeProvider({ children, defaultColor }: ThemeProviderProps) {
  const [pageColor, setPageColor] = useState<string>(
    defaultColor || brandColors.primary.DEFAULT
  );

  // Apply CSS custom property when color changes
  useEffect(() => {
    document.documentElement.style.setProperty('--page-accent-color', pageColor);
  }, [pageColor]);

  const resetToDefault = () => {
    setPageColor(brandColors.primary.DEFAULT);
  };

  return (
    <ThemeContext.Provider value={{ pageColor, setPageColor, resetToDefault }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access and modify theme colors
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
