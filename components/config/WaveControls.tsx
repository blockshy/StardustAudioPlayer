
import React from 'react';
import { MdWaves, MdGraphicEq, MdHeight, MdBlurOn } from 'react-icons/md';
import { AppState } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';

interface WaveControlsProps {
    appState: AppState;
    onSensitivityChange: (target: 'vinyl' | 'bar' | 'particle', value: number) => void;
    onWaveBarConfigChange?: (key: 'scale' | 'x' | 'y' | 'blur' | 'opacity' | 'height', value: number) => void;
    onVisualizerChange: (key: 'enableWaves' | 'enableParticles' | 'enableParticleBeatSync', value: boolean) => void;
    translations: any;
}

const WaveControls: React.FC<WaveControlsProps> = ({ 
    appState, onSensitivityChange, onWaveBarConfigChange, onVisualizerChange, translations: t 
}) => {
    const themeClasses = getThemeClasses(appState);

    return (
        <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer group">
                <span className={`text-sm ${themeClasses.textSub} group-hover:${themeClasses.textMain} transition-colors font-serif`}>{t.liquidWave}</span>
                <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                    <input 
                        type="checkbox" 
                        checked={appState.enableWaves}
                        onChange={(e) => onVisualizerChange('enableWaves', e.target.checked)}
                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-0"
                        style={{borderColor: '#4b5563'}}
                    />
                    <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${appState.enableWaves ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                </div>
            </label>

            {appState.enableWaves && (
                <div className={`${themeClasses.itemActive} rounded-lg p-3 ml-2 border-l-2 border-emerald-500/30 transition-all animate-fade-in space-y-3`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className={`text-xs ${themeClasses.textMuted} font-sans uppercase flex items-center gap-2`}>
                            <MdWaves /> {t.waveBarStyle}
                        </div>
                    </div>
                    <div>
                        <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                            <span className="flex items-center gap-1"><MdGraphicEq className={themeClasses.textMuted} /> {t.waveBarSens}</span>
                            <span className={`font-mono ${themeClasses.textMuted}`}>{appState.barSensitivity.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10.0"
                            step="0.1"
                            value={appState.barSensitivity}
                            onChange={(e) => onSensitivityChange('bar', Number(e.target.value))}
                            className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                        />
                    </div>
                    <div>
                        <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                            <span className="flex items-center gap-1"><MdHeight className={themeClasses.textMuted} /> {t.waveHeight}</span>
                            <span className={`font-mono ${themeClasses.textMuted}`}>{Math.round(appState.waveBarHeight)}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="1" 
                            value={appState.waveBarHeight}
                            onChange={(e) => onWaveBarConfigChange && onWaveBarConfigChange('height', Number(e.target.value))}
                            className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                        />
                    </div>
                    <div>
                        <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                            <span className="flex items-center gap-1"><MdBlurOn className={themeClasses.textMuted} /> {t.clarity}</span>
                            <span className={`font-mono ${themeClasses.textMuted}`}>{appState.waveBarBlur}px</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="10" 
                            step="0.1" 
                            value={appState.waveBarBlur}
                            onChange={(e) => onWaveBarConfigChange && onWaveBarConfigChange('blur', Number(e.target.value))}
                            className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaveControls;
