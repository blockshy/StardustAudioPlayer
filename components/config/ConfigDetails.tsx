

import React from 'react';
import { MdEdit } from 'react-icons/md';
import { AppState, Metadata } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';

interface ConfigDetailsProps {
    appState: AppState;
    onMetadataChange: (key: keyof Metadata, value: string) => void;
    translations: any;
}

const ConfigDetails: React.FC<ConfigDetailsProps> = ({ appState, onMetadataChange, translations: t }) => {
    const themeClasses = getThemeClasses(appState);

    return (
        <div id="section-details" className="space-y-4 scroll-mt-4">
            <h3 className={`text-xs font-sans font-bold ${themeClasses.textMuted} uppercase tracking-widest flex items-center gap-2`}>
                <MdEdit className="text-lg" /> {t.trackDetails}
            </h3>
            <div className={`${themeClasses.itemBg} rounded-xl p-4 space-y-3 border ${themeClasses.border}`}>
                <div className="space-y-1">
                    <label className={`text-[10px] ${themeClasses.textMuted} uppercase tracking-wider font-sans`}>{t.trackTitle}</label>
                    <input
                        type="text"
                        value={appState.metadata.title}
                        onChange={(e) => onMetadataChange('title', e.target.value)}
                        className={`w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg px-3 py-2 text-sm ${themeClasses.textMain} focus:outline-none focus:border-opacity-50 transition-colors placeholder-current placeholder-opacity-20`}
                        placeholder="Song Title"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className={`text-[10px] ${themeClasses.textMuted} uppercase tracking-wider font-sans`}>{t.artist}</label>
                        <input
                            type="text"
                            value={appState.metadata.artist}
                            onChange={(e) => onMetadataChange('artist', e.target.value)}
                            className={`w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg px-3 py-2 text-sm ${themeClasses.textMain} focus:outline-none focus:border-opacity-50 transition-colors placeholder-current placeholder-opacity-20`}
                            placeholder="Artist Name"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className={`text-[10px] ${themeClasses.textMuted} uppercase tracking-wider font-sans`}>{t.album}</label>
                        <input
                            type="text"
                            value={appState.metadata.album}
                            onChange={(e) => onMetadataChange('album', e.target.value)}
                            className={`w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg px-3 py-2 text-sm ${themeClasses.textMain} focus:outline-none focus:border-opacity-50 transition-colors placeholder-current placeholder-opacity-20`}
                            placeholder="Album Name"
                        />
                    </div>
                </div>
                
                <div className="space-y-1">
                    <label className={`text-[10px] ${themeClasses.textMuted} uppercase tracking-wider font-sans`}>{t.visualArtist}</label>
                    <input
                        type="text"
                        value={appState.metadata.visualArtist || ''}
                        onChange={(e) => onMetadataChange('visualArtist', e.target.value)}
                        className={`w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg px-3 py-2 text-sm ${themeClasses.textMain} focus:outline-none focus:border-opacity-50 transition-colors placeholder-current placeholder-opacity-20`}
                        placeholder="Visual Artist Name"
                    />
                </div>

                <div className="space-y-1">
                    <label className={`text-[10px] ${themeClasses.textMuted} uppercase tracking-wider font-sans`}>{t.coverSinger}</label>
                    <input
                        type="text"
                        value={appState.metadata.coverSinger || ''}
                        onChange={(e) => onMetadataChange('coverSinger', e.target.value)}
                        className={`w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg px-3 py-2 text-sm ${themeClasses.textMain} focus:outline-none focus:border-opacity-50 transition-colors placeholder-current placeholder-opacity-20`}
                        placeholder="Singer Name"
                    />
                </div>

                <div className={`pt-2 border-t ${themeClasses.border} grid grid-cols-2 gap-3`}>
                    <div className="space-y-1">
                        <label className={`text-[10px] ${themeClasses.textMuted} uppercase tracking-wider font-sans`}>{t.headerTitle}</label>
                        <input
                            type="text"
                            value={appState.metadata.playerTitle || ''}
                            onChange={(e) => onMetadataChange('playerTitle', e.target.value)}
                            className={`w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg px-3 py-2 text-sm ${themeClasses.textMain} focus:outline-none focus:border-opacity-50 transition-colors placeholder-current placeholder-opacity-20`}
                            placeholder="Stardust"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className={`text-[10px] ${themeClasses.textMuted} uppercase tracking-wider font-sans`}>{t.headerSub}</label>
                        <input
                            type="text"
                            value={appState.metadata.playerSubtitle || ''}
                            onChange={(e) => onMetadataChange('playerSubtitle', e.target.value)}
                            className={`w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg px-3 py-2 text-sm ${themeClasses.textMain} focus:outline-none focus:border-opacity-50 transition-colors placeholder-current placeholder-opacity-20`}
                            placeholder="Player"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigDetails;