
import React from 'react';
import { MdSpeed, MdGraphicEq, MdFormatSize, MdCloudUpload, MdExplore, MdArrowUpward, MdArrowDownward, MdArrowBack, MdArrowForward, MdCircle, MdLocalFlorist, MdAcUnit, MdStar, MdClose, MdAdd, MdDelete } from 'react-icons/md';
import { AppState, ParticleType, ParticleDirection } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';

interface ParticleControlsProps {
    appState: AppState;
    onSensitivityChange: (target: 'vinyl' | 'bar' | 'particle', value: number) => void;
    onVisualizerChange: (key: 'enableWaves' | 'enableParticles' | 'enableParticleBeatSync', value: boolean) => void;
    onParticleSizeChange: (size: number) => void;
    onParticleBaseSpeedChange: (speed: number) => void;
    onParticleTypeChange: (type: ParticleType) => void;
    onParticleDirectionChange: (direction: ParticleDirection) => void;
    onFileChange: (type: 'customParticle', file: File) => void;
    onFileRemove: (type: 'customParticle') => void;
    onParticleColorChange: (color: string, useTheme: boolean) => void;
    onParticlePalettesChange: (palettes: string[][], useTheme: boolean) => void;
    translations: any;
}

const ParticleControls: React.FC<ParticleControlsProps> = ({ 
    appState, onSensitivityChange, onVisualizerChange, onParticleSizeChange, 
    onParticleBaseSpeedChange, onParticleTypeChange, onParticleDirectionChange,
    onFileChange, onFileRemove, onParticleColorChange, onParticlePalettesChange, translations: t 
}) => {
    const themeClasses = getThemeClasses(appState);
    
    const particleTypes: { id: ParticleType; label: string; icon: any }[] = [
        { id: 'circle', label: t.pTypeDot, icon: MdCircle },
        { id: 'sakura', label: t.pTypeSakura, icon: MdLocalFlorist },
        { id: 'snowflake', label: t.pTypeSnow, icon: MdAcUnit },
        { id: 'star', label: t.pTypeStar, icon: MdStar },
        { id: 'custom', label: t.pTypeCustom, icon: MdCloudUpload },
    ];

    const presetAngles = [
        { angle: 270, label: t.dirUp, icon: MdArrowUpward },
        { angle: 90, label: t.dirDown, icon: MdArrowDownward },
        { angle: 180, label: t.dirLeft, icon: MdArrowBack },
        { angle: 0, label: t.dirRight, icon: MdArrowForward },
    ];

    const addPalette = () => {
        if (appState.particlePalettes.length < 10) {
            onParticlePalettesChange([...appState.particlePalettes, ['#ffffff']], false);
        }
    };

    const removePalette = (idx: number) => {
        if (appState.particlePalettes.length > 1) {
            const newPalettes = [...appState.particlePalettes];
            newPalettes.splice(idx, 1);
            onParticlePalettesChange(newPalettes, false);
        }
    };

    const updatePaletteColor = (pIdx: number, cIdx: number, color: string) => {
        const newPalettes = [...appState.particlePalettes];
        newPalettes[pIdx][cIdx] = color;
        onParticlePalettesChange(newPalettes, false);
    };

    const addColorToPalette = (pIdx: number) => {
        if (appState.particlePalettes[pIdx].length < 3) {
            const newPalettes = [...appState.particlePalettes];
            newPalettes[pIdx].push('#ffffff');
            onParticlePalettesChange(newPalettes, false);
        }
    };

    const removeColorFromPalette = (pIdx: number, cIdx: number) => {
        if (appState.particlePalettes[pIdx].length > 1) {
            const newPalettes = [...appState.particlePalettes];
            newPalettes[pIdx].splice(cIdx, 1);
            onParticlePalettesChange(newPalettes, false);
        }
    };

    return (
        <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer group">
                <span className={`text-sm ${themeClasses.textSub} group-hover:${themeClasses.textMain} transition-colors font-serif`}>{t.particleBeats}</span>
                <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                    <input 
                        type="checkbox" 
                        checked={appState.enableParticles}
                        onChange={(e) => onVisualizerChange('enableParticles', e.target.checked)}
                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-0"
                        style={{borderColor: '#4b5563'}}
                    />
                    <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${appState.enableParticles ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                </div>
            </label>

            {appState.enableParticles && (
                <div className={`${themeClasses.itemActive} rounded-lg p-3 ml-2 border-l-2 border-emerald-500/30 transition-all animate-fade-in space-y-4`}>
                    <label className={`flex items-center justify-between cursor-pointer group pb-2 border-b ${themeClasses.border}`}>
                        <span className={`text-xs ${themeClasses.textSub} group-hover:${themeClasses.textMain} transition-colors font-sans flex items-center gap-2`}>
                            <MdSpeed className={themeClasses.textMuted} /> {t.beatSync}
                        </span>
                        <div className="relative inline-block w-8 h-4 align-middle select-none transition duration-200 ease-in">
                            <input 
                                type="checkbox" 
                                checked={appState.enableParticleBeatSync}
                                onChange={(e) => onVisualizerChange('enableParticleBeatSync', e.target.checked)}
                                className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-0"
                                style={{borderColor: '#4b5563'}}
                            />
                            <div className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer transition-colors duration-200 ${appState.enableParticleBeatSync ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                        </div>
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                                <span className="flex items-center gap-1"><MdGraphicEq size={14} className="opacity-70"/> {t.sensitivity}</span>
                                <span className={`font-mono ${themeClasses.textMuted}`}>{appState.particleSensitivity.toFixed(1)}x</span>
                            </div>
                            <input
                                type="range" min="0.5" max="5.0" step="0.1" value={appState.particleSensitivity}
                                onChange={(e) => onSensitivityChange('particle', Number(e.target.value))}
                                className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                            />
                        </div>
                        <div>
                            <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                                <span className="flex items-center gap-1"><MdFormatSize size={14} className="opacity-70"/> {t.size}</span>
                                <span className={`font-mono ${themeClasses.textMuted}`}>{appState.particleSize.toFixed(1)}x</span>
                            </div>
                            <input
                                type="range" min="0.2" max="3.0" step="0.1" value={appState.particleSize}
                                onChange={(e) => onParticleSizeChange(Number(e.target.value))}
                                className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                            <span className="font-serif flex items-center gap-2"><MdSpeed size={14} className="opacity-70"/> {t.baseSpeed}</span>
                            <span className={`font-mono ${themeClasses.textMuted}`}>{appState.particleBaseSpeed.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range" min="0.1" max="3.0" step="0.1" value={appState.particleBaseSpeed}
                            onChange={(e) => onParticleBaseSpeedChange(Number(e.target.value))}
                            className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                        />
                    </div>

                    <div>
                        <div className={`text-[10px] ${themeClasses.textMuted} uppercase tracking-wider mb-2`}>{t.shape}</div>
                        <div className="grid grid-cols-5 gap-2">
                            {particleTypes.map(pt => (
                                <button
                                    key={pt.id}
                                    onClick={() => onParticleTypeChange(pt.id)}
                                    className={`py-1.5 rounded border transition-all flex items-center justify-center gap-1 ${
                                        appState.particleType === pt.id 
                                            ? `${themeClasses.itemActive} ${themeClasses.borderActive} ${themeClasses.textMain}` 
                                            : `${themeClasses.itemBg} border-transparent ${themeClasses.textMuted} hover:${themeClasses.itemHover}`
                                    }`}
                                    title={pt.label}
                                >
                                    <pt.icon size={14} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className={`text-[10px] ${themeClasses.textMuted} uppercase tracking-wider mb-2 flex items-center gap-2`}>
                            <MdExplore size={12}/> {t.particleDirection}
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {presetAngles.map(pa => (
                                <button
                                    key={pa.angle}
                                    onClick={() => onParticleDirectionChange(pa.angle)}
                                    className={`py-1.5 rounded border transition-all flex items-center justify-center gap-1 ${
                                        appState.particleDirection === pa.angle 
                                            ? `${themeClasses.itemActive} ${themeClasses.borderActive} ${themeClasses.textMain}` 
                                            : `${themeClasses.itemBg} border-transparent ${themeClasses.textMuted} hover:${themeClasses.itemHover}`
                                    }`}
                                    title={pa.label}
                                >
                                    <pa.icon size={14} />
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="range" min="0" max="360" step="1" value={appState.particleDirection}
                                onChange={(e) => onParticleDirectionChange(Number(e.target.value))}
                                className={`flex-1 h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                            />
                            <span className={`font-mono ${themeClasses.textMuted} text-[10px] w-8 text-right`}>{appState.particleDirection}°</span>
                        </div>
                    </div>
                    
                    <hr className={themeClasses.border} />

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className={`text-[10px] ${themeClasses.textMuted} uppercase tracking-wider`}>{t.color}</div>
                            <button 
                                onClick={() => onParticleColorChange(appState.particleColor, !appState.useThemeColorForParticles)}
                                className={`text-[10px] px-2 py-1 rounded border transition-colors ${appState.useThemeColorForParticles ? `${themeClasses.itemBg} ${themeClasses.border} ${themeClasses.textMain}` : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'}`}
                            >
                                {appState.useThemeColorForParticles ? t.matchTheme : t.custom}
                            </button>
                        </div>
                        
                        <div className={`transition-all duration-300 overflow-hidden ${appState.useThemeColorForParticles ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
                            <div className="space-y-3 pt-2">
                                {appState.particlePalettes.map((palette, pIdx) => (
                                    <div key={pIdx} className={`p-2 rounded-lg border ${themeClasses.border} ${themeClasses.itemBg} flex items-center gap-3 relative group/pal`}>
                                        <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                                            {palette.map((color, cIdx) => (
                                                <div key={cIdx} className="relative group/c">
                                                    <div className={`w-7 h-7 rounded-full overflow-hidden border ${themeClasses.border} shadow-sm hover:scale-110 transition-transform relative`}>
                                                        <input 
                                                            type="color" 
                                                            value={color}
                                                            onChange={(e) => updatePaletteColor(pIdx, cIdx, e.target.value)}
                                                            className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 opacity-0"
                                                        />
                                                        <div className="w-full h-full" style={{ backgroundColor: color }} />
                                                    </div>
                                                    {palette.length > 1 && (
                                                        <button 
                                                            onClick={() => removeColorFromPalette(pIdx, cIdx)}
                                                            className="absolute -top-1 -right-1 bg-red-500 rounded-full text-white w-3 h-3 flex items-center justify-center opacity-0 group-hover/c:opacity-100 transition-opacity z-10"
                                                        >
                                                            <MdClose size={8} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {palette.length < 3 && (
                                                <button 
                                                    onClick={() => addColorToPalette(pIdx)}
                                                    className={`w-7 h-7 rounded-full border border-dashed ${themeClasses.border} flex items-center justify-center ${themeClasses.textMuted} hover:${themeClasses.textMain} transition-colors`}
                                                    title="Add Stop"
                                                >
                                                    <MdAdd size={14} />
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="w-16 h-4 rounded-full border border-white/10 overflow-hidden shrink-0" 
                                             style={{ background: palette.length === 1 ? palette[0] : `linear-gradient(to right, ${palette.join(',')})` }} 
                                        />

                                        {appState.particlePalettes.length > 1 && (
                                            <button 
                                                onClick={() => removePalette(pIdx)}
                                                className={`p-1 rounded hover:bg-red-500/20 text-red-400 opacity-0 group-hover/pal:opacity-100 transition-opacity`}
                                                title="Delete Palette"
                                            >
                                                <MdDelete size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {appState.particlePalettes.length < 10 && (
                                    <button 
                                        onClick={addPalette}
                                        className={`w-full py-2 rounded-lg border border-dashed ${themeClasses.border} flex items-center justify-center gap-2 text-xs ${themeClasses.textMuted} hover:${themeClasses.textMain} transition-all`}
                                    >
                                        <MdAdd size={16} /> 新增配色方案 (1-10)
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticleControls;
