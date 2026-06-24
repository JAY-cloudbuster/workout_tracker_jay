import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme, Theme } from '../../store/ThemeContext';
import { Button } from "../ui/button";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'minimal-luxury') setTheme('modern-journal');
    else if (theme === 'modern-journal') setTheme('industrial-gym');
    else setTheme('minimal-luxury');
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={cycleTheme}
      className="h-9 w-9 rounded-full border border-border/50 bg-background hover:bg-muted transition-all"
      title="Cycle theme"
    >
      {theme === 'minimal-luxury' && <Moon className="h-4 w-4" />}
      {theme === 'modern-journal' && <Sun className="h-4 w-4" />}
      {theme === 'industrial-gym' && <Monitor className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
