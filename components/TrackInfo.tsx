
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
                    return (
                        <h2 
                            className={`font-serif tracking-widest drop-shadow-lg transition-all duration-1000 ${ts.className}`}
                            style={getGradientStyle(singerOverrideColors, ts.style)}
                        >
                            {displayTitle}
                        </h2>
                    )
                })()}

                {(() => {
                    const ts = getTextStyle(appState.trackArtistSize, appState.trackArtistColor, appState.trackArtistBold, appState.trackArtistItalic, themeTextSub);
                    return (
                        <p 
                            className={`font-sans tracking-[0.2em] mt-2 transition-all duration-1000 ${ts.className}`}
                            style={getGradientStyle(singerOverrideColors, ts.style)}
                        >
                            {displayArtist}
                        </p>
                    )
                })()}

                {appState.metadata.album && (() => {
                        const ts = getTextStyle(appState.trackAlbumSize, appState.trackAlbumColor, appState.trackAlbumBold, appState.trackAlbumItalic, themeTextMuted);
                        return (
                        <p 
                            className={`font-serif italic opacity-80 mt-1 transition-all duration-1000 ${ts.className}`}
                            style={getGradientStyle(singerOverrideColors, ts.style)}
                        >
                            {appState.metadata.album}
                        </p>
                        )
                })()}
                
                {appState.metadata.visualArtist && (() => {
                        const ts = getTextStyle(appState.trackVisualArtistSize, appState.trackVisualArtistColor, appState.trackVisualArtistBold, appState.trackVisualArtistItalic, themeTextSub);
                        return (
                        <p 
                            className={`font-sans tracking-wider opacity-70 mt-3 transition-all duration-1000 ${ts.className}`}
                            style={getGradientStyle(singerOverrideColors, ts.style)}
                        >
                            VA: {appState.metadata.visualArtist}
                        </p>
                        )
                })()}

                {appState.metadata.coverSinger && (() => {
                    const ts = getTextStyle(appState.trackCoverSingerSize, appState.trackCoverSingerColor, appState.trackCoverSingerBold, appState.trackCoverSingerItalic, themeTextSub);
                    return (
                        <p 
                            className={`font-sans tracking-wider opacity-70 mt-1 transition-all duration-1000 ${ts.className}`}
                            style={getGradientStyle(singerOverrideColors, ts.style)}
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
