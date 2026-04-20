import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { LyricLine, ThemeMode, LyricEffect } from '../types';

interface LyricsDisplayProps {
  lyrics: LyricLine[];
  currentTime: number;
  isPlaying: boolean;
  isBuffering: boolean;
  getCurrentTime: () => number;
  themeColor: string;
  mainFontSize: number;
  subFontSize: number;
  activeSizeCompensation: number;
  themeMode: ThemeMode;
  lyricOffset: number;
  lyricGapTolerance: number;
  isBold: boolean;
  activeColor: string | null;
  inactiveColor: string | null;
  strokeWidth: number;
  strokeColor: string;
  inactiveBlurEnabled: boolean;
  inactiveBlurStrength: number;
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

const MAX_VISIBLE_DISTANCE = 4;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const buildOutlineTextShadow = (width: number, color: string) => {
  if (width <= 0 || !color) return '';

  const shadows: string[] = [];
  const addRing = (radius: number, steps: number) => {
    for (let i = 0; i < steps; i += 1) {
      const angle = (Math.PI * 2 * i) / steps;
      shadows.push(`${(Math.cos(angle) * radius).toFixed(2)}px ${(Math.sin(angle) * radius).toFixed(2)}px 0 ${color}`);
    }
  };

  addRing(width, 12);
  if (width > 1) addRing(width * 0.66, 8);
  if (width > 2) addRing(width * 0.33, 4);

  return shadows.join(', ');
};

const resolveActiveLyricIndex = (
  lyrics: LyricLine[],
  time: number,
  gapTolerance: number,
  hintIndex = -1
) => {
  if (lyrics.length === 0) return -1;

  const matchesAtIndex = (index: number) => {
    if (index < 0 || index >= lyrics.length) return false;

    const current = lyrics[index];
    if (time >= current.start && time <= current.end) return true;

    const next = lyrics[index + 1];
    if (
      next &&
      gapTolerance > 0 &&
      time > current.end &&
      time < next.start &&
      next.start - current.end <= gapTolerance
    ) {
      return true;
    }

    return false;
  };

  if (matchesAtIndex(hintIndex)) return hintIndex;
  if (matchesAtIndex(hintIndex + 1)) return hintIndex + 1;
  if (matchesAtIndex(hintIndex - 1)) return hintIndex - 1;

  let left = 0;
  let right = lyrics.length - 1;
  let candidate = -1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    if (lyrics[middle].start <= time) {
      candidate = middle;
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }

  if (candidate === -1) return -1;
  return matchesAtIndex(candidate) ? candidate : -1;
};

const resolveFocusLyricIndex = (lyrics: LyricLine[], time: number, activeIndex: number) => {
  if (lyrics.length === 0) return -1;
  if (activeIndex >= 0) return activeIndex;
  if (time <= lyrics[0].start) return 0;
  if (time >= lyrics[lyrics.length - 1].end) return lyrics.length - 1;

  let left = 0;
  let right = lyrics.length - 1;
  let candidate = 0;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    if (lyrics[middle].start <= time) {
      candidate = middle;
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }

  const next = lyrics[candidate + 1];
  if (!next) return candidate;

  const currentDistance = Math.abs(time - lyrics[candidate].end);
  const nextDistance = Math.abs(next.start - time);
  return nextDistance < currentDistance ? candidate + 1 : candidate;
};

const getLineOpacity = (distance: number) => {
  const absoluteDistance = Math.abs(distance);
  if (absoluteDistance === 0) return 1;
  if (absoluteDistance === 1) return 0.76;
  if (absoluteDistance === 2) return 0.48;
  if (absoluteDistance === 3) return 0.24;
  if (absoluteDistance === 4) return 0.1;
  return 0;
};

const getLineScale = (distance: number) => {
  const absoluteDistance = Math.abs(distance);
  if (absoluteDistance === 0) return 1;
  if (absoluteDistance === 1) return 0.98;
  if (absoluteDistance === 2) return 0.962;
  return 0.946;
};

const getLineOffsetY = (distance: number) => {
  const absoluteDistance = Math.abs(distance);
  if (absoluteDistance === 0) return 0;

  const direction = distance > 0 ? 1 : -1;
  const baseOffset = absoluteDistance === 1 ? 6 : absoluteDistance === 2 ? 12 : 18;
  return direction * baseOffset;
};

const getLineBlur = (distance: number, enabled: boolean, strength: number) => {
  if (!enabled) return 0;

  const absoluteDistance = Math.abs(distance);
  if (absoluteDistance === 0) return 0;
  if (absoluteDistance === 1) return strength * 0.35;
  if (absoluteDistance === 2) return strength * 0.6;
  if (absoluteDistance === 3) return strength * 0.82;
  return strength;
};

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  lyrics,
  currentTime,
  isPlaying,
  isBuffering,
  getCurrentTime,
  themeColor,
  mainFontSize,
  subFontSize,
  activeSizeCompensation,
  themeMode,
  lyricOffset,
  lyricGapTolerance,
  isBold,
  activeColor,
  inactiveColor,
  strokeWidth,
  strokeColor,
  inactiveBlurEnabled,
  inactiveBlurStrength,
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
  singerOverrideColors,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeIndexRef = useRef(-1);

