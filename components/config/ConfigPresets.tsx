

import React, { useRef, useState } from 'react';
import { MdCloudUpload, MdSave, MdLock, MdDelete, MdCheck, MdFileDownload, MdFileUpload } from 'react-icons/md';
import { AppState, AppPreset } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';
import { PresetImportSummary } from '../../utils/presetTransfer';

interface PresetExportResult {
    count: number;
    fileName: string;
}

interface ConfigPresetsProps {
    appState: AppState;
    presets: AppPreset[];
    onApplyPreset: (preset: AppPreset) => void;
    onSavePreset: (name: string, idToOverwrite?: string) => void;
    onDeletePreset: (id: string) => void;
    onExportPresets: () => PresetExportResult | Promise<PresetExportResult>;
    onImportPresets: (file: File) => Promise<PresetImportSummary>;
    translations: any;
}

const formatMessage = (template: string, values: Record<string, string | number>) => (
    Object.entries(values).reduce(
        (result, [key, value]) => result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
        template
    )
);

const ConfigPresets: React.FC<ConfigPresetsProps> = ({ 
    appState, presets, onApplyPreset, onSavePreset, onDeletePreset, onExportPresets, onImportPresets, translations: t 
}) => {
    const [newPresetName, setNewPresetName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);
    const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const themeClasses = getThemeClasses(appState);
    const customPresetCount = presets.filter((preset) => !preset.isDefault).length;

    const handleSaveNewPreset = () => {
        if (!newPresetName.trim()) return;
        onSavePreset(newPresetName.trim());
        setNewPresetName('');
        setIsSaving(false);
    };

    const handleExport = async () => {
        try {
            setIsTransferring(true);
            const result = await onExportPresets();
            setFeedback({
                tone: 'success',
                message: formatMessage(t.presetExportSuccess, { count: result.count }),
            });
        } catch (error) {
            const message = error instanceof Error && error.message === 'no_custom_presets'
                ? t.noCustomPresetsToExport
                : t.presetExportFailed;
            setFeedback({ tone: 'error', message });
        } finally {
            setIsTransferring(false);
        }
    };

    const handleImportClick = () => {
        if (isTransferring) return;
        fileInputRef.current?.click();
    };

    const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        try {
            setIsTransferring(true);
            const summary = await onImportPresets(file);
            setFeedback({
                tone: 'success',
                message: formatMessage(t.presetImportSuccess, {
                    total: summary.total,
                    created: summary.created,
                    overwritten: summary.overwritten,
                    renamed: summary.renamed,
                }),
            });
        } catch (error) {
            const errorCode = error instanceof Error ? error.message : '';
            const message = errorCode === 'invalid_preset_file' || errorCode === 'empty_preset_file'
                ? t.presetImportInvalid
                : t.presetImportFailed;
            setFeedback({ tone: 'error', message });
        } finally {
            setIsTransferring(false);
        }
    };

    return (
        <div id="section-presets" className="space-y-4 scroll-mt-4">
            <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleImportFileChange}
            />
            <div className="flex items-center justify-between">
                <h3 className={`text-xs font-sans font-bold ${themeClasses.textMuted} uppercase tracking-widest flex items-center gap-2`}>
                    <MdCloudUpload className="text-lg" /> {t.presets}
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleImportClick}
                        disabled={isTransferring}
                        className={`text-[10px] px-2 py-1 rounded border transition-colors flex items-center gap-1 ${themeClasses.itemBg} ${themeClasses.border} ${themeClasses.textMain} hover:opacity-80 disabled:opacity-40`}
                    >
                        <MdFileUpload /> {t.importPresets}
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isTransferring || customPresetCount === 0}
                        className={`text-[10px] px-2 py-1 rounded border transition-colors flex items-center gap-1 ${themeClasses.itemBg} ${themeClasses.border} ${themeClasses.textMain} hover:opacity-80 disabled:opacity-40`}
                    >
                        <MdFileDownload /> {t.exportPresets}
                    </button>
                    <button 
                        onClick={() => setIsSaving(!isSaving)}
                        className={`text-[10px] px-2 py-1 rounded border transition-colors flex items-center gap-1 ${isSaving ? 'bg-emerald-500 text-white border-emerald-500' : `${themeClasses.itemBg} ${themeClasses.border} ${themeClasses.textMain} hover:opacity-80`}`}
                    >
                        <MdSave /> {isSaving ? t.cancel : t.saveCurrent}
                    </button>
                </div>
            </div>

            <p className={`text-[11px] leading-5 ${themeClasses.textMuted}`}>
                {t.presetTransferHint}
            </p>

            <div className={`transition-all duration-300 overflow-hidden ${isSaving ? 'max-h-20 opacity-100 mb-3' : 'max-h-0 opacity-0'}`}>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        placeholder={t.presetNamePlaceholder}
                        className={`flex-1 ${themeClasses.inputBg} border ${themeClasses.border} rounded px-3 text-sm ${themeClasses.textMain} focus:outline-none focus:border-opacity-50`}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveNewPreset()}
                    />
                    <button 
                        onClick={handleSaveNewPreset}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-sm transition-colors"
                    >
                        {t.save}
                    </button>
                </div>
            </div>

            {feedback && (
                <div
                    className={`rounded-xl border px-3 py-2 text-xs leading-5 ${
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

            <div className={`${themeClasses.itemBg} rounded-xl border ${themeClasses.border} overflow-hidden max-h-[220px] overflow-y-auto scrollbar-hide`}>
                {presets.map((preset) => (
                    <div key={preset.id} className={`group flex items-center justify-between p-3 ${themeClasses.itemHover} border-b ${themeClasses.border} last:border-0 transition-colors`}>
                        <button onClick={() => onApplyPreset(preset)} className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                                <span className={`font-serif text-sm ${themeClasses.textSub} group-hover:${themeClasses.textMain} transition-colors`}>{preset.name}</span>
                                {preset.isDefault && <MdLock size={12} className={themeClasses.textVeryMuted} title="Default Preset" />}
                            </div>
                        </button>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!preset.isDefault && (
                                <>
                                    <button onClick={() => onSavePreset(preset.name, preset.id)} className={`p-1.5 ${themeClasses.iconMuted} hover:text-blue-400 transition-colors`} title={t.overwritePreset}>
                                        <MdSave size={14} />
                                    </button>
                                    <button onClick={() => onDeletePreset(preset.id)} className={`p-1.5 ${themeClasses.iconMuted} hover:text-red-400 transition-colors`} title={t.deletePreset}>
                                        <MdDelete size={14} />
                                    </button>
                                </>
                            )}
                            <button onClick={() => onApplyPreset(preset)} className={`p-1.5 ${themeClasses.iconMuted} hover:text-emerald-400 transition-colors ml-1`} title={t.applyPreset}>
                                <MdCheck size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConfigPresets;
