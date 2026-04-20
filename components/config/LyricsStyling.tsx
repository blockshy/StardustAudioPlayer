
import React, { useState } from 'react';
import { MdFormatListNumbered, MdStar, MdFormatPaint, MdTimer, MdAutoFixHigh, MdBlurOn } from 'react-icons/md';
import { AppState, LyricEffect } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';

interface LyricsStylingProps {
    appState: AppState;
    onLyricLineConfigChange: (key: 'primaryIndex' | 'order', value: number | number[]) => void;
    onLyricSizeChange: (type: 'main' | 'sub', size: number) => void;
    onLyricActiveSizeCompensationChange: (size: number) => void;
    onLyricInactiveBlurChange: (key: 'enabled' | 'strength', value: boolean | number) => void;
    onLyricBoldChange: (isBold: boolean) => void;
    onLyricColorChange: (key: 'active' | 'inactive' | 'stroke' | 'strokeWidth' | 'effect' | 'streamerColor', value: string | number | null | LyricEffect) => void;
    onLyricShadowChange: (key: 'enabled' | 'direction' | 'strength' | 'distance' | 'blur' | 'color', value: boolean | number | string | null) => void;
    onLyricOffsetChange: (offset: number) => void;
    onLyricGapToleranceChange: (tolerance: number) => void;
    translations: any;
}

