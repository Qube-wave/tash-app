import { useUniwind } from 'uniwind';

export type Colors = {
  bg: string;
  heading: string;
  accent: string;
  subtitle: string;
  skip: string;
  dotActive: string;
  dotInactive: string;
  button: string;
  buttonText: string;
  sparkle: string;
  surface: string;
  surfaceActive: string;
  placeholder: string;
  accentDeep: string;
  border: string;
};

export const COLORS: Record<'light' | 'dark', Colors> = {
  light: {
    bg: '#FFFFFF',
    heading: '#141915',
    accent: '#C75A3A',
    subtitle: '#6A7A70',
    skip: '#C75A3A',
    dotActive: '#C75A3A',
    dotInactive: '#E8D5CE',
    button: '#C75A3A',
    buttonText: '#FFFFFF',
    sparkle: '#1E4A3A',
    surface: '#F4F1EC',
    surfaceActive: '#EBE6DE',
    placeholder: '#A8A29A',
    accentDeep: '#9E3E24',
    border: '#ECE9E4',
  },
  dark: {
    bg: '#0A0A0B',
    heading: '#F1F5F2',
    accent: '#E07B58',
    subtitle: '#94A39B',
    skip: '#E07B58',
    dotActive: '#E07B58',
    dotInactive: '#3A2C27',
    button: '#C75A3A',
    buttonText: '#FFFFFF',
    sparkle: '#7FB79E',
    surface: '#161618',
    surfaceActive: '#212124',
    placeholder: '#6B6B70',
    accentDeep: '#9E3E24',
    border: '#232327',
  },
};

export function useColors(): Colors {
  const { theme } = useUniwind();
  return COLORS[theme === 'dark' ? 'dark' : 'light'];
}
