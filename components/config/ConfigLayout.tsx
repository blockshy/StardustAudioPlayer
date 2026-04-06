
import React from 'react';
import { MdFormatSize, MdPerson, MdTextRotateVertical, MdTextRotationNone, MdPanTool, MdTimer } from 'react-icons/md';
import { AppState, LyricEffect } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';
import LayoutDimensions from './LayoutDimensions';
import PlayerBarControls from './PlayerBarControls';
import LyricsStyling from './LyricsStyling';

interface ConfigLayoutProps {
    appState: AppState;
    onLayoutDimensionChange: (key: 'total' | 'album' | 'lyrics' | 'gap' | 'albumX' | 'albumY' | 'infoGap' | 'lyricsX' | 'lyricsY', value: number) => void;
    onPlayerBarDimensionChange: (key: 'width' | 'height' | 'blur' | 'x' | 'y', value: number) => void;
    onPlayerOpacityChange: (value: number) => void;
    onLyricLineConfigChange: (key: 'primaryIndex' | 'order', value: number | number[]) => void;
    onLyricSizeChange: (type: 'main' | 'sub', size: number) => void;
    onLyricBoldChange: (isBold: boolean) => void;
    onLyricColorChange: (key: 'active' | 'inactive' | 'stroke' | 'strokeWidth' | 'effect' | 'streamerColor', value: string | number | null | LyricEffect) => void;
    onLyricOffsetChange: (offset: number) => void;
    onLyricGapToleranceChange: (tolerance: number) => void;
    onSingerInfoConfigChange?: (key: string, value: any) => void;
    translations: any;
}

