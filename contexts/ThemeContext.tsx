import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'habitgalaxy-theme';

export interface AppTheme {
  dark: boolean;
  background: string;
  surface: string;
  input: string;
  text: string;
  mutedText: string;
  border: string;
  primary: string;
}

const lightTheme: AppTheme = {
  dark: false,
  background: '#f8f8f8',
  surface: '#fff',
  input: '#fff',
  text: '#333',
  mutedText: '#777',
  border: '#ddd',
  primary: '#6C63FF',
};

const darkTheme: AppTheme = {
  dark: true,
  background: '#10111a',
  surface: '#1b1d2a',
  input: '#242735',
  text: '#f2f3f7',
  mutedText: '#aeb2c1',
  border: '#3a3e50',
  primary: '#8b83ff',
};

interface ThemeContextValue {
  theme: AppTheme;
  toggleTheme: () => void;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then(value => setDark(value === 'dark'))
      .catch(error => console.error('Error loading theme preference:', error))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    theme: dark ? darkTheme : lightTheme,
    toggleTheme: () => {
      setDark(previous => {
        const next = !previous;
        AsyncStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light')
          .catch(error => console.error('Error saving theme preference:', error));
        return next;
      });
    },
    ready,
  }), [dark, ready]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used inside ThemeProvider');
  }
  return context;
}