const LyricsStyling: React.FC<LyricsStylingProps> = ({ 
    appState, onLyricLineConfigChange, onLyricSizeChange, onLyricActiveSizeCompensationChange, onLyricInactiveBlurChange, onLyricBoldChange, 
    onLyricColorChange, onLyricShadowChange, onLyricOffsetChange, onLyricGapToleranceChange, translations: t 
}) => {
    const themeClasses = getThemeClasses(appState);
    const [orderInput, setOrderInput] = useState(appState.lyricDisplayOrder.map(i => i + 1).join(', '));

    const handleOrderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setOrderInput(val);
        const parts = val.split(/[,\s]+/)
          .map(s => parseInt(s.trim()))
          .filter(n => !isNaN(n) && n > 0); 
        if (parts.length > 0) {
            const zeroBased = parts.map(n => n - 1);
            onLyricLineConfigChange('order', zeroBased);
        }
    };

    const activeEffects: { id: LyricEffect; label: string }[] = [
        { id: 'none', label: t.effNone },
        { id: 'fluid', label: t.effFluid },
        { id: 'underline', label: t.effUnderline },
    ];
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

    return (
        <>
            <div className="space-y-4 border-dashed border-gray-500/30">
                <div className="flex justify-between items-center">
                    <span className={`text-sm ${themeClasses.textSub} font-serif flex items-center gap-2`}><MdFormatListNumbered /> {t.multiLine}</span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                    <div className={`${themeClasses.inputBg} rounded-lg p-3 border ${themeClasses.border}`}>
                        <span className={`text-[10px] ${themeClasses.textMuted} uppercase block mb-2`}>{t.primaryLine}</span>
                        <div className="flex gap-2">
                            {[0, 1, 2].map(idx => (
                                <button
                                    key={idx}
                                    onClick={() => onLyricLineConfigChange('primaryIndex', idx)}
                                    className={`flex-1 py-1.5 rounded text-xs border transition-all ${
                                        appState.lyricPrimaryLineIndex === idx 
                                        ? `${themeClasses.itemActive} ${themeClasses.borderActive} ${themeClasses.textMain} font-bold` 
                                        : `${themeClasses.itemBg} border-transparent ${themeClasses.textMuted} hover:${themeClasses.itemHover}`
                                    }`}
                                >
                                    {t.line} {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={`${themeClasses.inputBg} rounded-lg p-3 border ${themeClasses.border}`}>
                        <span className={`text-[10px] ${themeClasses.textMuted} uppercase block mb-2`}>{t.displayOrder} (e.g. 1, 2, 3)</span>
                        <input 
                            type="text" 
                            value={orderInput}
                            onChange={handleOrderInputChange}
                            className={`w-full ${themeClasses.itemBg} border ${themeClasses.border} rounded px-3 py-2 text-sm ${themeClasses.textMain} placeholder-current placeholder-opacity-20 focus:outline-none focus:border-opacity-50`}
                            placeholder="1, 2"
                        />
                        <p className={`text-[10px] ${themeClasses.textVeryMuted} mt-1.5 italic`}>
                            {t.orderHint}
                        </p>
                    </div>
                </div>
            </div>

            <hr className={themeClasses.border} />

            <div>
                <div className={`flex justify-between text-sm ${themeClasses.textSub} mt-4`}>
                    <span className="font-serif flex items-center gap-2"><MdStar className={themeClasses.textMuted} /> {t.mainFontSize}</span>
                    <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{appState.lyricFontSizeMain}px</span>
                </div>
                <input
                    type="range"
                    min="20"
                    max="80"
                    step="2"
                    value={appState.lyricFontSizeMain}
                    onChange={(e) => onLyricSizeChange('main', Number(e.target.value))}
                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                />
            </div>
            
            <div>
                <div className={`flex justify-between text-sm ${themeClasses.textSub} mt-4`}>
                    <span className="font-serif">{t.subFontSize}</span>
                    <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{appState.lyricFontSizeSub}px</span>
                </div>
                <input
                    type="range"
                    min="10"
                    max="40"
                    step="1"
                    value={appState.lyricFontSizeSub}
                    onChange={(e) => onLyricSizeChange('sub', Number(e.target.value))}
                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                />
            </div>

            <div>
                <div className={`flex justify-between text-sm ${themeClasses.textSub} mt-4`}>
                    <span className="font-serif">{t.activeSizeCompensation}</span>
                    <span className={`font-mono ${themeClasses.textMuted} text-xs`}>
                        {appState.lyricActiveSizeCompensation > 0 ? '+' : ''}{appState.lyricActiveSizeCompensation}px
                    </span>
                </div>
                <input
                    type="range"
                    min="-12"
                    max="24"
                    step="1"
                    value={appState.lyricActiveSizeCompensation}
                    onChange={(e) => onLyricActiveSizeCompensationChange(Number(e.target.value))}
                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                />
            </div>

            <label className="flex items-center justify-between cursor-pointer group pt-2 pb-2">
                <span className={`text-sm ${themeClasses.textSub} group-hover:${themeClasses.textMain} transition-colors font-serif`}>{t.boldLyrics}</span>
                <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                    <input 
                        type="checkbox" 
                        checked={appState.lyricBold}
                        onChange={(e) => onLyricBoldChange(e.target.checked)}
                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-0"
                        style={{borderColor: '#4b5563'}}
                    />
                    <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${appState.lyricBold ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                </div>
            </label>

            <hr className={themeClasses.border} />

            <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                    <span className={`text-sm ${themeClasses.textSub} font-serif flex items-center gap-2`}><MdFormatPaint /> {t.customAppearance}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className={`${themeClasses.inputBg} rounded-lg p-2 border ${themeClasses.border} flex items-center justify-between`}>
                        <span className={`text-[10px] ${themeClasses.textMuted} uppercase`}>{t.active}</span>
                        <div className="flex items-center gap-2">
                            {appState.lyricActiveColor && (
                                <button onClick={() => onLyricColorChange('active', null)} className={`text-[10px] ${themeClasses.textMuted} hover:${themeClasses.textMain}`}>{t.reset}</button>
                            )}
                            <div className={`relative w-6 h-6 rounded-full overflow-hidden border ${themeClasses.isDarkBase ? 'border-white/20' : 'border-black/20'}`}>
                                <input 
                                    type="color" 
                                    value={appState.lyricActiveColor || appState.themeColor}
                                    onChange={(e) => onLyricColorChange('active', e.target.value)}
                                    className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className={`${themeClasses.inputBg} rounded-lg p-2 border ${themeClasses.border} flex items-center justify-between`}>
                        <span className={`text-[10px] ${themeClasses.textMuted} uppercase`}>{t.inactive}</span>
                        <div className="flex items-center gap-2">
                            {appState.lyricInactiveColor && (
                                <button onClick={() => onLyricColorChange('inactive', null)} className={`text-[10px] ${themeClasses.textMuted} hover:${themeClasses.textMain}`}>{t.reset}</button>
                            )}
                            <div className={`relative w-6 h-6 rounded-full overflow-hidden border ${themeClasses.isDarkBase ? 'border-white/20' : 'border-black/20'}`}>
                                <input 
                                    type="color" 
                                    value={appState.lyricInactiveColor || (themeClasses.isDarkBase ? '#ffffff' : '#000000')}
                                    onChange={(e) => onLyricColorChange('inactive', e.target.value)}
                                    className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`${themeClasses.inputBg} rounded-lg p-3 border ${themeClasses.border} space-y-3`}>
                    <div className="flex justify-between items-center">
                        <span className={`text-xs ${themeClasses.textMuted} font-sans uppercase`}>{t.stroke}</span>
                        <div className={`relative w-5 h-5 rounded-full overflow-hidden border ${themeClasses.isDarkBase ? 'border-white/20' : 'border-black/20'}`}>
                                <input 
                                    type="color" 
                                    value={appState.lyricStrokeColor}
                                    onChange={(e) => onLyricColorChange('stroke', e.target.value)}
                                    className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer"
                                />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="0"
                            max="4"
                            step="0.5"
                            value={appState.lyricStrokeWidth}
                            onChange={(e) => onLyricColorChange('strokeWidth', Number(e.target.value))}
                            className={`flex-1 h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                        />
                        <span className={`font-mono ${themeClasses.textMuted} text-[10px] w-6 text-right`}>{appState.lyricStrokeWidth}px</span>
                    </div>
                </div>

                <div className={`${themeClasses.inputBg} rounded-lg p-3 border ${themeClasses.border} space-y-3`}>
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className={`text-xs ${themeClasses.textMuted} font-sans uppercase flex items-center gap-2`}><MdBlurOn /> {t.inactiveBlur}</span>
                        <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                            <input
                                type="checkbox"
                                checked={appState.lyricInactiveBlurEnabled}
                                onChange={(e) => onLyricInactiveBlurChange('enabled', e.target.checked)}
                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-0"
                                style={{ borderColor: '#4b5563' }}
                            />
                            <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${appState.lyricInactiveBlurEnabled ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                        </div>
                    </label>

                    {appState.lyricInactiveBlurEnabled && (
                        <div className="animate-fade-in">
                            <div className={`flex justify-between text-[10px] ${themeClasses.textSub} mb-1`}>
                                <span>{t.inactiveBlurStrength}</span>
                                <span className={`font-mono ${themeClasses.textMuted}`}>{appState.lyricInactiveBlurStrength.toFixed(1)}px</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="8"
                                step="0.5"
                                value={appState.lyricInactiveBlurStrength}
                                onChange={(e) => onLyricInactiveBlurChange('strength', Number(e.target.value))}
                                className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                            />
                        </div>
                    )}
                </div>
                
                <div className={`${themeClasses.inputBg} rounded-lg p-3 border ${themeClasses.border} space-y-3`}>
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className={`text-xs ${themeClasses.textMuted} font-sans uppercase flex items-center gap-2`}><MdBlurOn /> {t.shadow}</span>
                        <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                            <input
                                type="checkbox"
                                checked={appState.lyricShadowEnabled}
                                onChange={(e) => onLyricShadowChange('enabled', e.target.checked)}
                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-0"
                                style={{ borderColor: '#4b5563' }}
                            />
                            <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${appState.lyricShadowEnabled ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                        </div>
                    </label>

                    {appState.lyricShadowEnabled && (
                        <div className="space-y-3 animate-fade-in">
                            <div className="flex items-center justify-between gap-3">
                                <span className={`text-[10px] ${themeClasses.textMuted} uppercase`}>{t.shadowDirection}</span>
                                <select
                                    value={appState.lyricShadowDirection}
                                    onChange={(e) => onLyricShadowChange('direction', Number(e.target.value))}
                                    className={`${themeClasses.itemBg} ${themeClasses.textMain} border ${themeClasses.border} rounded px-2 py-1 text-xs focus:outline-none`}
                                >
                                    {shadowDirections.map(direction => (
                                        <option key={direction.value} value={direction.value}>{direction.label}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex items-center justify-between gap-3">
                                <span className={`text-[10px] ${themeClasses.textMuted} uppercase`}>{t.shadowColor}</span>
                                <div className="flex items-center gap-2">
                                    {appState.lyricShadowColor && (
                                        <button onClick={() => onLyricShadowChange('color', null)} className={`text-[10px] ${themeClasses.textMuted} hover:${themeClasses.textMain}`}>{t.reset}</button>
                                    )}
                                    <div className={`relative w-6 h-6 rounded-full overflow-hidden border ${themeClasses.isDarkBase ? 'border-white/20' : 'border-black/20'}`}>
                                        <input
                                            type="color"
                                            value={appState.lyricShadowColor || defaultShadowColor}
                                            onChange={(e) => onLyricShadowChange('color', e.target.value)}
                                            className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className={`flex justify-between text-[10px] ${themeClasses.textSub} mb-1`}>
                                    <span>{t.shadowStrength}</span>
                                    <span className={`font-mono ${themeClasses.textMuted}`}>{Math.round(appState.lyricShadowStrength * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={appState.lyricShadowStrength}
                                    onChange={(e) => onLyricShadowChange('strength', Number(e.target.value))}
                                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                />
                            </div>

                            <div>
                                <div className={`flex justify-between text-[10px] ${themeClasses.textSub} mb-1`}>
                                    <span>{t.shadowDistance}</span>
                                    <span className={`font-mono ${themeClasses.textMuted}`}>{appState.lyricShadowDistance}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    step="1"
                                    value={appState.lyricShadowDistance}
                                    onChange={(e) => onLyricShadowChange('distance', Number(e.target.value))}
                                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                />
                            </div>

                            <div>
                                <div className={`flex justify-between text-[10px] ${themeClasses.textSub} mb-1`}>
                                    <span>{t.shadowBlur}</span>
                                    <span className={`font-mono ${themeClasses.textMuted}`}>{appState.lyricShadowBlur}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="30"
                                    step="1"
                                    value={appState.lyricShadowBlur}
                                    onChange={(e) => onLyricShadowChange('blur', Number(e.target.value))}
                                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className={`${themeClasses.inputBg} rounded-lg p-3 border ${themeClasses.border} space-y-3`}>
                    <span className={`text-xs ${themeClasses.textMuted} font-sans uppercase flex items-center gap-2 mb-2`}>
                        <MdAutoFixHigh /> {t.activeEffect}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                        {activeEffects.map(effect => (
                            <button
                                key={effect.id}
                                onClick={() => onLyricColorChange('effect', effect.id)}
                                className={`py-1.5 px-2 rounded text-[10px] border transition-all ${
                                    appState.activeLyricEffect === effect.id
                                    ? `${themeClasses.itemActive} ${themeClasses.borderActive} ${themeClasses.textMain}`
                                    : `${themeClasses.itemBg} border-transparent ${themeClasses.textMuted} hover:${themeClasses.itemHover}`
                                }`}
                            >
                                {effect.label}
                            </button>
                        ))}
                    </div>

                    {appState.activeLyricEffect === 'fluid' && (
                        <div className="flex justify-between items-center pt-2 animate-fade-in">
                            <span className={`text-xs ${themeClasses.textSub}`}>{t.streamerColor}</span>
                            <div className={`relative w-6 h-6 rounded-full overflow-hidden border ${themeClasses.isDarkBase ? 'border-white/20' : 'border-black/20'}`}>
                                <input 
                                    type="color" 
                                    value={appState.activeLyricStreamerColor}
                                    onChange={(e) => onLyricColorChange('streamerColor', e.target.value)}
                                    className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <hr className={themeClasses.border} />

            <div className="pt-4">
                <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                    <span className="font-serif flex items-center gap-2"><MdTimer /> {t.sync}</span>
                    <span className={`font-mono ${themeClasses.textMuted} text-xs`}>
                        {appState.lyricOffset > 0 ? '+' : ''}{appState.lyricOffset.toFixed(1)}s
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-[10px] ${themeClasses.textMuted} font-sans uppercase tracking-wider`}>{t.earlier}</span>
                    <input
                        type="range"
                        min="-5"
                        max="5"
                        step="0.1"
                        value={appState.lyricOffset}
                        onChange={(e) => onLyricOffsetChange(Number(e.target.value))}
                        className={`flex-1 h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                    />
                    <span className={`text-[10px] ${themeClasses.textMuted} font-sans uppercase tracking-wider`}>{t.later}</span>
                </div>
                
                <div className="mt-3 pt-3 border-t border-dashed border-gray-700/30">
                    <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                        <span className="font-serif flex items-center gap-2">{t.gapTolerance}</span>
                            <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{appState.lyricGapTolerance}s</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={appState.lyricGapTolerance}
                        onChange={(e) => onLyricGapToleranceChange(Number(e.target.value))}
                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                    />
                    <p className={`text-[9px] ${themeClasses.textMuted} mt-1`}>{t.gapToleranceHint}</p>
                </div>
            </div>
        </>
    );
};

export default LyricsStyling;
