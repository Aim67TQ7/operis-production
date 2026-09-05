import { useState, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Loader2, Check } from 'lucide-react';

interface AutoSaveTextareaProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  disabled?: boolean;
}

export function AutoSaveTextarea({
  value: initialValue,
  onSave,
  placeholder = 'Add comments...',
  className,
  debounceMs = 800,
  disabled = false,
}: AutoSaveTextareaProps) {
  const [localValue, setLocalValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [lastSavedValue, setLastSavedValue] = useState(initialValue);
  const [hasError, setHasError] = useState(false);

  // Sync with external value changes (e.g., from refetch)
  useEffect(() => {
    setLocalValue(initialValue);
    setLastSavedValue(initialValue);
  }, [initialValue]);

  // Debounced auto-save
  useEffect(() => {
    if (disabled) return;

    const trimmedLocal = localValue.trim();
    const trimmedLast = lastSavedValue.trim();

    // Don't save if unchanged
    if (trimmedLocal === trimmedLast) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      setHasError(false);
      try {
        await onSave(localValue);
        setLastSavedValue(localValue);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 1500);
      } catch (error) {
        setHasError(true);
        setShowSaved(false);
        console.error('Failed to save:', error);
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, lastSavedValue, onSave, debounceMs, disabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  }, []);

  return (
    <div className="relative">
      <Textarea
        className={cn('pr-8', className)}
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      {/* Save indicator */}
      <div className="absolute right-2 top-2">
        {isSaving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        {!isSaving && showSaved && <Check className="h-3 w-3 text-primary" />}
        {!isSaving && !showSaved && hasError && (
          <span className="text-destructive text-[10px]">!</span>
        )}
      </div>
    </div>
  );
}

