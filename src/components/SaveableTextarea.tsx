import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, Save } from 'lucide-react';

interface SaveableTextareaProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SaveableTextarea({
  value: initialValue,
  onSave,
  placeholder = 'Add comments...',
  className,
  disabled = false,
}: SaveableTextareaProps) {
  const [localValue, setLocalValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(initialValue);
    setIsDirty(false);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
    <div className="space-y-2">
      <Textarea
        className={cn(className)}
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      <Button
        size="sm"
        variant={isDirty ? 'default' : 'outline'}
        onClick={handleSave}
        disabled={!isDirty || isSaving || disabled}
        className="gap-2"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save
      </Button>
    </div>
  );
}
