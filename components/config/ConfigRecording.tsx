
import React, { useState } from 'react';
import { MdVideocam, MdRadioButtonChecked, MdSpeed, MdSettings, MdCheck, MdSlowMotionVideo, MdGraphicEq, MdMouse } from 'react-icons/md';
import { AppState, RecordingFormat } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';

interface ConfigRecordingProps {
    appState: AppState;
    onRecordArmToggle: () => void;
    onRecordConfigChange: (key: string, value: any) => void;
    translations: any;
}

const ConfigRecording: React.FC<ConfigRecordingProps> = ({ appState, onRecordArmToggle, onRecordConfigChange, translations: t }) => {
    const themeClasses = getThemeClasses(appState);
    const [isRequesting, setIsRequesting] = useState(false);

    const handleArmClick = async () => {
        setIsRequesting(true);
        try {
            await onRecordArmToggle();
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <div id="section-recording" className="space-y-4 scroll-mt-4">
            <h3 className={`text-xs font-sans font-bold ${themeClasses.textMuted} uppercase tracking-widest flex items-center gap-2`}>
                <MdVideocam className="text-lg" /> {t.recording}
            </h3>

            <div className={`${themeClasses.itemBg} rounded-xl p-4 space-y-4 border ${themeClasses.border}`}>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleArmClick}
                        disabled={isRequesting}
                        className={`w-full py-3 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                            appState.isRecordArmed 
                            ? 'bg-amber-500 border-amber-400 text-white shadow-lg' 
                            : `${themeClasses.itemBg} ${themeClasses.border} ${themeClasses.textMain} hover:bg-emerald-500/10`
                        } ${isRequesting ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        <MdRadioButtonChecked 
                            size={20} 
                            className={appState.isRecordArmed ? 'text-white' : 'text-amber-500'} 
                        />
                        <span className="font-serif text-sm">
                            {isRequesting ? 'Requesting Stream...' : (appState.isRecordArmed ? t.recordingArmed : t.armRecording)}
                        </span>
                    </button>
                    
                    <p className={`text-[9px] ${themeClasses.textMuted} text-center leading-relaxed px-2`}>
                        {appState.isRecordArmed 
                            ? 'Ready! Recording starts automatically when music plays.' 
                            : 'Clicking "Prepare" will ask for screen sharing permission now.'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    {(['webm', 'mp4'] as RecordingFormat[]).map(fmt => (
                        <button
                            key={fmt}
                            onClick={() => onRecordConfigChange('recordFormat', fmt)}
                            className={`py-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-center gap-2 ${
                                appState.recordFormat === fmt
                                ? `${themeClasses.itemActive} ${themeClasses.borderActive} ${themeClasses.textMain}`
                                : `${themeClasses.itemBg} ${themeClasses.border} ${themeClasses.textMuted}`
                            }`}
                        >
                            {appState.recordFormat === fmt && <MdCheck size={14} />}
                            {fmt.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Bitrate Slider */}
                <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className={`font-serif flex items-center gap-2 ${themeClasses.textSub}`}>
                            <MdSpeed size={14} /> {t.bitrate}
                        </span>
                        <span className={`font-mono ${themeClasses.textMuted}`}>{appState.recordBitrate} Mbps</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        step="1"
                        value={appState.recordBitrate}
                        onChange={(e) => onRecordConfigChange('recordBitrate', Number(e.target.value))}
                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                    />
                </div>

                {/* FPS Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className={`font-serif flex items-center gap-2 ${themeClasses.textSub}`}>
                            <MdSlowMotionVideo size={14} /> {t.fps}
                        </span>
                        <span className={`font-mono ${themeClasses.textMuted}`}>{appState.recordFps} FPS</span>
                    </div>
                    <input
                        type="range"
                        min="30"
                        max="300"
                        step="1"
                        value={appState.recordFps}
                        onChange={(e) => onRecordConfigChange('recordFps', Number(e.target.value))}
                        className={`w-full h-1 ${themeClasses.sliderTrack} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${themeClasses.sliderThumb} hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                    />
                    <div className={`flex justify-between text-[9px] ${themeClasses.textMuted} mt-1 uppercase`}>
                        <span>30 FPS</span><span>300 FPS</span>
                    </div>
                </div>

                <hr className={themeClasses.border} />

                {/* Cursor Toggle */}
                <div className="space-y-1">
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className={`text-sm ${themeClasses.textSub} group-hover:${themeClasses.textMain} transition-colors font-serif flex items-center gap-2`}>
                            <MdMouse className={themeClasses.textMuted} /> {t.recordCursor}
                        </span>
                        <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                            <input 
                                type="checkbox" 
                                checked={appState.recordCaptureCursor}
                                onChange={(e) => onRecordConfigChange('recordCaptureCursor', e.target.checked)}
                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-0"
                                style={{borderColor: '#4b5563'}}
                            />
                            <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${appState.recordCaptureCursor ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                        </div>
                    </label>
                    <p className={`text-[8px] ${themeClasses.textVeryMuted} italic ml-6`}>
                        * 采用 CSS 隐藏技术，确保鼠标不会被录制进画面。
                    </p>
                </div>
            </div>
            
            <p className={`text-[10px] ${themeClasses.textVeryMuted} italic px-2`}>
                {t.recordingHint}
            </p>
        </div>
    );
};

export default ConfigRecording;
