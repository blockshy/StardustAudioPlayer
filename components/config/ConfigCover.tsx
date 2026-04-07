

import React from 'react';
import { MdAlbum, Md3DRotation, MdDonutLarge, MdRotateRight, MdRadioButtonChecked, MdCheck } from 'react-icons/md';
import { AppState, CoverArtStyle, VinylStyle } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';

interface ConfigCoverProps {
    appState: AppState;
    onCoverArtStyleChange: (style: CoverArtStyle) => void;
    onAlbumProgressConfigChange: (key: 'enable' | 'width' | 'opacity', value: boolean | number) => void;
    onVinylScaleChange: (scale: number) => void;
    onVinylStyleChange: (style: VinylStyle) => void;
    onVinylRotationSpeedChange: (speed: number) => void;
    onVinylLabelSizeChange: (size: number) => void;
    onVinylCenterDotChange: (show: boolean) => void;
    onSensitivityChange: (target: 'vinyl' | 'bar', value: number) => void;
    translations: any;
}

const ConfigCover: React.FC<ConfigCoverProps> = ({ 
    appState, 
    onCoverArtStyleChange, 
    onAlbumProgressConfigChange, 
    onVinylScaleChange, 
    onVinylStyleChange,
    onVinylRotationSpeedChange,
    onVinylLabelSizeChange,
    onVinylCenterDotChange,
    onSensitivityChange,
    translations: t 
}) => {
    const themeClasses = getThemeClasses(appState);

    const coverArtStyles: { id: CoverArtStyle; label: string; icon: any }[] = [
        { id: 'vinyl', label: t.styleVinyl, icon: MdAlbum },
        { id: '3d-card', label: t.style3D, icon: Md3DRotation },
    ];

    const vinylStyles: { id: VinylStyle; label: string; desc: string }[] = [
        { id: 'classic', label: t.vStyleClassic, desc: t.vDescClassic },
        { id: 'vintage', label: t.vStyleVintage, desc: t.vDescVintage },
        { id: 'modern', label: t.vStyleModern, desc: t.vDescModern },
        { id: 'neon', label: t.vStyleNeon, desc: t.vDescNeon },
    ];

    return (
        <div id="section-cover" className="space-y-4 scroll-mt-4">
            <h3 className={`text-xs font-sans font-bold ${themeClasses.textMuted} uppercase tracking-widest flex items-center gap-2`}>
                <MdAlbum className="text-lg" /> {t.albumArtStyle}
            </h3>
            <div className={`${themeClasses.itemBg} rounded-xl p-4 space-y-4 border ${themeClasses.border}`}>
                <div className="grid grid-cols-2 gap-3">
                    {coverArtStyles.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => onCoverArtStyleChange(style.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 gap-2 ${
                                appState.coverArtStyle === style.id 
                                    ? `${themeClasses.itemActive} ${themeClasses.borderActive} ${themeClasses.textMain} shadow-lg` 
                                    : `${themeClasses.itemBg} ${themeClasses.border} ${themeClasses.textMuted} hover:${themeClasses.itemHover}`
                            }`}
                        >
                            <style.icon size={24} />
                            <span className="text-xs font-serif">{style.label}</span>
                        </button>
                    ))}
                </div>

                <hr className={themeClasses.border} />

                <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className={`text-sm ${themeClasses.textSub} group-hover:${themeClasses.textMain} transition-colors font-serif flex items-center gap-2`}>
                            <MdDonutLarge className={themeClasses.textMuted} /> {t.albumProgress}
                        </span>
                        <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                            <input 
                                type="checkbox" 
                                checked={appState.enableAlbumProgress}
                                onChange={(e) => onAlbumProgressConfigChange('enable', e.target.checked)}
                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-0"
                                style={{borderColor: '#4b5563'}}
                            />
                            <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${appState.enableAlbumProgress ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                        </div>
                    </label>

                    {appState.enableAlbumProgress && (
                        <div className={`${themeClasses.itemActive} rounded-lg p-3 ml-2 border-l-2 border-emerald-500/30 transition-all animate-fade-in space-y-3`}>
                            <div>
                                <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                                    <span className="font-serif flex items-center gap-2">{t.progressWidth}</span>
                                    <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{appState.albumProgressWidth}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="2"
                                    max="20"
                                    step="1"
                                    value={appState.albumProgressWidth}
                                    onChange={(e) => onAlbumProgressConfigChange('width', Number(e.target.value))}
                                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                />
                            </div>
                            <div>
                                <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                                    <span className="font-serif flex items-center gap-2">{t.opacity}</span>
                                    <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{Math.round(appState.albumProgressOpacity * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1.0"
                                    step="0.05"
                                    value={appState.albumProgressOpacity}
                                    onChange={(e) => onAlbumProgressConfigChange('opacity', Number(e.target.value))}
                                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <hr className={themeClasses.border} />

                <div>
                    <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                        <span className="font-serif flex items-center gap-2">{t.artScale}</span>
                        <span className={`font-mono ${themeClasses.textMuted} text-xs`}>
                            {Math.round(appState.vinylScale * 100)}%
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] ${themeClasses.textMuted} font-sans uppercase tracking-wider`}>{t.small}</span>
                        <input
                            type="range"
                            min="0.5"
                            max="1.5"
                            step="0.05"
                            value={appState.vinylScale} 
                            onChange={(e) => onVinylScaleChange(Number(e.target.value))}
                            className={`flex-1 h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                        />
                        <span className={`text-[10px] ${themeClasses.textMuted} font-sans uppercase tracking-wider`}>{t.large}</span>
                    </div>
                </div>

                {appState.coverArtStyle === 'vinyl' && (
                    <div className="animate-fade-in space-y-4 pt-2 border-t border-dashed border-opacity-30 border-gray-500">
                        <span className={`text-xs ${themeClasses.textMuted} font-bold uppercase tracking-wider block mb-2`}>{t.vinylOptions}</span>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {vinylStyles.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => onVinylStyleChange(style.id)}
                                    className={`relative p-2 rounded-lg border text-left transition-all ${
                                        appState.vinylStyle === style.id 
                                            ? `${themeClasses.itemActive} ${themeClasses.borderActive}` 
                                            : `${themeClasses.itemBg} ${themeClasses.border} hover:${themeClasses.itemHover}`
                                    }`}
                                >
                                    <span className={`block text-xs font-serif ${appState.vinylStyle === style.id ? themeClasses.textMain : themeClasses.textSub}`}>{style.label}</span>
                                    {appState.vinylStyle === style.id && <MdCheck size={12} className={`absolute top-2 right-2 ${themeClasses.textMain}`}/>}
                                </button>
                            ))}
                        </div>

                        <div>
                            <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                                <span className="font-serif flex items-center gap-2"><MdRotateRight size={14} className={themeClasses.textMuted}/> {t.rotationSpeed}</span>
                                <span className={`font-mono ${themeClasses.textMuted} text-xs`}>
                                    {appState.vinylRotationSpeed.toFixed(1)}x
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="4.0"
                                step="0.1"
                                value={appState.vinylRotationSpeed} 
                                onChange={(e) => onVinylRotationSpeedChange(Number(e.target.value))}
                                className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                            />
                        </div>

                        <div>
                            <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                                <span className="font-serif flex items-center gap-2">{t.labelSize}</span>
                                <span className={`font-mono ${themeClasses.textMuted} text-xs`}>
                                    {appState.vinylLabelSize}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="90"
                                step="1"
                                value={appState.vinylLabelSize} 
                                onChange={(e) => onVinylLabelSizeChange(Number(e.target.value))}
                                className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                            />
                        </div>

                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className={`text-sm ${themeClasses.textSub} group-hover:${themeClasses.textMain} transition-colors font-serif flex items-center gap-2`}>
                                <MdRadioButtonChecked className={themeClasses.textMuted} /> {t.centerDot}
                            </span>
                            <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                                <input 
                                    type="checkbox" 
                                    checked={appState.showVinylCenterDot}
                                    onChange={(e) => onVinylCenterDotChange(e.target.checked)}
                                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-0"
                                    style={{borderColor: '#4b5563'}}
                                />
                                <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${appState.showVinylCenterDot ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                            </div>
                        </label>
                    </div>
                )}

                {appState.coverArtStyle === '3d-card' && (
                    <div className="animate-fade-in space-y-4 pt-2 border-t border-dashed border-opacity-30 border-gray-500">
                        <div>
                            <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                                <span className="font-serif flex items-center gap-2"><Md3DRotation size={14} className={themeClasses.textMuted}/> {t.artPulse}</span>
                                <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{appState.vinylSensitivity.toFixed(1)}x</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="5.0"
                                step="0.1"
                                value={appState.vinylSensitivity}
                                onChange={(e) => onSensitivityChange('vinyl', Number(e.target.value))}
                                className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfigCover;
