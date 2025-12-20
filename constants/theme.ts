/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// 智能记账APP主题色
const tintColorLight = '#FF6B9D';
const tintColorDark = '#FF8AB5';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    background: '#F8F9FA',
    card: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#B0B8C1',
    tabIconSelected: tintColorLight,
    // 记账APP专用色
    primary: '#FF6B9D',
    primaryLight: '#FFE4ED',
    income: '#4CAF50',
    expense: '#FF5722',
    gradient: ['#A78BFA', '#60A5FA', '#34D399'],
    cardGradient: ['#C084FC', '#818CF8', '#60A5FA'],
    border: '#E8ECF0',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#151718',
    card: '#1E2022',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#5A6068',
    tabIconSelected: tintColorDark,
    // 记账APP专用色
    primary: '#FF8AB5',
    primaryLight: '#3D2A3A',
    income: '#66BB6A',
    expense: '#FF7043',
    gradient: ['#A78BFA', '#60A5FA', '#34D399'],
    cardGradient: ['#C084FC', '#818CF8', '#60A5FA'],
    border: '#2C3035',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
