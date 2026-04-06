

import { AppState } from '../types';

export const getThemeClasses = (appState: AppState) => {
  const { themeMode, colorfulThemeBase } = appState;
  
  let isDarkBase = true;
  if (themeMode === 'light') {
      isDarkBase = false;
  } else if (themeMode === 'colorful') {
      isDarkBase = colorfulThemeBase === 'dark';
  }
  
  return {
      panelBg: isDarkBase ? 'bg-gray-900/95' : 'bg-white/95',
      textMain: isDarkBase ? 'text-white' : 'text-gray-900',
      textSub: isDarkBase ? 'text-white/80' : 'text-gray-700',
      textMuted: isDarkBase ? 'text-white/50' : 'text-gray-400',
      textVeryMuted: isDarkBase ? 'text-white/30' : 'text-gray-300',
      border: isDarkBase ? 'border-white/10' : 'border-black/5',
      borderActive: isDarkBase ? 'border-white/40' : 'border-black/40',
      itemBg: isDarkBase ? 'bg-white/5' : 'bg-black/5',
      itemHover: isDarkBase ? 'hover:bg-white/10' : 'hover:bg-black/10',
      itemActive: isDarkBase ? 'bg-white/10' : 'bg-black/10',
      navActive: isDarkBase ? 'bg-white/10 border-white/20 text-white' : 'bg-black/5 border-black/10 text-black',
      navInactive: isDarkBase ? 'text-white/40 hover:text-white/80 hover:bg-white/5 border-transparent' : 'text-black/40 hover:text-black/80 hover:bg-black/5 border-transparent',
      inputBg: isDarkBase ? 'bg-black/20' : 'bg-gray-50 border-gray-200',
      sliderTrack: isDarkBase ? 'bg-white/10' : 'bg-black/10',
      sliderThumb: isDarkBase ? '[&::-webkit-slider-thumb]:bg-white' : '[&::-webkit-slider-thumb]:bg-gray-900',
      iconColor: isDarkBase ? 'text-white' : 'text-gray-800',
      iconMuted: isDarkBase ? 'text-white/40' : 'text-black/40',
      scrollbarThumb: isDarkBase ? '#ffffff40' : '#00000030',
      isDarkBase
  };
};