const ConfigLayout: React.FC<ConfigLayoutProps> = (props) => {
    const { appState, translations: t } = props;
    const themeClasses = getThemeClasses(appState);

    return (
        <div id="section-layout" className="space-y-4 scroll-mt-4">
            <h3 className={`text-xs font-sans font-bold ${themeClasses.textMuted} uppercase tracking-widest flex items-center gap-2`}>
                <MdFormatSize className="text-lg" /> {t.lyricsLayout}
            </h3>
            <div className={`${themeClasses.itemBg} rounded-xl p-4 space-y-4 border ${themeClasses.border}`}>
                <LayoutDimensions 
                    appState={appState} 
                    onLayoutDimensionChange={props.onLayoutDimensionChange} 
                    translations={t} 
                />
                
                <PlayerBarControls 
                    appState={appState} 
                    onPlayerBarDimensionChange={props.onPlayerBarDimensionChange} 
                    onPlayerOpacityChange={props.onPlayerOpacityChange} 
                    translations={t} 
                />

                {/* Singer Module Configuration */}
                <div className="space-y-3 pt-4 border-t border-dashed border-gray-500/30">
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className={`text-sm ${themeClasses.textSub} group-hover:${themeClasses.textMain} transition-colors font-serif flex items-center gap-2`}>
                            <MdPerson className={themeClasses.textMuted} /> {t.singerInfo}
                        </span>
                        <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                            <input 
                                type="checkbox" 
                                checked={appState.showSingerInfo}
                                onChange={(e) => props.onSingerInfoConfigChange?.('showSingerInfo', e.target.checked)}
                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-0"
                                style={{borderColor: '#4b5563'}}
                            />
                            <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${appState.showSingerInfo ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                        </div>
                    </label>

                    {appState.showSingerInfo && (
                        <div className={`${themeClasses.itemActive} rounded-lg p-3 ml-2 border-l-2 border-emerald-500/30 transition-all animate-fade-in space-y-3`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-xs ${themeClasses.textSub} font-serif`}>{t.orientation}</span>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => props.onSingerInfoConfigChange?.('singerInfoOrientation', 'vertical')}
                                        className={`p-1.5 rounded transition-all ${appState.singerInfoOrientation === 'vertical' ? `${themeClasses.itemBg} ${themeClasses.textMain}` : `${themeClasses.textMuted}`}`}
                                        title={t.vertical}
                                    >
                                        <MdTextRotateVertical size={16} />
                                    </button>
                                    <button 
                                        onClick={() => props.onSingerInfoConfigChange?.('singerInfoOrientation', 'horizontal')}
                                        className={`p-1.5 rounded transition-all ${appState.singerInfoOrientation === 'horizontal' ? `${themeClasses.itemBg} ${themeClasses.textMain}` : `${themeClasses.textMuted}`}`}
                                        title={t.horizontal}
                                    >
                                        <MdTextRotationNone size={16} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                                    <span className="flex items-center gap-1"><MdFormatSize className={themeClasses.textMuted} /> {t.size}</span>
                                    <span className={`font-mono ${themeClasses.textMuted}`}>{appState.singerInfoFontSize}px</span>
                                </div>
                                <input
                                    type="range" min="8" max="48" step="1" value={appState.singerInfoFontSize}
                                    onChange={(e) => props.onSingerInfoConfigChange?.('singerInfoFontSize', Number(e.target.value))}
                                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <div className={`flex justify-between text-[10px] ${themeClasses.textSub} mb-1`}>
                                        <span className="flex items-center gap-1"><MdPanTool className={`rotate-0 ${themeClasses.textMuted}`} /> {t.posX}</span>
                                        <span className={`font-mono ${themeClasses.textMuted}`}>{appState.singerInfoX}px</span>
                                    </div>
                                    <input 
                                        type="range" min="-300" max="300" step="1" value={appState.singerInfoX}
                                        onChange={(e) => props.onSingerInfoConfigChange?.('singerInfoX', Number(e.target.value))}
                                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                    />
                                </div>
                                <div>
                                    <div className={`flex justify-between text-[10px] ${themeClasses.textSub} mb-1`}>
                                        <span className="flex items-center gap-1"><MdPanTool className={`rotate-90 ${themeClasses.textMuted}`} /> {t.posY}</span>
                                        <span className={`font-mono ${themeClasses.textMuted}`}>{appState.singerInfoY}px</span>
                                    </div>
                                    <input 
                                        type="range" min="-500" max="500" step="1" value={appState.singerInfoY}
                                        onChange={(e) => props.onSingerInfoConfigChange?.('singerInfoY', Number(e.target.value))}
                                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Independent Offset and Tolerance for Singer Context */}
                            <div className="pt-2 mt-2 border-t border-gray-500/10 space-y-3">
                                <div>
                                    <div className={`flex justify-between text-[10px] ${themeClasses.textSub} mb-1`}>
                                        <span className="flex items-center gap-1 font-bold"><MdTimer size={12} className={themeClasses.textMuted} /> {t.sync} (歌手配置)</span>
                                        <span className={`font-mono ${themeClasses.textMuted}`}>{appState.singerLyricOffset > 0 ? '+' : ''}{appState.singerLyricOffset.toFixed(1)}s</span>
                                    </div>
                                    <input
                                        type="range" min="-5" max="5" step="0.1" value={appState.singerLyricOffset}
                                        onChange={(e) => props.onSingerInfoConfigChange?.('singerLyricOffset', Number(e.target.value))}
                                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                    />
                                </div>
                                <div>
                                    <div className={`flex justify-between text-[10px] ${themeClasses.textSub} mb-1`}>
                                        <span className="flex items-center gap-1 font-bold">{t.gapTolerance} (歌手配置)</span>
                                        <span className={`font-mono ${themeClasses.textMuted}`}>{appState.singerLyricGapTolerance}s</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="5" step="0.1" value={appState.singerLyricGapTolerance}
                                        onChange={(e) => props.onSingerInfoConfigChange?.('singerLyricGapTolerance', Number(e.target.value))}
                                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <LyricsStyling 
                    appState={appState} 
                    onLyricLineConfigChange={props.onLyricLineConfigChange}
                    onLyricSizeChange={props.onLyricSizeChange}
                    onLyricBoldChange={props.onLyricBoldChange}
                    onLyricColorChange={props.onLyricColorChange}
                    onLyricOffsetChange={props.onLyricOffsetChange}
                    onLyricGapToleranceChange={props.onLyricGapToleranceChange}
                    translations={t}
                />
            </div>
        </div>
    );
};

export default ConfigLayout;
