
import React, { useEffect, useRef } from 'react';
import { LyricLine, ThemeMode, LyricEffect } from '../types';

interface LyricsDisplayProps {
  lyrics: LyricLine[];
  currentTime: number;
  themeColor: string;
  mainFontSize: number;
  subFontSize: number;
  themeMode: ThemeMode;
  lyricOffset: number;
  lyricGapTolerance: number;
  isBold: boolean;
  activeColor: string | null;
  inactiveColor: string | null;
  strokeWidth: number;
  strokeColor: string;
  shadowEnabled: boolean;
  shadowDirection: number;
  shadowStrength: number;
  shadowDistance: number;
  shadowBlur: number;
  shadowColor: string;
  primaryLineIndex: number;
  displayOrder: number[];
  activeEffect?: LyricEffect; 
  streamerColor?: string;
  singerOverrideColors?: string[] | null;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ 
  lyrics, 
  currentTime, 
  themeColor,
  mainFontSize,
  subFontSize,
  themeMode,
  lyricOffset,
  lyricGapTolerance,
  isBold,
  activeColor,
  inactiveColor,
  strokeWidth,
  strokeColor,
  shadowEnabled,
  shadowDirection,
  shadowStrength,
  shadowDistance,
  shadowBlur,
  shadowColor,
  primaryLineIndex,
  displayOrder,
  activeEffect = 'none',
  streamerColor = '#ffffff',
  singerOverrideColors
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  
  const isDarkBase = themeMode !== 'light';
  const adjustedTime = currentTime - lyricOffset;
  const shadowRadians = (shadowDirection * Math.PI) / 180;
  const shadowX = Math.cos(shadowRadians) * shadowDistance;
  const shadowY = Math.sin(shadowRadians) * shadowDistance;
  const toRgba = (color: string, alpha: number) => {
    const fallback = `rgba(0,0,0,${alpha.toFixed(2)})`;
    if (!color) return fallback;
    const hex = color.trim().replace('#', '');
    if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(hex)) return fallback;
    const normalized = hex.length === 3 ? hex.split('').map(ch => `${ch}${ch}`).join('') : hex;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
  };
  const shadowColorRgba = toRgba(shadowColor, shadowStrength);

  let activeIndex = lyrics.findIndex(
    (line) => adjustedTime >= line.start && adjustedTime <= line.end
  );

  if (activeIndex === -1 && lyrics.length > 0 && lyricGapTolerance > 0) {
      for (let i = 0; i < lyrics.length - 1; i++) {
          const currentLine = lyrics[i];
          const nextLine = lyrics[i+1];
          if (adjustedTime > currentLine.end && adjustedTime < nextLine.start) {
              const gap = nextLine.start - currentLine.end;
              if (gap <= lyricGapTolerance) activeIndex = i;
              break; 
          }
      }
  }

  useEffect(() => {
    const container = containerRef.current;
    const activeEl = activeRef.current;
    if (container && activeEl) {
      const containerHeight = container.clientHeight;
      const activeTop = activeEl.offsetTop;
      const activeHeight = activeEl.clientHeight;
      const targetScrollTop = activeTop - (containerHeight / 2) + (activeHeight / 2);
      container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
  }, [activeIndex, lyrics]);

  if (lyrics.length === 0) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center space-y-6 select-none transition-colors ${isDarkBase ? 'text-white/30' : 'text-black/20'}`}>
        <div className="text-3xl md:text-5xl font-serif italic opacity-50 font-light">Instrumental</div>
        <p className={`text-[10px] md:text-xs font-sans tracking-[0.3em] uppercase border-b pb-1 ${isDarkBase ? 'border-white/10' : 'border-black/10'}`}>Waiting for .SRT input</p>
      </div>
    );
  }

  return (
    <div 
        ref={containerRef} 
        className="w-full h-full overflow-y-auto scrollbar-hide text-center select-none relative"
        style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)'
        }}
    >
      <style>{`
        @keyframes flow { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        .active-underline::after {
            content: ''; position: absolute; bottom: -4px; left: 50%; width: 0%; height: 2px;
            background-color: var(--active-color); box-shadow: 0 0 8px var(--active-color), var(--underline-shadow, 0 0 0 transparent);
            transform: translateX(-50%); transition: width 0.5s ease-out;
        }
        .active-underline.active::after { width: 60%; }
        .active-fluid {
            background-image: linear-gradient(120deg, var(--active-color) 0%, var(--streamer-color) 50%, var(--active-color) 100%);
            background-size: 200% auto; -webkit-background-clip: text; background-clip: text;
            -webkit-text-fill-color: transparent; color: transparent; animation: flow 3s linear infinite;
        }
        .singer-gradient {
            background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <div className="w-full min-h-[50%] shrink-0" aria-hidden="true" />
      
      <div className="flex flex-col w-full">
        {lyrics.map((line, index) => {
            const isActive = index === activeIndex;
            const distance = activeIndex === -1 ? 0 : Math.abs(index - activeIndex);
            const blurAmount = isActive ? 0 : Math.min(distance * 1.5, 5);
            const opacity = isActive ? 1 : Math.max(0.2, 0.6 - (distance * 0.15));
            const scale = isActive ? 1.05 : 0.95;
            
            const finalActive = activeColor || themeColor;
            const finalInactive = inactiveColor || (isDarkBase ? '#ffffff' : '#000000');
            const activeWeight = isBold ? 'font-bold' : 'font-medium';
            const inactiveWeight = isBold ? 'font-normal' : 'font-light';
            const strokeStyle = strokeWidth > 0 ? { WebkitTextStroke: `${strokeWidth}px ${strokeColor}` } : {};

            const isSingerGradient = isActive && singerOverrideColors && singerOverrideColors.length > 1;
            const underlineShadow = shadowEnabled ? `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur}px ${shadowColorRgba}` : '0 0 0 transparent';

            return (
            <div
                key={index}
                ref={isActive ? activeRef : null}
                className={`transition-all duration-[600ms] ease-out transform origin-center py-4 md:py-6 px-4 cursor-default relative ${isActive && activeEffect === 'underline' ? 'active-underline active' : ''}`}
                style={{ 
                    opacity, transform: `scale(${scale})`, filter: `blur(${blurAmount}px)`,
                    color: isActive ? finalActive : finalInactive,
                    '--active-color': finalActive, '--streamer-color': streamerColor, '--underline-shadow': underlineShadow
                } as React.CSSProperties}
            >
                {displayOrder.map((sourceIndex, renderIdx) => {
                    const text = line.content[sourceIndex];
                    if (!text) return null;
                    const isPrimary = sourceIndex === primaryLineIndex;
                    const applyFluid = isActive && activeEffect === 'fluid';
                    const shouldRenderShadow = shadowEnabled && isActive;
                    const shadowValue = `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur}px ${shadowColorRgba}`;
                    const shouldUseDropShadow = shouldRenderShadow && (applyFluid || isSingerGradient);
                    
                    const dynamicTextStyle: React.CSSProperties = {
                        fontSize: `${isPrimary ? mainFontSize : subFontSize}px`,
                        ...strokeStyle,
                        textShadow: shouldRenderShadow && !shouldUseDropShadow ? shadowValue : 'none',
                        filter: shouldUseDropShadow ? `drop-shadow(${shadowValue})` : 'none'
                    };

                    if (isSingerGradient) {
                        dynamicTextStyle.backgroundImage = `linear-gradient(to right, ${singerOverrideColors.join(', ')})`;
                    }

                    return (
                        <p 
                            key={`${index}-${renderIdx}`}
                            className={`leading-relaxed relative z-20 transition-all duration-700 ${isPrimary ? 'font-serif mb-1' : 'font-sans mt-1 tracking-wider' } ${isActive ? (isPrimary ? activeWeight : 'opacity-90') : (isPrimary ? inactiveWeight : 'opacity-50')} ${applyFluid ? 'active-fluid' : ''} ${isSingerGradient ? 'singer-gradient' : ''}`}
                            style={dynamicTextStyle}
                        >
                            {text}
                        </p>
                    );
                })}
            </div>
            );
        })}
      </div>
      <div className="w-full min-h-[50%] shrink-0" aria-hidden="true" />
    </div>
  );
};

export default LyricsDisplay;
