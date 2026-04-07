
import React from 'react';
import { AppState } from '../types';
import { getTextStyle } from '../utils/uiUtils';

interface TrackInfoProps {
    appState: AppState;
    displayTitle: string;
    displayArtist: string;
    singerOverrideColors?: string[] | null;
}

const TrackInfo: React.FC<TrackInfoProps> = ({ appState, displayTitle, displayArtist, singerOverrideColors }) => {
    const isDarkBase = appState.themeMode !== 'light';
    const themeTextMain = isDarkBase ? 'text-white' : 'text-gray-900';
    const themeTextSub = isDarkBase ? 'text-white/60' : 'text-gray-700';
    const themeTextMuted = isDarkBase ? 'text-white/40' : 'text-gray-500';
    const defaultShadowColor = appState.themeMode === 'dark' ? '#ffffff' : '#000000';

    const getGradientStyle = (colors: string[] | undefined | null, baseStyle: React.CSSProperties) => {
        if (!colors || colors.length === 0) return baseStyle;
        if (colors.length === 1) return { ...baseStyle, color: colors[0] };
        
        return {
            ...baseStyle,
            backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        };
    };

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

    const getShadowStyle = (
        field: 'trackTitle' | 'trackArtist' | 'trackAlbum' | 'trackVisualArtist' | 'trackCoverSinger',
        isGradient: boolean
    ): React.CSSProperties => {
        const enabled = appState[`${field}ShadowEnabled` as keyof AppState] as boolean;
        if (!enabled) return { textShadow: 'none', filter: 'none' };

        const direction = appState[`${field}ShadowDirection` as keyof AppState] as number;
        const strength = appState[`${field}ShadowStrength` as keyof AppState] as number;
        const distance = appState[`${field}ShadowDistance` as keyof AppState] as number;
        const blur = appState[`${field}ShadowBlur` as keyof AppState] as number;
        const color = (appState[`${field}ShadowColor` as keyof AppState] as string | null) || defaultShadowColor;

        const radians = (direction * Math.PI) / 180;
        const x = Math.cos(radians) * distance;
        const y = Math.sin(radians) * distance;
        const shadow = `${x.toFixed(1)}px ${y.toFixed(1)}px ${blur}px ${toRgba(color, strength)}`;
        return isGradient ? { filter: `drop-shadow(${shadow})` } : { textShadow: shadow };
    };

    return (
        <div 
            className={`mt-[var(--info-gap)] text-center transition-opacity duration-500 w-full px-4`}
            style={{ 
                '--info-gap': `${appState.albumInfoGap}px`
            } as React.CSSProperties}
        >
            <div className="space-y-1">
                {(() => {
                    const ts = getTextStyle(appState.trackTitleSize, appState.trackTitleColor, appState.trackTitleBold, appState.trackTitleItalic, themeTextMain);
                    const hasGradient = !!(singerOverrideColors && singerOverrideColors.length > 1);
                    return (
                        <h2 
                            className={`font-serif tracking-widest transition-all duration-1000 ${ts.className}`}
                            style={{ ...getGradientStyle(singerOverrideColors, ts.style), ...getShadowStyle('trackTitle', hasGradient) }}
                        >
                            {displayTitle}
                        </h2>
                    )
                })()}

                {(() => {
                    const ts = getTextStyle(appState.trackArtistSize, appState.trackArtistColor, appState.trackArtistBold, appState.trackArtistItalic, themeTextSub);
                    const hasGradient = !!(singerOverrideColors && singerOverrideColors.length > 1);
                    return (
                        <p 
                            className={`font-sans tracking-[0.2em] mt-2 transition-all duration-1000 ${ts.className}`}
                            style={{ ...getGradientStyle(singerOverrideColors, ts.style), ...getShadowStyle('trackArtist', hasGradient) }}
                        >
                            {displayArtist}
                        </p>
                    )
                })()}

                {appState.metadata.album && (() => {
                        const ts = getTextStyle(appState.trackAlbumSize, appState.trackAlbumColor, appState.trackAlbumBold, appState.trackAlbumItalic, themeTextMuted);
                        const hasGradient = !!(singerOverrideColors && singerOverrideColors.length > 1);
                        return (
                        <p 
                            className={`font-serif italic opacity-80 mt-1 transition-all duration-1000 ${ts.className}`}
                            style={{ ...getGradientStyle(singerOverrideColors, ts.style), ...getShadowStyle('trackAlbum', hasGradient) }}
                        >
                            {appState.metadata.album}
                        </p>
                        )
                })()}
                
                {appState.metadata.visualArtist && (() => {
                        const ts = getTextStyle(appState.trackVisualArtistSize, appState.trackVisualArtistColor, appState.trackVisualArtistBold, appState.trackVisualArtistItalic, themeTextSub);
                        const hasGradient = !!(singerOverrideColors && singerOverrideColors.length > 1);
                        return (
                        <p 
                            className={`font-sans tracking-wider opacity-70 mt-3 transition-all duration-1000 ${ts.className}`}
                            style={{ ...getGradientStyle(singerOverrideColors, ts.style), ...getShadowStyle('trackVisualArtist', hasGradient) }}
                        >
                            VA: {appState.metadata.visualArtist}
                        </p>
                        )
                })()}

                {appState.metadata.coverSinger && (() => {
                    const ts = getTextStyle(appState.trackCoverSingerSize, appState.trackCoverSingerColor, appState.trackCoverSingerBold, appState.trackCoverSingerItalic, themeTextSub);
                    const hasGradient = !!(singerOverrideColors && singerOverrideColors.length > 1);
                    return (
                        <p 
                            className={`font-sans tracking-wider opacity-70 mt-1 transition-all duration-1000 ${ts.className}`}
                            style={{ ...getGradientStyle(singerOverrideColors, ts.style), ...getShadowStyle('trackCoverSinger', hasGradient) }}
                        >
                            Cover: {appState.metadata.coverSinger}
                        </p>
                    )
                })()}
            </div>
        </div>
    );
};

export default TrackInfo;
