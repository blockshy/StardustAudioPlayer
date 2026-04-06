
import React from 'react';
import { MdColorLens, MdDarkMode, MdLightMode, MdAutoAwesome, MdAdd, MdRemove, MdAutoFixHigh, MdCheck, MdPalette, MdContrast, MdLayers, MdDelete, MdInfoOutline } from 'react-icons/md';
import { AppState, ThemeMode, SingerThemeGroup } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';
import { extractDominantColor } from '../../utils/colorUtils';

interface ConfigAppearanceProps {
    appState: AppState;
    onThemeModeChange: (mode: ThemeMode) => void;
    onColorfulColorsChange: (colors: string[]) => void;
    onThemeChange: (color: string) => void;
    onColorfulBaseChange?: (base: 'light' | 'dark') => void;
    onSingerThemeGroupsChange?: (groups: SingerThemeGroup[]) => void;
    onForceOverrideChange?: (value: boolean) => void;
    translations: any;
}

const ConfigAppearance: React.FC<ConfigAppearanceProps> = ({ 
    appState, onThemeModeChange, onColorfulColorsChange, onThemeChange, onColorfulBaseChange, onSingerThemeGroupsChange, onForceOverrideChange, translations: t 
}) => {
    const themeClasses = getThemeClasses(appState);
    const colors = ['#d4b996', '#E11D48', '#0EA5E9', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];
    const isCustomColor = !colors.some(c => c.toLowerCase() === appState.themeColor.toLowerCase());

    const handleAutoColor = async () => {
        if (appState.coverUrl) {
            try {
                const color = await extractDominantColor(appState.coverUrl);
                onThemeChange(color);
            } catch (error) {
                console.error("Failed to extract color from cover:", error);
            }
        }
    };

    const addColorfulColor = () => {
        if (appState.colorfulColors.length < 5) {
            onColorfulColorsChange([...appState.colorfulColors, '#ffffff']);
        }
    };

    const removeColorfulColor = (index: number) => {
        if (appState.colorfulColors.length > 1) {
            const newColors = [...appState.colorfulColors];
            newColors.splice(index, 1);
            onColorfulColorsChange(newColors);
        }
    };

    const updateColorfulColor = (index: number, color: string) => {
        const newColors = [...appState.colorfulColors];
        newColors[index] = color;
        onColorfulColorsChange(newColors);
    };

    // Singer Theme Group Handlers
    const addSingerThemeGroup = () => {
        if (onSingerThemeGroupsChange && appState.singerThemeGroups.length < 5) {
            onSingerThemeGroupsChange([...appState.singerThemeGroups, { typeId: appState.singerThemeGroups.length + 1, colors: [appState.themeColor] }]);
        }
    };

    const removeSingerThemeGroup = (index: number) => {
        if (onSingerThemeGroupsChange) {
            const newGroups = [...appState.singerThemeGroups];
            newGroups.splice(index, 1);
            onSingerThemeGroupsChange(newGroups);
        }
    };

    const updateSingerThemeGroupId = (index: number, id: number) => {
        if (onSingerThemeGroupsChange) {
            const newGroups = [...appState.singerThemeGroups];
            newGroups[index].typeId = id;
            onSingerThemeGroupsChange(newGroups);
        }
    };

    const addColorToSingerGroup = (gIdx: number) => {
        if (onSingerThemeGroupsChange && appState.singerThemeGroups[gIdx].colors.length < 5) {
            const newGroups = [...appState.singerThemeGroups];
            newGroups[gIdx].colors.push('#ffffff');
            onSingerThemeGroupsChange(newGroups);
        }
    };

    const removeColorFromSingerGroup = (gIdx: number, cIdx: number) => {
        if (onSingerThemeGroupsChange && appState.singerThemeGroups[gIdx].colors.length > 1) {
            const newGroups = [...appState.singerThemeGroups];
            newGroups[gIdx].colors.splice(cIdx, 1);
            onSingerThemeGroupsChange(newGroups);
        }
    };

    const updateSingerGroupColor = (gIdx: number, cIdx: number, color: string) => {
        if (onSingerThemeGroupsChange) {
            const newGroups = [...appState.singerThemeGroups];
            newGroups[gIdx].colors[cIdx] = color;
            onSingerThemeGroupsChange(newGroups);
        }
    };

    return (
        <div id="section-appearance" className="space-y-4 scroll-mt-4">
            <h3 className={`text-xs font-sans font-bold ${themeClasses.textMuted} uppercase tracking-widest flex items-center gap-2`}>
                <MdColorLens className="text-lg" /> {t.appearance}
            </h3>
            
            <div className={`flex ${themeClasses.itemBg} p-1 rounded-lg mb-4`}>
                {[
                    { id: 'dark', label: t.modeDark, icon: MdDarkMode },
                    { id: 'light', label: t.modeLight, icon: MdLightMode },
                    { id: 'colorful', label: t.modeColorful, icon: MdAutoAwesome },
                ].map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => onThemeModeChange(mode.id as ThemeMode)}
                        className={`flex-1 py-2 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                            appState.themeMode === mode.id
                            ? `${themeClasses.isDarkBase ? 'bg-white/20' : 'bg-white shadow-sm'} ${themeClasses.textMain}`
                            : `${themeClasses.textMuted} hover:${themeClasses.textMain} hover:${themeClasses.isDarkBase ? 'bg-white/5' : 'bg-black/5'}`
                        }`}
                    >
                        <mode.icon size={14} />
                        {mode.label}
                    </button>
                ))}
            </div>

            {appState.themeMode === 'colorful' && (
                <div className="space-y-4 animate-fade-in">
                    <div className={`${themeClasses.itemBg} rounded-xl p-4 border ${themeClasses.border}`}>
                        {onColorfulBaseChange && (
                            <div className="flex items-center justify-between mb-4 border-b border-gray-500/20 pb-4">
                                <span className={`text-xs ${themeClasses.textSub} font-serif flex items-center gap-2`}>
                                    <MdContrast /> {t.colorfulBase}
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onColorfulBaseChange('light')}
                                        className={`px-3 py-1 text-[10px] rounded transition-all border ${appState.colorfulThemeBase === 'light' ? 'bg-white text-black border-white' : `${themeClasses.textMuted} border-transparent hover:border-gray-500`}`}
                                    >
                                        {t.baseLight}
                                    </button>
                                    <button 
                                        onClick={() => onColorfulBaseChange('dark')}
                                        className={`px-3 py-1 text-[10px] rounded transition-all border ${appState.colorfulThemeBase === 'dark' ? 'bg-gray-900 text-white border-gray-900' : `${themeClasses.textMuted} border-transparent hover:border-gray-500`}`}
                                    >
                                        {t.baseDark}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-3">
                            <span className={`text-xs ${themeClasses.textSub} font-serif`}>{t.paletteColors}</span>
                            {appState.colorfulColors.length < 5 && (
                                <button onClick={addColorfulColor} className={`text-[10px] ${themeClasses.itemActive} hover:${themeClasses.itemHover} ${themeClasses.textMain} px-2 py-1 rounded flex items-center gap-1`}>
                                    <MdAdd size={12} /> {t.add}
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {appState.colorfulColors.map((color, idx) => (
                                <div key={idx} className="relative group/color">
                                    <div className={`w-8 h-8 rounded-full overflow-hidden border ${themeClasses.border} relative shadow-sm hover:scale-105 transition-transform`}>
                                        <input 
                                            type="color" 
                                            value={color}
                                            onChange={(e) => updateColorfulColor(idx, e.target.value)}
                                            className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0"
                                        />
                                    </div>
                                    {appState.colorfulColors.length > 1 && (
                                    <button onClick={() => removeColorfulColor(idx)} className="absolute -top-1 -right-1 bg-red-500 rounded-full text-white w-4 h-4 flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-opacity shadow-sm z-10">
                                        <MdRemove size={10} />
                                    </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Singer Theme Groups Mapping */}
                    <div className={`${themeClasses.itemBg} rounded-xl p-4 border ${themeClasses.border}`}>
                        <div className="flex justify-between items-center mb-3">
                            <span className={`text-xs ${themeClasses.textSub} font-serif flex items-center gap-2`}><MdLayers size={14} /> {t.dynamicTheming}</span>
                            {appState.singerThemeGroups.length < 5 && (
                                <button onClick={addSingerThemeGroup} className={`text-[10px] ${themeClasses.itemActive} hover:${themeClasses.itemHover} ${themeClasses.textMain} px-2 py-1 rounded flex items-center gap-1`}>
                                    <MdAdd size={12} /> {t.add}
                                </button>
                            )}
                        </div>

                        {/* Force Override Toggle */}
                        <div className={`mb-4 p-3 rounded-lg border border-dashed ${themeClasses.border} flex items-center justify-between`}>
                            <div className="flex flex-col">
                                <span className={`text-[11px] ${themeClasses.textSub} font-bold`}>{t.forceOverride || "Force Override"}</span>
                                <span className={`text-[9px] ${themeClasses.textVeryMuted}`}>{t.forceOverrideDesc || "Override components colors"}</span>
                            </div>
                            <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                                <input 
                                    type="checkbox" 
                                    checked={appState.forceOverrideSingerTheme}
                                    onChange={(e) => onForceOverrideChange?.(e.target.checked)}
                                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-0"
                                    style={{borderColor: '#4b5563'}}
                                />
                                <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${appState.forceOverrideSingerTheme ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            {appState.singerThemeGroups.map((group, gIdx) => (
                                <div key={gIdx} className={`p-3 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} space-y-3 group/grp`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] ${themeClasses.textMuted} uppercase`}>{t.singerType}</span>
                                            <input 
                                                type="number"
                                                value={group.typeId}
                                                onChange={(e) => updateSingerThemeGroupId(gIdx, parseInt(e.target.value) || 0)}
                                                className={`w-12 py-1 px-2 rounded text-xs font-mono border ${themeClasses.border} ${themeClasses.itemBg} ${themeClasses.textMain} focus:outline-none focus:border-opacity-50`}
                                            />
                                        </div>
                                        <button onClick={() => removeSingerThemeGroup(gIdx)} className="opacity-0 group-hover/grp:opacity-100 text-red-500 transition-opacity p-1 hover:bg-red-500/10 rounded">
                                            <MdDelete size={14} />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`text-[10px] ${themeClasses.textMuted} uppercase mr-1`}>{t.tempColors}</span>
                                        {group.colors.map((color, cIdx) => (
                                            <div key={cIdx} className="relative group/c">
                                                <div className={`w-6 h-6 rounded-full overflow-hidden border ${themeClasses.border} relative shadow-sm`}>
                                                    <input 
                                                        type="color" 
                                                        value={color}
                                                        onChange={(e) => updateSingerGroupColor(gIdx, cIdx, e.target.value)}
                                                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0"
                                                    />
                                                </div>
                                                {group.colors.length > 1 && (
                                                    <button onClick={() => removeColorFromSingerGroup(gIdx, cIdx)} className="absolute -top-1 -right-1 bg-red-400 text-white rounded-full w-3 h-3 flex items-center justify-center opacity-0 group-hover/c:opacity-100 transition-opacity">
                                                        <MdRemove size={8} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {group.colors.length < 5 && (
                                            <button onClick={() => addColorToSingerGroup(gIdx)} className={`p-1 rounded ${themeClasses.itemBg} ${themeClasses.textMuted} hover:${themeClasses.textMain} transition-colors`}>
                                                <MdAdd size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-3 flex-wrap items-center">
                <button
                onClick={handleAutoColor}
                disabled={!appState.coverUrl}
                className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                    !appState.coverUrl 
                        ? `${themeClasses.border} ${themeClasses.itemBg} ${themeClasses.textMuted} cursor-not-allowed` 
                        : `${themeClasses.borderActive} ${themeClasses.itemActive} ${themeClasses.textMain} hover:scale-105 active:scale-95`
                }`}
                title={appState.coverUrl ? t.extractColor : t.uploadCoverFirst}
                >
                <MdAutoFixHigh size={18} />
                </button>
                
                <div className={`w-px h-6 ${themeClasses.isDarkBase ? 'bg-white/10' : 'bg-black/10'} mx-1`}></div>

                {colors.map(color => (
                    <button
                        key={color}
                        onClick={() => onThemeChange(color)}
                        className={`relative w-10 h-10 rounded-full transition-all duration-300 shadow-sm ${appState.themeColor.toLowerCase() === color.toLowerCase() ? 'scale-110 ring-2 ring-offset-2 ring-offset-black/50 ring-white/50' : 'hover:scale-105 border border-transparent'}`}
                        style={{ backgroundColor: color }}
                    >
                    {appState.themeColor.toLowerCase() === color.toLowerCase() && <MdCheck className="absolute inset-0 m-auto text-white drop-shadow-md" />}
                    </button>
                ))}
                
                <div className={`relative w-10 h-10 rounded-full overflow-hidden transition-all duration-300 flex items-center justify-center cursor-pointer group shadow-sm ${
                    isCustomColor 
                    ? 'scale-110 ring-2 ring-offset-2 ring-offset-black/50 ring-white/50' 
                    : `hover:scale-105 border ${themeClasses.border}`
                }`}
                style={{ 
                    background: isCustomColor 
                        ? appState.themeColor 
                        : 'conic-gradient(from 180deg, #ef4444, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ef4444)'
                }}
                >
                <input 
                    type="color" 
                    value={appState.themeColor}
                    onChange={(e) => onThemeChange(e.target.value)}
                    className="absolute inset-0 w-[200%] h-[200%] -top-[50%] -left-[50%] cursor-pointer opacity-0 z-20"
                    title={t.customColor}
                />
                {isCustomColor ? (
                    <MdCheck className="text-white drop-shadow-md relative z-10 pointer-events-none" />
                ) : (
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center pointer-events-none">
                        <MdPalette className="text-white drop-shadow-md" size={18} />
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default ConfigAppearance;
