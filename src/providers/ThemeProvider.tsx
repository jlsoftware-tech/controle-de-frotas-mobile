import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, type AppTheme } from '@/styles/theme';
import { STORAGE_KEYS } from '@/utils/constants';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  theme: AppTheme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  theme: lightTheme,
  toggleTheme: () => {},
  isDark: false,
});

export const useAppTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(STORAGE_KEYS.THEME)
      .then((saved) => {
        if (active && (saved === 'dark' || saved === 'light')) {
          setMode(saved);
        }
      })
      .catch(() => {
        // A storage failure should not block the app; keep the system theme.
      });

    return () => {
      active = false;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((previous) => {
      const next: ThemeMode = previous === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(STORAGE_KEYS.THEME, next).catch(() => {
        // Best-effort persistence.
      });
      return next;
    });
  }, []);

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ mode, theme, toggleTheme, isDark: mode === 'dark' }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};
