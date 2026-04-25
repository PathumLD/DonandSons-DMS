import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Theme Store for Dark/Light Mode + Page-Specific Color Coding
 * 
 * Manages:
 * 1. Dark/Light theme mode (system-wide)
 * 2. Per-page color coding (as per requirement 4.i)
 * 
 * Admin can set custom theme colors for specific pages. These colors apply to:
 * - Page headers/titles
 * - Primary action buttons
 * - Important text (e.g., reference numbers)
 * - Navigation menu selection highlight
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface PageTheme {
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
}

export interface ThemeStore {
  // Dark/Light mode
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  
  // Page-specific color coding
  pageThemes: Record<string, PageTheme>;
  setPageTheme: (pageKey: string, theme: PageTheme) => void;
  getPageTheme: (pageKey: string) => PageTheme;
  resetPageTheme: (pageKey: string) => void;
  resetAllThemes: () => void;
  
  // Hydration tracking
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

// Default page themes
const DEFAULT_THEMES: Record<string, PageTheme> = {
  delivery: { primaryColor: '#3B82F6', secondaryColor: '#C8102E' },
  disposal: { primaryColor: '#DC2626', secondaryColor: '#B91C1C' },
  transfer: { primaryColor: '#F59E0B', secondaryColor: '#D97706' },
  'stock-bf': { primaryColor: '#8B5CF6', secondaryColor: '#7C3AED' },
  cancellation: { primaryColor: '#EF4444', secondaryColor: '#DC2626' },
  'delivery-return': { primaryColor: '#F97316', secondaryColor: '#EA580C' },
  'label-printing': { primaryColor: '#10B981', secondaryColor: '#059669' },
  'daily-production': { primaryColor: '#0EA5E9', secondaryColor: '#0284C7' },
  'production-cancel': { primaryColor: '#EC4899', secondaryColor: '#DB2777' },
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Dark/Light mode state
      mode: 'light',
      _hasHydrated: false,

      setMode: (mode: ThemeMode) => {
        set({ mode });
      },

      toggleMode: () => {
        const currentMode = get().mode;
        const newMode = currentMode === 'light' ? 'dark' : 'light';
        set({ mode: newMode });
      },

      // Page themes state
      pageThemes: { ...DEFAULT_THEMES },

      setPageTheme: (pageKey: string, theme: PageTheme) => {
        set((state) => ({
          pageThemes: {
            ...state.pageThemes,
            [pageKey]: theme,
          },
        }));
      },

      getPageTheme: (pageKey: string) => {
        const theme = get().pageThemes[pageKey];
        return theme ?? DEFAULT_THEMES[pageKey] ?? DEFAULT_THEMES.delivery;
      },

      resetPageTheme: (pageKey: string) => {
        set((state) => ({
          pageThemes: {
            ...state.pageThemes,
            [pageKey]: DEFAULT_THEMES[pageKey] || DEFAULT_THEMES.delivery,
          },
        }));
      },

      resetAllThemes: () => {
        set({ pageThemes: { ...DEFAULT_THEMES } });
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'dms-theme-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
