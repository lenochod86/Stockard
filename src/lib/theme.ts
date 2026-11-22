import { useColorScheme } from 'react-native';

const light = {
  bg: '#F2F3F7',
  card: '#FFFFFF',
  text: '#15171C',
  sub: '#6B7280',
  border: '#E3E5EB',
  primary: '#3D5AFE',
  onPrimary: '#FFFFFF',
  danger: '#D32F2F',
  chip: '#E8EAF2',
};
const dark: typeof light = {
  bg: '#0E0F13',
  card: '#1A1C23',
  text: '#F2F3F7',
  sub: '#9AA0AE',
  border: '#2A2D37',
  primary: '#7C8CFF',
  onPrimary: '#0E0F13',
  danger: '#FF6B6B',
  chip: '#262935',
};

export type Theme = typeof light & { isDark: boolean };

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? { ...dark, isDark: true } : { ...light, isDark: false };
}
