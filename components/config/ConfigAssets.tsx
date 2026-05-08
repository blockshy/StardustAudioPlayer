
import React, { useState } from 'react';
import { MdLibraryMusic, MdMusicNote, MdImage, MdWallpaper, MdSubtitles, MdCheck, MdClose, MdRestartAlt, MdZoomIn, MdPanTool, MdPersonSearch, MdDeleteSweep, MdStorage } from 'react-icons/md';
import { AppState, AssetInputType } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';
import { PersistedAssetInfo } from '../../utils/persistedAssets';

type VisibleAssetInputType = Exclude<AssetInputType, 'customParticle'>;

interface ConfigAssetsProps {
    appState: AppState;
    isRestoringAssets: boolean;
    persistedAssetInfo: PersistedAssetInfo[];
    onFileChange: (type: AssetInputType, file: File) => void | Promise<void>;
    onFileRemove: (type: AssetInputType) => void;
    onClearPersistedAssets: () => void;
    onCoverConfigChange: (key: 'x' | 'y', value: number) => void;
    onBackgroundConfigChange: (key: 'scale' | 'x' | 'y', value: number) => void;
    translations: any;
}

const ConfigAssets: React.FC<ConfigAssetsProps> = ({ 
    appState, isRestoringAssets, persistedAssetInfo, onFileChange, onFileRemove, onClearPersistedAssets, onCoverConfigChange, onBackgroundConfigChange, translations: t 
}) => {
    const themeClasses = getThemeClasses(appState);
    const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
    
    const assetLabels: Record<AssetInputType, string> = {
        'audio': t.audioTrack,
        'cover': t.albumArt,
        'background': t.bgImage,
        'srt': t.lyricsSrt,
        'singerSrt': t.singerSrt,
        'customParticle': ''
    };

    const getFileErrorMessage = (error: unknown) => {
        const errorCode = error instanceof Error ? error.message : '';
        if (errorCode === 'srt_file_too_large') return t.srtImportTooLarge;
        if (errorCode === 'srt_file_invalid') return t.srtImportInvalid;
        return t.fileImportFailed;
    };

    const handleFileChangeWrapper = async (e: React.ChangeEvent<HTMLInputElement>, type: AssetInputType) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await onFileChange(type, file);
            setFeedback({ tone: 'success', message: t.fileImportSuccess });
        } catch (error) {
            console.warn(`Failed to apply ${type} file.`, error);
            setFeedback({ tone: 'error', message: getFileErrorMessage(error) });
        }
    };

    const formatBytes = (bytes: number) => {
        if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        const value = bytes / (1024 ** exponent);
        return `${value >= 10 || exponent === 0 ? Math.round(value) : value.toFixed(1)} ${units[exponent]}`;
    };

    const persistedTotalSize = persistedAssetInfo.reduce((sum, item) => sum + item.size, 0);
    const persistedSummary = persistedAssetInfo.length > 0
        ? `${persistedAssetInfo.length} ${t.savedFiles} / ${formatBytes(persistedTotalSize)}`
        : t.noSavedFiles;
    const assetItems = [
        { id: 'audio', label: t.audioTrack, icon: MdMusicNote, file: appState.audioFile, color: 'text-blue-400' },
        { id: 'cover', label: t.albumArt, icon: MdImage, file: appState.coverFile, color: 'text-purple-400' },
        { id: 'background', label: t.bgImage, icon: MdWallpaper, file: appState.backgroundImageFile, color: 'text-orange-400' },
        { id: 'srt', label: t.lyricsSrt, icon: MdSubtitles, file: appState.srtFile, color: 'text-emerald-400' },
        { id: 'singerSrt', label: t.singerSrt, icon: MdPersonSearch, file: appState.singerSrtFile, color: 'text-amber-400' }
    ] as const satisfies readonly {
        id: VisibleAssetInputType;
        label: string;
        icon: React.ComponentType<{ size?: number; className?: string }>;
        file: File | null;
        color: string;
    }[];

    const resetBackgroundConfig = () => {
        onBackgroundConfigChange('scale', 1.05);
        onBackgroundConfigChange('x', 0);
        onBackgroundConfigChange('y', 0);
    };

    const resetCoverPosition = () => {
        onCoverConfigChange('x', 0);
        onCoverConfigChange('y', 0);
    };

    return (
        <div id="section-assets" className="space-y-4 scroll-mt-4">
            <h3 className={`text-xs font-sans font-bold ${themeClasses.textMuted} uppercase tracking-widest flex items-center gap-2`}>
                <MdLibraryMusic className="text-lg" /> {t.assets}
            </h3>

            {isRestoringAssets && (
                <div className={`rounded-lg border ${themeClasses.border} ${themeClasses.itemBg} px-3 py-2 text-[10px] uppercase tracking-wider ${themeClasses.textMuted}`}>
                    {t.restoringAssets}
                </div>
            )}

            <div className={`rounded-lg border ${themeClasses.border} ${themeClasses.itemBg} px-3 py-3 ${themeClasses.textMuted}`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className={`flex items-center gap-2 text-[10px] uppercase tracking-wider ${themeClasses.textSub}`}>
                            <MdStorage /> {persistedSummary}
                        </div>
                        <p className="mt-1 text-[11px] leading-5 normal-case tracking-normal">
                            {t.localAssetNotice}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClearPersistedAssets}
                        disabled={persistedAssetInfo.length === 0}
                        className={`shrink-0 rounded border px-2 py-1 text-[10px] uppercase tracking-wider transition-colors ${persistedAssetInfo.length === 0 ? `${themeClasses.border} ${themeClasses.textVeryMuted} cursor-not-allowed` : 'border-red-400/40 text-red-400 hover:bg-red-500 hover:text-white'}`}
                        title={t.clearLocalFiles}
                    >
                        <span className="inline-flex items-center gap-1"><MdDeleteSweep /> {t.clear}</span>
                    </button>
                </div>
            </div>

            {feedback && (
                <div
                    className={`rounded-lg border px-3 py-2 text-xs leading-5 ${
                        feedback.tone === 'success'
                            ? appState.themeMode === 'light' || (appState.themeMode === 'colorful' && appState.colorfulThemeBase === 'light')
                                ? 'border-emerald-500/25 bg-emerald-500/8 text-emerald-700'
                                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                            : appState.themeMode === 'light' || (appState.themeMode === 'colorful' && appState.colorfulThemeBase === 'light')
                                ? 'border-rose-500/25 bg-rose-500/8 text-rose-700'
                                : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                    }`}
                >
                    {feedback.message}
                </div>
            )}
            
            {assetItems.map((item) => (
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
                            onChange={(e) => handleFileChangeWrapper(e, item.id)}
                            onClick={(e) => (e.currentTarget.value = '')} 
                        />
                    </label>

                    {item.file && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onFileRemove(item.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors z-10"
                            title="Remove file"
                        >
                            <MdClose size={16} />
                        </button>
                    )}

                    {item.id === 'cover' && appState.coverUrl && (
                        <div className={`mt-3 pt-3 border-t ${themeClasses.border} animate-fade-in space-y-4`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-[10px] font-bold ${themeClasses.textMuted} uppercase tracking-wider`}>{t.albumArt}</span>
                                <button
                                    onClick={resetCoverPosition}
                                    className={`text-[10px] flex items-center gap-1 hover:${themeClasses.textMain} ${themeClasses.textMuted} transition-colors`}
                                    title="Reset Position"
                                >
                                    <MdRestartAlt /> {t.reset}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                                        <span className="flex items-center gap-1"><MdPanTool className={`rotate-0 ${themeClasses.textMuted}`} /> {t.posX}</span>
                                        <span className={`font-mono ${themeClasses.textMuted}`}>{appState.coverImageX}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="-50"
                                        max="50"
                                        step="1"
                                        value={appState.coverImageX}
                                        onChange={(e) => onCoverConfigChange('x', Number(e.target.value))}
                                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                    />
                                </div>
                                <div>
                                    <div className={`flex justify-between text-xs ${themeClasses.textSub} mb-1`}>
                                        <span className="flex items-center gap-1"><MdPanTool className={`rotate-90 ${themeClasses.textMuted}`} /> {t.posY}</span>
                                        <span className={`font-mono ${themeClasses.textMuted}`}>{appState.coverImageY}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="-50"
                                        max="50"
                                        step="1"
                                        value={appState.coverImageY}
                                        onChange={(e) => onCoverConfigChange('y', Number(e.target.value))}
                                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                                    />
                                </div>
                            </div>
                        </div>
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