  const adjustedTime = currentTime - lyricOffset;
  const isDarkBase = themeMode !== 'light';
  const initialActiveIndex = resolveActiveLyricIndex(lyrics, adjustedTime, lyricGapTolerance);

  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [focusIndex, setFocusIndex] = useState(resolveFocusLyricIndex(lyrics, adjustedTime, initialActiveIndex));
  const [containerHeight, setContainerHeight] = useState(0);
  const [trackOffsetY, setTrackOffsetY] = useState(0);

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
  const outlineShadowValue = buildOutlineTextShadow(strokeWidth, strokeColor);
  const uniformPrimaryWeight = isBold ? 'font-bold' : 'font-medium';
  const uniformSecondaryWeight = isBold ? 'font-medium' : 'font-normal';

  const commitIndices = useCallback((time: number, hintedIndex = activeIndexRef.current) => {
    const nextActiveIndex = resolveActiveLyricIndex(lyrics, time, lyricGapTolerance, hintedIndex);
    const nextFocusIndex = resolveFocusLyricIndex(lyrics, time, nextActiveIndex);

    if (nextActiveIndex !== activeIndexRef.current) {
      activeIndexRef.current = nextActiveIndex;
      setActiveIndex(nextActiveIndex);
    }

    setFocusIndex(prev => (prev === nextFocusIndex ? prev : nextFocusIndex));
  }, [lyricGapTolerance, lyrics]);

  useEffect(() => {
    const currentAdjustedTime = getCurrentTime() - lyricOffset;
    const nextActiveIndex = resolveActiveLyricIndex(lyrics, currentAdjustedTime, lyricGapTolerance);
    activeIndexRef.current = nextActiveIndex;
    setActiveIndex(nextActiveIndex);
    setFocusIndex(resolveFocusLyricIndex(lyrics, currentAdjustedTime, nextActiveIndex));
    lineRefs.current = [];
  }, [getCurrentTime, lyricGapTolerance, lyrics, lyricOffset]);

  useEffect(() => {
    commitIndices(adjustedTime);
  }, [adjustedTime, commitIndices]);

