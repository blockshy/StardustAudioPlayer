

import React from 'react';
import { MdTextFields, MdFormatBold, MdFormatItalic, MdFormatColorFill, MdFormatSize, MdBlurOn } from 'react-icons/md';
import { AppState } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';

interface ConfigTypographyProps {
    appState: AppState;
    onTrackTypographyChange: (field: 'trackTitle' | 'trackArtist' | 'trackAlbum' | 'trackVisualArtist' | 'trackCoverSinger', prop: 'Size' | 'Color' | 'Bold' | 'Italic' | 'ShadowEnabled' | 'ShadowDirection' | 'ShadowStrength' | 'ShadowDistance' | 'ShadowBlur' | 'ShadowColor', value: any) => void;
    translations: any;
}

const ConfigTypography: React.FC<ConfigTypographyProps> = ({ appState, onTrackTypographyChange, translations: t }) => {
    const themeClasses = getThemeClasses(appState);
    const defaultShadowColor = appState.themeMode === 'dark' ? '#ffffff' : '#000000';
    const shadowDirections = [
        { value: 270, label: t.top },
        { value: 315, label: t.dirUpRight },
        { value: 0, label: t.right },
        { value: 45, label: t.dirDownRight },
        { value: 90, label: t.bottom },
        { value: 135, label: t.dirDownLeft },
        { value: 180, label: t.left },
        { value: 225, label: t.dirUpLeft }
    ];

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
        const shadowEnabledKey = `${field}ShadowEnabled` as keyof AppState;
        const shadowDirectionKey = `${field}ShadowDirection` as keyof AppState;
        const shadowStrengthKey = `${field}ShadowStrength` as keyof AppState;
        const shadowDistanceKey = `${field}ShadowDistance` as keyof AppState;
        const shadowBlurKey = `${field}ShadowBlur` as keyof AppState;
        const shadowColorKey = `${field}ShadowColor` as keyof AppState;

        const currentSize = appState[sizeKey] as number;
        const currentColor = appState[colorKey] as string | null;
        const currentBold = appState[boldKey] as boolean;
        const currentItalic = appState[italicKey] as boolean;
        const shadowEnabled = appState[shadowEnabledKey] as boolean;
        const shadowDirection = appState[shadowDirectionKey] as number;
        const shadowStrength = appState[shadowStrengthKey] as number;
        const shadowDistance = appState[shadowDistanceKey] as number;
        const shadowBlur = appState[shadowBlurKey] as number;
        const shadowColor = appState[shadowColorKey] as string | null;

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

                <div className={`pt-2 border-t border-dashed ${themeClasses.border} space-y-3`}>
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className={`text-[10px] ${themeClasses.textMuted} uppercase flex items-center gap-1`}><MdBlurOn size={14} /> {t.shadow}</span>
                        <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                            <input
                                type="checkbox"
                                checked={shadowEnabled}
                                onChange={(e) => onTrackTypographyChange(field, 'ShadowEnabled', e.target.checked)}
                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-0"
                                style={{ borderColor: '#4b5563' }}
                            />
                            <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${shadowEnabled ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                        </div>
                    </label>

                    {shadowEnabled && (
                        <div className="space-y-3 animate-fade-in">
                            <div className="flex items-center justify-between gap-2">
                                <span className={`text-[10px] ${themeClasses.textMuted} uppercase`}>{t.shadowDirection}</span>
                                <select
                                    value={shadowDirection}
                                    onChange={(e) => onTrackTypographyChange(field, 'ShadowDirection', Number(e.target.value))}
                                    className={`${themeClasses.itemBg} ${themeClasses.textMain} border ${themeClasses.border} rounded px-2 py-1 text-xs focus:outline-none`}
                                >
                                    {shadowDirections.map(direction => (
                                        <option key={direction.value} value={direction.value}>{direction.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                <span className={`text-[10px] ${themeClasses.textMuted} uppercase`}>{t.shadowColor}</span>
                                <div className="flex items-center gap-2">
                                    {shadowColor && (
                                        <button onClick={() => onTrackTypographyChange(field, 'ShadowColor', null)} className={`text-[10px] ${themeClasses.textMuted} hover:${themeClasses.textMain}`}>{t.reset}</button>
                                    )}
                                    <div className={`relative w-6 h-6 rounded-full overflow-hidden border ${themeClasses.isDarkBase ? 'border-white/20' : 'border-black/20'}`}>
                                        <input
                                            type="color"
                                            value={shadowColor || defaultShadowColor}
                                            onChange={(e) => onTrackTypographyChange(field, 'ShadowColor', e.target.value)}
                                            className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className={`flex justify-between text-[10px] ${themeClasses.textSub} mb-1`}>
                                    <span>{t.shadowStrength}</span>
                                    <span className={`font-mono ${themeClasses.textMuted}`}>{Math.round(shadowStrength * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={shadowStrength}
                                    onChange={(e) => onTrackTypographyChange(field, 'ShadowStrength', Number(e.target.value))}
                                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                />
                            </div>

                            <div>
                                <div className={`flex justify-between text-[10px] ${themeClasses.textSub} mb-1`}>
                                    <span>{t.shadowDistance}</span>
                                    <span className={`font-mono ${themeClasses.textMuted}`}>{shadowDistance}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    step="1"
                                    value={shadowDistance}
                                    onChange={(e) => onTrackTypographyChange(field, 'ShadowDistance', Number(e.target.value))}
                                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                />
                            </div>

                            <div>
                                <div className={`flex justify-between text-[10px] ${themeClasses.textSub} mb-1`}>
                                    <span>{t.shadowBlur}</span>
                                    <span className={`font-mono ${themeClasses.textMuted}`}>{shadowBlur}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="30"
                                    step="1"
                                    value={shadowBlur}
                                    onChange={(e) => onTrackTypographyChange(field, 'ShadowBlur', Number(e.target.value))}
                                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                />
                            </div>
                        </div>
                    )}
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
