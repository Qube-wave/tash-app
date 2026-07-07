import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold,
  PlayfairDisplay_900Black,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_500Medium_Italic,
  PlayfairDisplay_600SemiBold_Italic,
  PlayfairDisplay_700Bold_Italic,
  PlayfairDisplay_800ExtraBold_Italic,
  PlayfairDisplay_900Black_Italic,
} from '@expo-google-fonts/playfair-display';

import {
  SourceSans3_200ExtraLight,
  SourceSans3_300Light,
  SourceSans3_400Regular,
  SourceSans3_500Medium,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
  SourceSans3_800ExtraBold,
  SourceSans3_900Black,
  SourceSans3_200ExtraLight_Italic,
  SourceSans3_300Light_Italic,
  SourceSans3_400Regular_Italic,
  SourceSans3_500Medium_Italic,
  SourceSans3_600SemiBold_Italic,
  SourceSans3_700Bold_Italic,
  SourceSans3_800ExtraBold_Italic,
  SourceSans3_900Black_Italic,
} from '@expo-google-fonts/source-sans-3';


export const FontFamily = {
  PlayfairDisplay: 'PlayfairDisplay',
  SourceSans3: 'SourceSans3',
} as const;

export type FontFamilyKey = keyof typeof FontFamily;

export const FontWeight = {
  ExtraLight: 'ExtraLight',
  Light: 'Light',
  Regular: 'Regular',
  Medium: 'Medium',
  SemiBold: 'SemiBold',
  Bold: 'Bold',
  ExtraBold: 'ExtraBold',
  Black: 'Black',
} as const;

export type FontWeightKey = keyof typeof FontWeight;

export const FontStyle = {
  Normal: 'Normal',
  Italic: 'Italic',
} as const;

export type FontStyleKey = keyof typeof FontStyle;

const playfairMap: Record<string, Record<string, string>> = {
  Regular: {
    Normal: 'PlayfairDisplay_400Regular',
    Italic: 'PlayfairDisplay_400Regular_Italic',
  },
  Medium: {
    Normal: 'PlayfairDisplay_500Medium',
    Italic: 'PlayfairDisplay_500Medium_Italic',
  },
  SemiBold: {
    Normal: 'PlayfairDisplay_600SemiBold',
    Italic: 'PlayfairDisplay_600SemiBold_Italic',
  },
  Bold: {
    Normal: 'PlayfairDisplay_700Bold',
    Italic: 'PlayfairDisplay_700Bold_Italic',
  },
  ExtraBold: {
    Normal: 'PlayfairDisplay_800ExtraBold',
    Italic: 'PlayfairDisplay_800ExtraBold_Italic',
  },
  Black: {
    Normal: 'PlayfairDisplay_900Black',
    Italic: 'PlayfairDisplay_900Black_Italic',
  },
};

const sourceSansMap: Record<string, Record<string, string>> = {
  ExtraLight: {
    Normal: 'SourceSans3_200ExtraLight',
    Italic: 'SourceSans3_200ExtraLight_Italic',
  },
  Light: {
    Normal: 'SourceSans3_300Light',
    Italic: 'SourceSans3_300Light_Italic',
  },
  Regular: {
    Normal: 'SourceSans3_400Regular',
    Italic: 'SourceSans3_400Regular_Italic',
  },
  Medium: {
    Normal: 'SourceSans3_500Medium',
    Italic: 'SourceSans3_500Medium_Italic',
  },
  SemiBold: {
    Normal: 'SourceSans3_600SemiBold',
    Italic: 'SourceSans3_600SemiBold_Italic',
  },
  Bold: {
    Normal: 'SourceSans3_700Bold',
    Italic: 'SourceSans3_700Bold_Italic',
  },
  ExtraBold: {
    Normal: 'SourceSans3_800ExtraBold',
    Italic: 'SourceSans3_800ExtraBold_Italic',
  },
  Black: {
    Normal: 'SourceSans3_900Black',
    Italic: 'SourceSans3_900Black_Italic',
  },
};

const fontFamilyMap: Record<FontFamilyKey, Record<string, Record<string, string>>> = {
  PlayfairDisplay: playfairMap,
  SourceSans3: sourceSansMap,
};


export function resolveFontFamily(
  family: FontFamilyKey,
  weight: FontWeightKey = 'Regular',
  style: FontStyleKey = 'Normal'
): string {
  const familyRecord = fontFamilyMap[family];
  const weightRecord = familyRecord?.[weight];
  const resolved = weightRecord?.[style];

  if (!resolved) {
    const fallback = familyRecord?.Regular?.Normal;
    if (__DEV__) {
      console.warn(
        `[fonts] Could not resolve font: ${family}/${weight}/${style}. ` +
          `Falling back to ${fallback ?? 'system font'}.`
      );
    }
    return fallback ?? '';
  }

  return resolved;
}

export const fontAssets = {
  // Playfair Display
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold,
  PlayfairDisplay_900Black,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_500Medium_Italic,
  PlayfairDisplay_600SemiBold_Italic,
  PlayfairDisplay_700Bold_Italic,
  PlayfairDisplay_800ExtraBold_Italic,
  PlayfairDisplay_900Black_Italic,

  // Source Sans 3
  SourceSans3_200ExtraLight,
  SourceSans3_300Light,
  SourceSans3_400Regular,
  SourceSans3_500Medium,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
  SourceSans3_800ExtraBold,
  SourceSans3_900Black,
  SourceSans3_200ExtraLight_Italic,
  SourceSans3_300Light_Italic,
  SourceSans3_400Regular_Italic,
  SourceSans3_500Medium_Italic,
  SourceSans3_600SemiBold_Italic,
  SourceSans3_700Bold_Italic,
  SourceSans3_800ExtraBold_Italic,
  SourceSans3_900Black_Italic,
};
