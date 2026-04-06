

import React, { useState } from 'react';
import { MdCloudUpload, MdSave, MdLock, MdDelete, MdCheck } from 'react-icons/md';
import { AppState, AppPreset } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';

interface ConfigPresetsProps {
    appState: AppState;
    presets: AppPreset[];
    onApplyPreset: (preset: AppPreset) => void;
    onSavePreset: (name: string, idToOverwrite?: string) => void;
    onDeletePreset: (id: string) => void;
    translations: any;
}

const ConfigPresets: React.FC<ConfigPresetsProps> = ({ 
    appState, presets, onApplyPreset, onSavePreset, onDeletePreset, translations: t 
}) => {
    const [newPresetName, setNewPresetName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const themeClasses = getThemeClasses(appState);

    const handleSaveNewPreset = () => {
        if (!newPresetName.trim()) return;
        onSavePreset(newPresetName.trim());
        setNewPresetName('');
        setIsSaving(false);
    }

    return (
        <div id="section-presets" className="space-y-4 scroll-mt-4">
            <div className="flex items-center justify-between">
                <h3 className={`text-xs font-sans font-bold ${themeClasses.textMuted} uppercase tracking-widest flex items-center gap-2`}>
                    <MdCloudUpload className="text-lg" /> {t.presets}
                </h3>
                <button 
                    onClick={() => setIsSaving(!isSaving)}
                    className={`text-[10px] px-2 py-1 rounded border transition-colors flex items-center gap-1 ${isSaving ? 'bg-emerald-500 text-white border-emerald-500' : `${themeClasses.itemBg} ${themeClasses.border} ${themeClasses.textMain} hover:opacity-80`}`}
                >
                    <MdSave /> {isSaving ? t.cancel : t.saveCurrent}
                </button>
            </div>

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
                                    <button onClick={() => onSavePreset(preset.name, preset.id)} className={`p-1.5 ${themeClasses.iconMuted} hover:text-blue-400 transition-colors`} title="Overwrite">
                                        <MdSave size={14} />
                                    </button>
                                    <button onClick={() => onDeletePreset(preset.id)} className={`p-1.5 ${themeClasses.iconMuted} hover:text-red-400 transition-colors`} title="Delete">
                                        <MdDelete size={14} />
                                    </button>
                                </>
                            )}
                            <button onClick={() => onApplyPreset(preset)} className={`p-1.5 ${themeClasses.iconMuted} hover:text-emerald-400 transition-colors ml-1`} title="Apply">
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