import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader2, Check } from 'lucide-react';

interface SaveableInputProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  type?: 'text' | 'date';
  disabled?: boolean;
}

export function SaveableInput({
  value: initialValue,
  onSave,
  placeholder = 'Enter value...',
  className,
  type = 'text',
  disabled = false,
}: SaveableInputProps) {
  const [localValue, setLocalValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(initialValue);
    setIsDirty(false);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setIsDirty(e.target.value !== initialValue);
  };

  const handleSave = async () => {
    if (!isDirty || disabled) return;
    
    setIsSaving(true);
    try {
      await onSave(localValue);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full">
      <Input
        className={cn('w-full', isDirty && 'pr-9', className)}
        type={type}
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      {isDirty && (
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || disabled}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-md text-primary hover:bg-accent disabled:opacity-50 transition-colors"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
