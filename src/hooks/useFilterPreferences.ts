import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'app-filter-preferences';

export type DateWindow = 'all' | 'today' | 'next3' | 'next30';
export type SortDir = 'asc' | 'desc';

/**
 * One shared filter store every view reads. Filters live only in the sidebar,
 * are persisted to localStorage, and are never duplicated in a page toolbar.
 *
 * `segment` and `status` are free-form so each deployment can map them onto
 * its own vocabulary without changing this type.
 */
export interface FilterPreferences {
  search: string;
  segment: string;
  status: string;
  dateWindow: DateWindow;
  sortColumn: string | null;
  sortDir: SortDir;
}

const DEFAULT_PREFERENCES: FilterPreferences = {
  search: '',
  segment: 'all',
  status: 'all',
  dateWindow: 'all',
  sortColumn: null,
  sortDir: 'asc',
};

export const DATE_WINDOW_LABELS: Record<DateWindow, string> = {
  all: 'All Dates',
  today: 'Today',
  next3: 'Next 3 Days',
  next30: 'Next 30 Days',
};

function loadPreferences(): FilterPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load filter preferences:', e);
  }
  return DEFAULT_PREFERENCES;
}

function savePreferences(prefs: FilterPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Failed to save filter preferences:', e);
  }
}

export function useFilterPreferences() {
  const [preferences, setPreferences] =
    useState<FilterPreferences>(loadPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) savePreferences(preferences);
  }, [preferences, isLoaded]);

  const updatePreference = useCallback(
    <K extends keyof FilterPreferences>(key: K, value: FilterPreferences[K]) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  return { preferences, updatePreference, resetPreferences, isLoaded };
}
