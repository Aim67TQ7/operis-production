import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import {
  DATE_WINDOW_LABELS,
  type FilterPreferences,
} from '@/hooks/useFilterPreferences';

interface Chip {
  key: keyof FilterPreferences;
  label: string;
  reset: FilterPreferences[keyof FilterPreferences];
}

interface ActiveFilterChipsProps {
  preferences: FilterPreferences;
  onClear: <K extends keyof FilterPreferences>(
    key: K,
    value: FilterPreferences[K],
  ) => void;
}

/**
 * Removable chips showing every active filter, rendered above page content so
 * each view visibly respects the shared filter store.
 */
export function ActiveFilterChips({
  preferences,
  onClear,
}: ActiveFilterChipsProps) {
  const chips: Chip[] = [];

  if (preferences.search)
    chips.push({ key: 'search', label: `"${preferences.search}"`, reset: '' });
  if (preferences.segment !== 'all')
    chips.push({ key: 'segment', label: preferences.segment, reset: 'all' });
  if (preferences.status !== 'all')
    chips.push({ key: 'status', label: preferences.status, reset: 'all' });
  if (preferences.dateWindow !== 'all')
    chips.push({
      key: 'dateWindow',
      label: DATE_WINDOW_LABELS[preferences.dateWindow],
      reset: 'all',
    });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1">
          {chip.label}
          <button
            type="button"
            aria-label={`Clear ${chip.key} filter`}
            onClick={() =>
              onClear(chip.key, chip.reset as FilterPreferences[typeof chip.key])
            }
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
