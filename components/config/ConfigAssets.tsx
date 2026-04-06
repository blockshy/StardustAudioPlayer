
import React from 'react';
import { MdLibraryMusic, MdMusicNote, MdImage, MdWallpaper, MdSubtitles, MdCheck, MdClose, MdRestartAlt, MdZoomIn, MdPanTool, MdPersonSearch } from 'react-icons/md';
import { AppState } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';

interface ConfigAssetsProps {
    appState: AppState;
    onFileChange: (type: 'audio' | 'cover' | 'srt' | 'background' | 'customParticle' | 'singerSrt', file: File) => void;
    onFileRemove: (type: 'audio' | 'cover' | 'srt' | 'background' | 'customParticle' | 'singerSrt') => void;
    onBackgroundConfigChange: (key: 'scale' | 'x' | 'y', value: number) => void;
    translations: any;
}

const ConfigAssets: React.FC<ConfigAssetsProps> = ({ 
    appState, onFileChange, onFileRemove, onBackgroundConfigChange, translations: t 
}) => {
    const themeClasses = getThemeClasses(appState);
    
    const assetLabels: Record<string, string> = {
        'audio': t.audioTrack,
        'cover': t.albumArt,
        'background': t.bgImage,
        'srt': t.lyricsSrt,
        'singerSrt': t.singerSrt
    };

    const handleFileChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'cover' | 'srt' | 'background' | 'customParticle' | 'singerSrt') => {
        if (e.target.files && e.target.files[0]) {
          onFileChange(type, e.target.files[0]);
        }
    };

    const resetBackgroundConfig = () => {
        onBackgroundConfigChange('scale', 1.05);
        onBackgroundConfigChange('x', 0);
        onBackgroundConfigChange('y', 0);
    };

    return (
        <div id="section-assets" className="space-y-4 scroll-mt-4">
            <h3 className={`text-xs font-sans font-bold ${themeClasses.textMuted} uppercase tracking-widest flex items-center gap-2`}>
                <MdLibraryMusic className="text-lg" /> {t.assets}
            </h3>
            
            {[
                { id: 'audio', label: t.audioTrack, icon: MdMusicNote, file: appState.audioFile, color: 'text-blue-400' },
                { id: 'cover', label: t.albumArt, icon: MdImage, file: appState.coverFile, color: 'text-purple-400' },
                { id: 'background', label: t.bgImage, icon: MdWallpaper, file: appState.backgroundImageFile, color: 'text-orange-400' },
                { id: 'srt', label: t.lyricsSrt, icon: MdSubtitles, file: appState.srtFile, color: 'text-emerald-400' },
                { id: 'singerSrt', label: t.singerSrt, icon: MdPersonSearch, file: appState.singerSrtFile, color: 'text-amber-400' }
            ].map((item) => (
                <div key={item.id} className={`group relative ${themeClasses.itemBg} ${themeClasses.itemHover} border ${themeClasses.border} hover:${themeClasses.borderActive} rounded-xl p-4 transition-all duration-300`}>
                    <label className="flex items-center gap-4 cursor-pointer w-full">
                        <div className={`p-3 rounded-lg ${themeClasses.isDarkBase ? 'bg-black/40' : 'bg-white/40'} ${item.color} shadow-inner`}>
                            <item.icon size={24} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className={`font-serif text-sm ${themeClasses.textMain} truncate`}>
                                {item.file ? item.file.name : `${t.noSelected} ${assetLabels[item.id] || item.label}`}
                            </div>
                            <div className={`text-[10px] ${themeClasses.textMuted} font-sans uppercase tracking-wider mt-1`}>
                                {item.file ? t.ready : t.selectFile}
                            </div>
                        </div>
                        {item.file && <MdCheck className="text-emerald-400 opacity-50" size={20} />}
                        <input
                            type="file"
                            accept={item.id === 'audio' ? "audio/*" : item.id === 'srt' || item.id === 'singerSrt' ? ".srt" : "image/*"}
                            className="hidden"
                            onChange={(e) => handleFileChangeWrapper(e, item.id as any)}
                            onClick={(e) => (e.currentTarget.value = '')} 
                        />
                    </label>

                    {item.file && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onFileRemove(item.id as any);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors z-10"
                            title="Remove file"
                        >
                            <MdClose size={16} />
                        </button>
                    )}
                    
                    {item.id === 'background' && appState.backgroundImageUrl && (
                        <div className={`mt-3 pt-3 border-t ${themeClasses.border} animate-fade-in space-y-4`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-[10px] font-bold ${themeClasses.textMuted} uppercase tracking-wider`}>{t.bgPos}</span>
                                <button 
                                    onClick={resetBackgroundConfig}
                                    className={`text-[10px] flex items-center gap-1 hover:${themeClasses.textMain} ${themeClasses.textMuted} transition-colors`}
                                    title="Reset Position"
                                >
                                    <MdRestartAlt /> {t.reset}
                                </button>
                            </div>

                            <div>
                                <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                                    <span className="flex items-center gap-1"><MdZoomIn className={themeClasses.textMuted} /> {t.scale}</span>
                                    <span className={`font-mono ${themeClasses.textMuted}`}>{Math.round(appState.backgroundImageScale * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="3" 
                                    step="0.05" 
                                    value={appState.backgroundImageScale}
                                    onChange={(e) => onBackgroundConfigChange('scale', Number(e.target.value))}
                                    className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                                        <span className="flex items-center gap-1"><MdPanTool className={`rotate-0 ${themeClasses.textMuted}`} /> {t.posX}</span>
                                        <span className={`font-mono ${themeClasses.textMuted}`}>{appState.backgroundImageX}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="-50" 
                                        max="50" 
                                        step="1" 
                                        value={appState.backgroundImageX}
                                        onChange={(e) => onBackgroundConfigChange('x', Number(e.target.value))}
                                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                    />
                                </div>
                                <div>
                                    <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                                        <span className="flex items-center gap-1"><MdPanTool className={`rotate-90 ${themeClasses.textMuted}`} /> {t.posY}</span>
                                        <span className={`font-mono ${themeClasses.textMuted}`}>{appState.backgroundImageY}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="-50" 
                                        max="50" 
                                        step="1" 
                                        value={appState.backgroundImageY}
                                        onChange={(e) => onBackgroundConfigChange('y', Number(e.target.value))}
                                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ConfigAssets;
