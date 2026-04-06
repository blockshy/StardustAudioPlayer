
import React from 'react';
import { MdRestartAlt, MdAspectRatio, MdCompareArrows, MdVerticalAlignBottom, MdOpacity, MdBlurOn } from 'react-icons/md';
import { AppState } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';

interface PlayerBarControlsProps {
    appState: AppState;
    onPlayerBarDimensionChange: (key: 'width' | 'height' | 'blur' | 'x' | 'y', value: number) => void;
    onPlayerOpacityChange: (value: number) => void;
    translations: any;
}

const PlayerBarControls: React.FC<PlayerBarControlsProps> = ({ appState, onPlayerBarDimensionChange, onPlayerOpacityChange, translations: t }) => {
    const themeClasses = getThemeClasses(appState);

    const resetPlayerBarPosition = () => {
        onPlayerBarDimensionChange('x', 0);
        onPlayerBarDimensionChange('y', 4);
    };

    return (
        <div className={`space-y-3 pt-2 border-t ${themeClasses.border}`}>
            <div className="flex items-center justify-between mb-2">
                <div className={`text-xs ${themeClasses.textMuted} font-sans uppercase flex items-center gap-2`}>
                    <MdAspectRatio /> {t.playerBar}
                </div>
                <button 
                    onClick={resetPlayerBarPosition}
                    className={`text-[10px] flex items-center gap-1 hover:${themeClasses.textMain} ${themeClasses.textMuted} transition-colors`}
                    title="Reset Position"
                >
                    <MdRestartAlt /> {t.reset}
                </button>
            </div>
            
            <div>
                <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                    <span className="font-serif flex items-center gap-2"><MdCompareArrows className="text-xs"/> {t.horizPos}</span>
                    <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{appState.playerBarPositionX}%</span>
                </div>
                <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={appState.playerBarPositionX}
                    onChange={(e) => onPlayerBarDimensionChange('x', Number(e.target.value))}
                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                />
                <div className={`flex justify-between text-[9px] ${themeClasses.textMuted} mt-1 uppercase`}>
                    <span>{t.left}</span><span>{t.center}</span><span>{t.right}</span>
                </div>
            </div>

            <div>
                <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                    <span className="font-serif flex items-center gap-2"><MdVerticalAlignBottom className="text-xs"/> {t.vertPos}</span>
                    <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{appState.playerBarPositionY}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="90"
                    step="1"
                    value={appState.playerBarPositionY}
                    onChange={(e) => onPlayerBarDimensionChange('y', Number(e.target.value))}
                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                />
                <div className={`flex justify-between text-[9px] ${themeClasses.textMuted} mt-1 uppercase`}>
                    <span>{t.bottom}</span><span>{t.top}</span>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                    <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                        <span className="font-serif">{t.width}</span>
                        <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{appState.playerBarWidth}%</span>
                    </div>
                    <input
                        type="range"
                        min="40"
                        max="100"
                        step="2"
                        value={appState.playerBarWidth}
                        onChange={(e) => onPlayerBarDimensionChange('width', Number(e.target.value))}
                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                    />
                </div>
                <div>
                    <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                        <span className="font-serif">{t.height}</span>
                        <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{appState.playerBarHeight}px</span>
                    </div>
                    <input
                        type="range"
                        min="60"
                        max="160"
                        step="4"
                        value={appState.playerBarHeight}
                        onChange={(e) => onPlayerBarDimensionChange('height', Number(e.target.value))}
                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                    <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                        <span className="font-serif flex items-center gap-2"><MdOpacity /> {t.opacity}</span>
                        <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{Math.round(appState.playerControlsOpacity * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={appState.playerControlsOpacity}
                        onChange={(e) => onPlayerOpacityChange(Number(e.target.value))}
                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                    />
                </div>
                <div>
                    <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                        <span className="font-serif flex items-center gap-2"><MdBlurOn /> {t.blur}</span>
                        <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{appState.playerBarBlur}px</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="40"
                        step="2"
                        value={appState.playerBarBlur}
                        onChange={(e) => onPlayerBarDimensionChange('blur', Number(e.target.value))}
                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                    />
                </div>
            </div>
        </div>
    );
};

export default PlayerBarControls;
