import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDaysISO } from '@/lib/date-restrictions';

/**
 * Day End Process Store
 * 
 * Tracks the last submitted Day-End Process date.
 * This date is used across the system for:
 * - Reports: Can only generate reports for dates AFTER this date
 * - Operations: Various date restrictions based on last day-end
 */

interface DayEndStore {
  lastDayEndProcessDate: string | null;
  setLastDayEndProcessDate: (date: string) => void;
  getMinReportDate: () => string;
}

export const useDayEndStore = create<DayEndStore>()(
  persist(
    (set, get) => ({
      // Default to yesterday for demo purposes
      lastDayEndProcessDate: addDaysISO(-1),

      setLastDayEndProcessDate: (date: string) => {
        set({ lastDayEndProcessDate: date });
      },

      /**
       * Returns the minimum date allowed for report generation.
       * This is the day AFTER the last Day-End Process date.
       */
      getMinReportDate: () => {
        const lastDate = get().lastDayEndProcessDate;
        if (!lastDate) return addDaysISO(0); // Today if no day-end exists
        
        const d = new Date(lastDate);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
      },
    }),
    {
      name: 'dms-day-end-storage',
    }
  )
);
