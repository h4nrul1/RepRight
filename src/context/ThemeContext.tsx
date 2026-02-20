import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import {Appearance, ColorSchemeName} from 'react-native';
import {darkColors, lightColors, ThemeColors} from '../styles/colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  colors: ThemeColors;
  scheme: 'light' | 'dark';
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export function ThemeProvider({children}: {children: ReactNode}) {
  const systemScheme = Appearance.getColorScheme() as ColorSchemeName;
  const [mode, setMode] = useState<ThemeMode>('system');
  const [system, setSystem] = useState<ColorSchemeName>(systemScheme);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({colorScheme}) =>
      setSystem(colorScheme),
    );
    return () => sub.remove();
  }, []);

  const activeScheme: 'light' | 'dark' =
    (mode === 'system' ? system : mode) === 'dark' ? 'dark' : 'light';

  const colors = useMemo(
    () => (activeScheme === 'dark' ? darkColors : lightColors),
    [activeScheme],
  );

  const value = useMemo(
    () => ({colors, scheme: activeScheme, mode, setMode}),
    [colors, activeScheme, mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
