import { useEffect } from 'react';
import { useLocalStorage } from './useStore';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage('quotaai:theme', 'light');
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  return { theme, setTheme, toggle };
}
