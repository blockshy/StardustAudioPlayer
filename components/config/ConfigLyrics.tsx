import React from 'react';
import { MdLyrics } from 'react-icons/md';
import { AppState, LyricEffect } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';
import LyricsStyling from './LyricsStyling';

interface ConfigLyricsProps {
    appState: AppState;
    onLyricLineConfigChange: (key: 'primaryIndex' | 'order', value: number | number[]) => void;
    onLyricSizeChange: (type: 'main' | 'sub', size: number) => void;
    onLyricBoldChange: (isBold: boolean) => void;
    onLyricColorChange: (key: 'active' | 'inactive' | 'stroke' | 'strokeWidth' | 'effect' | 'streamerColor', value: string | number | null | LyricEffect) => void;
    onLyricShadowChange: (key: 'enabled' | 'direction' | 'strength' | 'distance' | 'blur' | 'color', value: boolean | number | string | null) => void;
    onLyricOffsetChange: (offset: number) => void;
    onLyricGapToleranceChange: (tolerance: number) => void;
    translations: any;
}

const ConfigLyrics: React.FC<ConfigLyricsProps> = (props) => {
    const { appState, translations: t } = props;
    const themeClasses = getThemeClasses(appState);

    return (
        <div id="section-lyrics" className="space-y-4 scroll-mt-4">
            <h3 className={`text-xs font-sans font-bold ${themeClasses.textMuted} uppercase tracking-widest flex items-center gap-2`}>
                <MdLyrics className="text-lg" /> {t.lyrics}
            </h3>
            <div className={`${themeClasses.itemBg} rounded-xl p-4 border ${themeClasses.border}`}>
                <LyricsStyling
                    appState={appState}
                    onLyricLineConfigChange={props.onLyricLineConfigChange}
                    onLyricSizeChange={props.onLyricSizeChange}
                    onLyricBoldChange={props.onLyricBoldChange}
                    onLyricColorChange={props.onLyricColorChange}
                    onLyricShadowChange={props.onLyricShadowChange}
                    onLyricOffsetChange={props.onLyricOffsetChange}
                    onLyricGapToleranceChange={props.onLyricGapToleranceChange}
                    translations={t}
                />
            </div>
        </div>
    );
};

export default ConfigLyrics;
