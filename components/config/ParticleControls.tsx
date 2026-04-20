
import React from 'react';
import { MdSpeed, MdGraphicEq, MdFormatSize, MdExplore, MdArrowUpward, MdArrowDownward, MdArrowBack, MdArrowForward, MdClose, MdAdd, MdDelete } from 'react-icons/md';
import { AppState, ParticleType, ParticleDirection } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';

interface ParticleControlsProps {
    appState: AppState;
    onVisualizerChange: (key: 'enableWaves' | 'enableParticles' | 'enableParticleClimaxDensityBoost', value: boolean) => void;
    onParticleSizeChange: (size: number) => void;
    onParticleBaseSpeedChange: (speed: number) => void;
    onParticleDensityChange: (density: number) => void;
    onClimaxDensitySensitivityChange: (sensitivity: number) => void;
    onClimaxDensityBoostStrengthChange: (strength: number) => void;
    onParticleTypeChange: (type: ParticleType) => void;
    onParticleDirectionChange: (direction: ParticleDirection) => void;
    onParticleColorChange: (color: string, useTheme: boolean) => void;
    onParticlePalettesChange: (palettes: string[][], useTheme: boolean) => void;
    translations: any;
}

const ParticleControls: React.FC<ParticleControlsProps> = ({ 
    appState, onVisualizerChange, onParticleSizeChange, 
    onParticleBaseSpeedChange, onParticleDensityChange, onClimaxDensitySensitivityChange, onClimaxDensityBoostStrengthChange, onParticleTypeChange, onParticleDirectionChange,
    onParticleColorChange, onParticlePalettesChange, translations: t 
}) => {
    const themeClasses = getThemeClasses(appState);

    const ParticleShapePreview: React.FC<{ type: ParticleType; active: boolean }> = ({ type, active }) => {
        const stroke = 'currentColor';
        const softFill = active ? 'currentColor' : 'currentColor';

        if (type === 'circle') {
            return (
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                    <circle cx="12" cy="12" r="5.5" fill={softFill} fillOpacity={active ? 0.95 : 0.18} stroke={stroke} strokeWidth="1.4" />
                </svg>
            );
        }

        if (type === 'snowflake') {
            return (
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true" fill="none" stroke={stroke} strokeWidth="1.45" strokeLinecap="round">
                    <path d="M12 4v16M5.4 8l13.2 8M18.6 8L5.4 16" />
                    <path d="M12 4l-1.8 2.1M12 4l1.8 2.1M12 20l-1.8-2.1M12 20l1.8-2.1" />
                    <path d="M5.4 8l2.7.2M5.4 8l1.1 2.4M18.6 8l-2.7.2M18.6 8l-1.1 2.4" />
                    <path d="M5.4 16l2.7-.2M5.4 16l1.1-2.4M18.6 16l-2.7-.2M18.6 16l-1.1-2.4" />
                </svg>
            );
        }

        if (type === 'star') {
            return (
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                    <path d="M12 3.7l2.24 4.65 5.14.75-3.72 3.63.88 5.13L12 15.5l-4.54 2.38.88-5.13L4.62 9.1l5.14-.75L12 3.7z" fill={softFill} fillOpacity={active ? 0.94 : 0.16} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
            );
        }

        if (type === 'sakura') {
            return (
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                    <path d="M12 5.2c1.3 0 2.5 1 2.8 2.3 1-.9 2.4-.9 3.3-.1 1 .8 1.2 2.3.6 3.5 1.3.2 2.3 1.2 2.3 2.5 0 1.4-1.1 2.5-2.5 2.5-.4 0-.8-.1-1.2-.3-.1 1.4-1.3 2.5-2.7 2.5-1 0-1.9-.6-2.4-1.4-.5.9-1.4 1.4-2.4 1.4-1.4 0-2.6-1.1-2.7-2.5-.4.2-.8.3-1.2.3-1.4 0-2.5-1.1-2.5-2.5 0-1.3 1-2.3 2.3-2.5-.6-1.2-.3-2.7.6-3.5 1-.8 2.4-.8 3.3.1.3-1.3 1.5-2.3 2.8-2.3z" fill={softFill} fillOpacity={active ? 0.88 : 0.12} stroke={stroke} strokeWidth="1.1" />
                    <circle cx="12" cy="12.4" r="1.2" fill={stroke} fillOpacity={active ? 1 : 0.35} />
                </svg>
            );
        }

        if (type === 'lily') {
            return (
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                    <path d="M12 4.2c1.6 0 2 4.1 0 5.4-2-1.3-1.6-5.4 0-5.4zm-5 2.7c1.2-.5 3.4 2.9 2.5 4.8-2.2.5-4.2-2.2-2.5-4.8zm10 0c1.7 2.6-.3 5.3-2.5 4.8-.9-1.9 1.3-5.3 2.5-4.8zm-8.3 6.1c1.7-.2 3.1 2.6 2.4 4.4-2 .6-4.1-1.2-4-3.3.3-.6.8-.9 1.6-1.1zm6.6 0c.8.1 1.3.5 1.6 1.1.1 2.1-2 3.9-4 3.3-.7-1.8.7-4.6 2.4-4.4z" fill={softFill} fillOpacity={active ? 0.82 : 0.1} stroke={stroke} strokeWidth="1.05" />
                    <path d="M12 12.4v5.1M10.4 12.8l1.6 2.2 1.6-2.2" fill="none" stroke={stroke} strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        }

        if (type === 'dandelion') {
            return (
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true" fill="none" stroke={stroke} strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8.3v7.2" />
                    <path d="M12 8.3L8.7 4.8M12 8.3L10.3 4M12 8.3V3.4M12 8.3l1.7-4.3M12 8.3l3.3-3.5" />
                    <circle cx="8.2" cy="4.3" r="0.72" fill={softFill} fillOpacity={active ? 0.92 : 0.16} stroke="none" />
                    <circle cx="10.1" cy="3.5" r="0.68" fill={softFill} fillOpacity={active ? 0.92 : 0.16} stroke="none" />
                    <circle cx="12" cy="3" r="0.68" fill={softFill} fillOpacity={active ? 0.92 : 0.16} stroke="none" />
                    <circle cx="13.9" cy="3.5" r="0.68" fill={softFill} fillOpacity={active ? 0.92 : 0.16} stroke="none" />
                    <circle cx="15.8" cy="4.3" r="0.72" fill={softFill} fillOpacity={active ? 0.92 : 0.16} stroke="none" />
                    <ellipse cx="12" cy="17.8" rx="1" ry="1.95" fill={softFill} fillOpacity={active ? 0.92 : 0.16} stroke="none" />
                </svg>
            );
        }

        if (type === 'peach') {
            return (
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                    <path d="M12 5.1c1.7 0 2.6 1.4 2.7 2.7 1.2-.8 2.8-.8 3.8.2 1 .9 1.2 2.4.5 3.7 1.2.2 2.1 1.2 2.1 2.5 0 1.7-1.3 2.9-3 2.9-.6 0-1.1-.2-1.6-.4-.1 1.6-1.3 2.8-2.8 2.8-.8 0-1.5-.3-1.9-.8-.4.5-1.1.8-1.9.8-1.5 0-2.7-1.2-2.8-2.8-.5.3-1 .4-1.6.4-1.7 0-3-1.2-3-2.9 0-1.3.9-2.3 2.1-2.5-.7-1.3-.5-2.8.5-3.7 1-.9 2.6-1 3.8-.2.1-1.4 1-2.7 2.7-2.7z" fill={softFill} fillOpacity={active ? 0.9 : 0.12} stroke={stroke} strokeWidth="1.08" />
                    <circle cx="12" cy="12.2" r="1" fill={stroke} fillOpacity={active ? 1 : 0.35} />
                </svg>
            );
        }

        if (type === 'chrysanthemum') {
            const petals = Array.from({ length: 12 }, (_, idx) => idx);
            return (
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                    {petals.map((petal) => (
                        <path
                            key={petal}
                            d="M12 12c.85-1.55.95-3.65 0-6.15-.95 2.5-.85 4.6 0 6.15z"
                            transform={`rotate(${petal * 30} 12 12)`}
                            fill={softFill}
                            fillOpacity={active ? 0.84 : 0.12}
                            stroke={stroke}
                            strokeWidth="0.52"
                            strokeLinejoin="round"
                        />
                    ))}
                    <circle cx="12" cy="12" r="2.05" fill={stroke} fillOpacity={active ? 0.9 : 0.2} />
                </svg>
            );
        }

        if (type === 'begonia') {
            return (
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                    <path d="M12 6.2c1.8 0 3 1.2 3 3.1 0 .6-.1 1-.4 1.5 1.7-.2 3.3.7 3.8 2.4-.5 2-2.2 3.2-4.2 2.9-.6-.1-1.1-.3-1.5-.5-.5 1.8-1.9 3-3.8 3-2 0-3.5-1.4-3.7-3.4.1-1.9 1.4-3.3 3.2-3.6-.3-.4-.5-.9-.5-1.4 0-1.9 1.5-4 4.1-4z" fill={softFill} fillOpacity={active ? 0.88 : 0.12} stroke={stroke} strokeWidth="1.08" />
                    <circle cx="12.1" cy="12.1" r="1.05" fill={stroke} fillOpacity={active ? 1 : 0.35} />
                </svg>
            );
        }

        return (
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path d="M12 5.1c1.8 0 2.9 1.6 2.9 3 0 .5-.1.9-.4 1.4 1.6.2 2.8 1.4 2.8 3.1 0 2-1.6 3.3-3.5 3.3-.8 0-1.4-.2-1.8-.4-.4.2-1 .4-1.8.4-1.9 0-3.5-1.3-3.5-3.3 0-1.7 1.2-2.9 2.8-3.1-.2-.5-.4-.9-.4-1.4 0-1.4 1.1-3 2.9-3z" fill={softFill} fillOpacity={active ? 0.86 : 0.12} stroke={stroke} strokeWidth="1.05" />
                <path d="M12 8.6c1.3.5 2.1 1.6 2.1 2.8 0 1.4-.9 2.4-2.1 3-1.2-.6-2.1-1.6-2.1-3 0-1.2.8-2.3 2.1-2.8z" fill="none" stroke={stroke} strokeWidth="1.05" />
            </svg>
        );
    };
    
    const particleTypes: { id: ParticleType; label: string }[] = [
        { id: 'circle', label: t.pTypeDot },
        { id: 'sakura', label: t.pTypeSakura },
        { id: 'lily', label: t.pTypeLily },
        { id: 'rose', label: t.pTypeRose },
        { id: 'snowflake', label: t.pTypeSnow },
        { id: 'star', label: t.pTypeStar },
        { id: 'dandelion', label: t.pTypeDandelion },
        { id: 'peach', label: t.pTypePeach },
        { id: 'chrysanthemum', label: t.pTypeChrysanthemum },
        { id: 'begonia', label: t.pTypeBegonia },
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
                            <MdSpeed className={themeClasses.textMuted} /> {t.climaxDensityBoost}
                        </span>
                        <div className="relative inline-block w-8 h-4 align-middle select-none transition duration-200 ease-in">
                            <input 
                                type="checkbox" 
                                checked={appState.enableParticleClimaxDensityBoost}
                                onChange={(e) => onVisualizerChange('enableParticleClimaxDensityBoost', e.target.checked)}
                                className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-0"
                                style={{borderColor: '#4b5563'}}
                            />
                            <div className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer transition-colors duration-200 ${appState.enableParticleClimaxDensityBoost ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                        </div>
                    </label>

                    {appState.enableParticleClimaxDensityBoost && (
                        <>
                            <div>
                                <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                                    <span className="flex items-center gap-1"><MdGraphicEq size={14} className="opacity-70"/> {t.climaxSensitivity}</span>
                                    <span className={`font-mono ${themeClasses.textMuted}`}>{appState.climaxDensitySensitivity.toFixed(1)}x</span>
                                </div>
                                <input
                                    type="range" min="0.3" max="4.5" step="0.1" value={appState.climaxDensitySensitivity}
                                    onChange={(e) => onClimaxDensitySensitivityChange(Number(e.target.value))}
                                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                />
                            </div>
                            <div>
                                <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                                    <span className="flex items-center gap-1"><MdSpeed size={14} className="opacity-70"/> {t.climaxBoostStrength}</span>
                                    <span className={`font-mono ${themeClasses.textMuted}`}>{appState.climaxDensityBoostStrength.toFixed(1)}x</span>
                                </div>
                                <input
                                    type="range" min="0.5" max="3.0" step="0.1" value={appState.climaxDensityBoostStrength}
                                    onChange={(e) => onClimaxDensityBoostStrengthChange(Number(e.target.value))}
                                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                            <span className="flex items-center gap-1"><MdFormatSize size={14} className="opacity-70"/> {t.size}</span>
                            <span className={`font-mono ${themeClasses.textMuted}`}>{appState.particleSize.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range" min="0.2" max="8.0" step="0.1" value={appState.particleSize}
                            onChange={(e) => onParticleSizeChange(Number(e.target.value))}
                            className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                        />
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
                        <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                            <span className="font-serif flex items-center gap-2"><MdGraphicEq size={14} className="opacity-70"/> {t.baseParticleDensity}</span>
                            <span className={`font-mono ${themeClasses.textMuted}`}>{appState.baseParticleDensity.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range" min="0.2" max="2.5" step="0.1" value={appState.baseParticleDensity}
                            onChange={(e) => onParticleDensityChange(Number(e.target.value))}
                            className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                        />
                    </div>

                    <div>
                        <div className={`text-[10px] ${themeClasses.textMuted} uppercase tracking-wider mb-2`}>{t.shape}</div>
                        <div className="grid grid-cols-3 gap-2">
                            {particleTypes.map(pt => (
                                <button
                                    key={pt.id}
                                    onClick={() => onParticleTypeChange(pt.id)}
                                    className={`py-2 rounded border transition-all flex flex-col items-center justify-center gap-1 ${
                                        appState.particleType === pt.id 
                                            ? `${themeClasses.itemActive} ${themeClasses.borderActive} ${themeClasses.textMain}` 
                                            : `${themeClasses.itemBg} border-transparent ${themeClasses.textMuted} hover:${themeClasses.itemHover}`
                                    }`}
                                    title={pt.label}
                                >
                                    <ParticleShapePreview type={pt.id} active={appState.particleType === pt.id} />
                                    <span className="text-[10px] leading-none">{pt.label}</span>
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
