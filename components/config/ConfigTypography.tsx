

import React from 'react';
import { MdTextFields, MdFormatBold, MdFormatItalic, MdFormatColorFill, MdFormatSize } from 'react-icons/md';
import { AppState } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';

interface ConfigTypographyProps {
    appState: AppState;
    onTrackTypographyChange: (field: 'trackTitle' | 'trackArtist' | 'trackAlbum' | 'trackVisualArtist' | 'trackCoverSinger', prop: 'Size' | 'Color' | 'Bold' | 'Italic', value: any) => void;
    translations: any;
}

const ConfigTypography: React.FC<ConfigTypographyProps> = ({ appState, onTrackTypographyChange, translations: t }) => {
    const themeClasses = getThemeClasses(appState);

    const renderTypographyControl = (
        field: 'trackTitle' | 'trackArtist' | 'trackAlbum' | 'trackVisualArtist' | 'trackCoverSinger',
        label: string,
        minSize: number = 8,
        maxSize: number = 100
    ) => {
        const sizeKey = `${field}Size` as keyof AppState;
        const colorKey = `${field}Color` as keyof AppState;
        const boldKey = `${field}Bold` as keyof AppState;
        const italicKey = `${field}Italic` as keyof AppState;

        const currentSize = appState[sizeKey] as number;
        const currentColor = appState[colorKey] as string | null;
        const currentBold = appState[boldKey] as boolean;
        const currentItalic = appState[italicKey] as boolean;

        return (
            <div className={`${themeClasses.itemBg} p-3 rounded-xl border ${themeClasses.border} space-y-3`}>
                <div className="flex items-center justify-between">
                    <span className={`text-xs font-serif ${themeClasses.textSub}`}>{label}</span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onTrackTypographyChange(field, 'Bold', !currentBold)}
                            className={`p-1.5 rounded transition-colors ${currentBold ? `${themeClasses.itemActive} ${themeClasses.textMain}` : `${themeClasses.textMuted} hover:${themeClasses.textMain}`}`}
                            title={t.bold}
                        >
                            <MdFormatBold size={16} />
                        </button>
                        <button
                            onClick={() => onTrackTypographyChange(field, 'Italic', !currentItalic)}
                            className={`p-1.5 rounded transition-colors ${currentItalic ? `${themeClasses.itemActive} ${themeClasses.textMain}` : `${themeClasses.textMuted} hover:${themeClasses.textMain}`}`}
                            title={t.italic}
                        >
                            <MdFormatItalic size={16} />
                        </button>
                        <div className="relative group/color ml-1">
                            <button 
                                className={`p-1.5 rounded flex items-center gap-1 transition-colors ${currentColor ? `${themeClasses.itemActive} ${themeClasses.textMain}` : `${themeClasses.textMuted} hover:${themeClasses.textMain}`}`}
                                title={t.color}
                                onClick={(e) => {
                                    if(currentColor) onTrackTypographyChange(field, 'Color', null);
                                }}
                            >
                                <MdFormatColorFill size={14} style={{ color: currentColor || undefined }} />
                                <input 
                                    type="color" 
                                    value={currentColor || appState.themeColor}
                                    onChange={(e) => onTrackTypographyChange(field, 'Color', e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <MdFormatSize size={14} className={themeClasses.textMuted} />
                    <input
                        type="range"
                        min={minSize}
                        max={maxSize}
                        step={1}
                        value={currentSize}
                        onChange={(e) => onTrackTypographyChange(field, 'Size', Number(e.target.value))}
                        className={`flex-1 h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                    />
                    <span className={`font-mono ${themeClasses.textMuted} text-[10px] w-6 text-right`}>{currentSize}</span>
                </div>
            </div>
        );
    };

    return (
        <div id="section-typography" className="space-y-4 scroll-mt-4">
            <h3 className={`text-xs font-sans font-bold ${themeClasses.textMuted} uppercase tracking-widest flex items-center gap-2`}>
                <MdTextFields className="text-lg" /> {t.typography}
            </h3>
            <div className={`${themeClasses.itemBg} rounded-xl p-4 space-y-4 border ${themeClasses.border}`}>
                {renderTypographyControl('trackTitle', t.trackTitle)}
                {renderTypographyControl('trackArtist', t.artist)}
                {renderTypographyControl('trackAlbum', t.album)}
                {renderTypographyControl('trackVisualArtist', t.visualArtist)}
                {renderTypographyControl('trackCoverSinger', t.coverSinger)}
            </div>
        </div>
    );
};

export default ConfigTypography;