  useEffect(() => {
    if (!isPlaying || isBuffering || lyrics.length === 0) return;

    let animationFrameId = 0;
    const tick = () => {
      commitIndices(getCurrentTime() - lyricOffset, activeIndexRef.current);
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [commitIndices, getCurrentTime, isBuffering, isPlaying, lyricOffset, lyrics.length]);

  const measureTrackOffset = useCallback(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    const focusedLine = focusIndex >= 0 ? lineRefs.current[focusIndex] : null;
    if (!container) return;

    const nextContainerHeight = container.clientHeight;
    setContainerHeight(prev => (prev === nextContainerHeight ? prev : nextContainerHeight));

    if (!track || !focusedLine) {
      setTrackOffsetY(0);
      return;
    }

    const targetOffset = (nextContainerHeight / 2) - (focusedLine.offsetTop + (focusedLine.offsetHeight / 2));
    setTrackOffsetY(prev => (Math.abs(prev - targetOffset) < 0.5 ? prev : targetOffset));
  }, [focusIndex]);

  useLayoutEffect(() => {
    const frameId = requestAnimationFrame(measureTrackOffset);
    const resizeObserver = new ResizeObserver(() => measureTrackOffset());

    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (trackRef.current) resizeObserver.observe(trackRef.current);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [measureTrackOffset]);

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
      className="w-full h-full overflow-hidden text-center select-none relative"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
      }}
    >
      <style>{`
        @keyframes flow { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        .active-underline::after {
            content: ''; position: absolute; bottom: -4px; left: 50%; width: 0%; height: 2px;
            background-color: var(--active-color); box-shadow: 0 0 8px var(--active-color), var(--underline-shadow, 0 0 0 transparent);
            transform: translateX(-50%); transition: width 0.28s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .active-underline.active::after { width: 56%; }
        .active-fluid {
            background-image: linear-gradient(120deg, var(--active-color) 0%, var(--streamer-color) 50%, var(--active-color) 100%);
            background-size: 200% auto; -webkit-background-clip: text; background-clip: text;
            -webkit-text-fill-color: transparent; color: transparent; animation: flow 2.6s linear infinite;
        }
        .singer-gradient {
            background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            transition: background-image 0.28s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>

      <div
        ref={trackRef}
        className="flex flex-col w-full"
        style={{
          transform: `translateY(${trackOffsetY}px)`,
          transition: 'transform 290ms cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        }}
      >
        <div style={{ minHeight: `${containerHeight / 2}px` }} aria-hidden="true" />

        {lyrics.map((line, index) => {
          const isActive = index === activeIndex;
          const distance = focusIndex === -1 ? 0 : index - focusIndex;
          const absoluteDistance = Math.abs(distance);
          const finalActive = activeColor || themeColor;
          const finalInactive = inactiveColor || (isDarkBase ? '#ffffff' : '#000000');
          const lineOpacity = getLineOpacity(distance);
          const lineScale = getLineScale(distance);
          const lineOffset = getLineOffsetY(distance);
          const lineBlur = getLineBlur(distance, inactiveBlurEnabled, inactiveBlurStrength);
          const isSingerGradient = isActive && singerOverrideColors && singerOverrideColors.length > 1;
          const underlineShadow = shadowEnabled
            ? `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur}px ${shadowColorRgba}`
            : '0 0 0 transparent';

          return (
            <div
              key={index}
              ref={(element) => {
                lineRefs.current[index] = element;
              }}
              className={`relative cursor-default px-4 py-3.5 md:py-4 ${isActive && activeEffect === 'underline' ? 'active-underline active' : ''}`}
              style={{
                opacity: lineOpacity,
                transform: `translateY(${lineOffset}px) scale(${lineScale})`,
                filter: lineBlur > 0 ? `blur(${lineBlur.toFixed(2)}px)` : 'none',
                color: isActive ? finalActive : finalInactive,
                transition: 'transform 290ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease-out, color 220ms ease-out, filter 220ms ease-out',
                willChange: absoluteDistance <= MAX_VISIBLE_DISTANCE ? 'transform, opacity, color, filter' : 'auto',
                '--active-color': finalActive,
                '--streamer-color': streamerColor,
                '--underline-shadow': underlineShadow,
              } as React.CSSProperties}
            >
              {displayOrder.map((sourceIndex, renderIdx) => {
                const text = line.content[sourceIndex];
                if (!text) return null;

                const isPrimary = sourceIndex === primaryLineIndex;
                const baseFontSize = isPrimary ? mainFontSize : subFontSize;
                const resolvedFontSize = clamp(baseFontSize + (isActive ? activeSizeCompensation : 0), 8, 240);
                const applyFluid = isActive && activeEffect === 'fluid';
                const shouldRenderShadow = shadowEnabled && isActive;
                const shadowValue = `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur}px ${shadowColorRgba}`;
                const shouldUseDropShadow = shouldRenderShadow && (applyFluid || isSingerGradient);
                const shouldRenderTextEffects = lineOpacity > 0.01;
                const textShadows: string[] = [];

                if (shouldRenderTextEffects && outlineShadowValue) {
                  textShadows.push(outlineShadowValue);
                }

                if (shouldRenderTextEffects && shouldRenderShadow && !shouldUseDropShadow) {
                  textShadows.push(shadowValue);
                }

                const dynamicTextStyle: React.CSSProperties = {
                  fontSize: `${resolvedFontSize}px`,
                  textShadow: textShadows.length > 0 ? textShadows.join(', ') : 'none',
                  filter: shouldRenderTextEffects && shouldUseDropShadow ? `drop-shadow(${shadowValue})` : 'none',
                  opacity: isActive ? 1 : isPrimary ? 0.84 : 0.7,
                  transition: 'font-size 290ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease-out, color 220ms ease-out, filter 220ms ease-out',
                };

                if (isSingerGradient) {
                  dynamicTextStyle.backgroundImage = `linear-gradient(to right, ${singerOverrideColors.join(', ')})`;
                }

                return (
                  <p
                    key={`${index}-${renderIdx}`}
                    className={`relative z-20 leading-relaxed ${isPrimary ? `font-serif mb-1 ${uniformPrimaryWeight}` : `font-sans mt-1 tracking-wider ${uniformSecondaryWeight}`} ${applyFluid ? 'active-fluid' : ''} ${isSingerGradient ? 'singer-gradient' : ''}`}
                    style={dynamicTextStyle}
                  >
                    {text}
                  </p>
                );
              })}
            </div>
          );
        })}

        <div style={{ minHeight: `${containerHeight / 2}px` }} aria-hidden="true" />
      </div>
    </div>
  );
};

export default LyricsDisplay;
