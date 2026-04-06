
import React from 'react';
import { MdSpaceDashboard, MdPanTool, MdHeight } from 'react-icons/md';
import { AppState } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';

interface LayoutDimensionsProps {
    appState: AppState;
    onLayoutDimensionChange: (key: 'total' | 'album' | 'lyrics' | 'gap' | 'albumX' | 'albumY' | 'infoGap' | 'lyricsX' | 'lyricsY', value: number) => void;
    translations: any;
}

const LayoutDimensions: React.FC<LayoutDimensionsProps> = ({ appState, onLayoutDimensionChange, translations: t }) => {
    const themeClasses = getThemeClasses(appState);

    return (
        <div className="space-y-3">
            <div className={`text-xs ${themeClasses.textMuted} font-sans uppercase flex items-center gap-2 mb-2`}>
                <MdSpaceDashboard /> {t.layoutDims}
            </div>
            
            <div>
                <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                    <span className="font-serif">{t.containerWidth}</span>
                    <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{appState.contentMaxWidth}%</span>
                </div>
                <input
                    type="range"
                    min="30"
                    max="100"
                    step="1"
                    value={appState.contentMaxWidth}
                    onChange={(e) => onLayoutDimensionChange('total', Number(e.target.value))}
                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                />
            </div>

            <div className="space-y-2">
                <div className={`flex justify-between text-sm ${themeClasses.textSub}`}>
                    <span className="font-serif">{t.albumColWidth}</span>
                    <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{appState.albumColumnWidth}%</span>
                </div>
                <input
                    type="range"
                    min="10"
                    max="90"
                    step="1"
                    value={appState.albumColumnWidth}
                    onChange={(e) => onLayoutDimensionChange('album', Number(e.target.value))}
                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                />
                
                <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                        <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                        <span className="flex items-center gap-1"><MdPanTool className={`rotate-0 ${themeClasses.textMuted}`} /> {t.posX}</span>
                        <span className={`font-mono ${themeClasses.textMuted}`}>{appState.albumColumnX}%</span>
                        </div>
                        <input 
                        type="range" 
                        min="-100" 
                        max="100" 
                        step="1" 
                        value={appState.albumColumnX}
                        onChange={(e) => onLayoutDimensionChange('albumX', Number(e.target.value))}
                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                        />
                    </div>
                    <div>
                        <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                        <span className="flex items-center gap-1"><MdPanTool className={`rotate-90 ${themeClasses.textMuted}`} /> {t.posY}</span>
                        <span className={`font-mono ${themeClasses.textMuted}`}>{appState.albumColumnY}%</span>
                        </div>
                        <input 
                        type="range" 
                        min="-100" 
                        max="100" 
                        step="1" 
                        value={appState.albumColumnY}
                        onChange={(e) => onLayoutDimensionChange('albumY', Number(e.target.value))}
                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                        />
                    </div>
                </div>

                <div>
                    <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                        <span className="flex items-center gap-1"><MdHeight className={themeClasses.textMuted} /> {t.infoGap}</span>
                        <span className={`font-mono ${themeClasses.textMuted}`}>{appState.albumInfoGap}px</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="150" 
                        step="5" 
                        value={appState.albumInfoGap}
                        onChange={(e) => onLayoutDimensionChange('infoGap', Number(e.target.value))}
                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                    />
                </div>
            </div>

            <div>
                <div className={`flex justify-between text-sm ${themeClasses.textSub} mb-2`}>
                    <span className="font-serif">{t.gap}</span>
                    <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{appState.columnGapWidth}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={appState.columnGapWidth}
                    onChange={(e) => onLayoutDimensionChange('gap', Number(e.target.value))}
                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                />
            </div>

            <div className="space-y-2">
                <div className={`flex justify-between text-sm ${themeClasses.textSub}`}>
                    <span className="font-serif">{t.lyricsColWidth}</span>
                    <span className={`font-mono ${themeClasses.textMuted} text-xs`}>{appState.lyricsColumnWidth}%</span>
                </div>
                <input
                    type="range"
                    min="10"
                    max="90"
                    step="1"
                    value={appState.lyricsColumnWidth}
                    onChange={(e) => onLayoutDimensionChange('lyrics', Number(e.target.value))}
                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                />

                <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                        <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                        <span className="flex items-center gap-1"><MdPanTool className={`rotate-0 ${themeClasses.textMuted}`} /> {t.posX}</span>
                        <span className={`font-mono ${themeClasses.textMuted}`}>{appState.lyricsColumnX}%</span>
                        </div>
                        <input 
                        type="range" 
                        min="-100" 
                        max="100" 
                        step="1" 
                        value={appState.lyricsColumnX}
                        onChange={(e) => onLayoutDimensionChange('lyricsX', Number(e.target.value))}
                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                        />
                    </div>
                    <div>
                        <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                        <span className="flex items-center gap-1"><MdPanTool className={`rotate-90 ${themeClasses.textMuted}`} /> {t.posY}</span>
                        <span className={`font-mono ${themeClasses.textMuted}`}>{appState.lyricsColumnY}%</span>
                        </div>
                        <input 
                        type="range" 
                        min="-100" 
                        max="100" 
                        step="1" 
                        value={appState.lyricsColumnY}
                        onChange={(e) => onLayoutDimensionChange('lyricsY', Number(e.target.value))}
                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LayoutDimensions;
