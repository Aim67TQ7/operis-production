import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function ThemeDropdownItem() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const icon = theme === 'light' ? <Sun className="h-4 w-4 mr-2" /> 
    : theme === 'dark' ? <Moon className="h-4 w-4 mr-2" /> 
    : <Monitor className="h-4 w-4 mr-2" />;

  const label = theme === 'light' ? 'Light Mode' 
    : theme === 'dark' ? 'Dark Mode' 
    : 'System Theme';

  return (
    <DropdownMenuItem onClick={cycleTheme}>
      {icon}
      {label}
    </DropdownMenuItem>
  );
}
