
import React from 'react';
import { MdSkipPrevious, MdPause, MdPlayArrow, MdSkipNext, MdVolumeOff, MdVolumeUp } from 'react-icons/md';
import { AppState } from '../types';
import VisualizerBar from './VisualizerBar';
import { formatTime } from '../utils/uiUtils';

interface PlayerControlBarProps {
    appState: AppState;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    analyser: AnalyserNode | null;
    togglePlay: () => void;
    skipBackward: () => void;
    skipForward: () => void;
    setVolume: (vol: number) => void;
    seek: (time: number) => void;
    singerOverrideColors?: string[] | null;
}

const PlayerControlBar: React.FC<PlayerControlBarProps> = ({
    appState,
    isPlaying,
    currentTime,
    duration,
    volume,
    analyser,
    togglePlay,
    skipBackward,
    skipForward,
    setVolume,
    seek,
    singerOverrideColors
}) => {
    let isDarkBase = true;
    if (appState.themeMode === 'light') {
        isDarkBase = false;
    } else if (appState.themeMode === 'colorful') {
        isDarkBase = appState.colorfulThemeBase === 'dark';
    }

    const textColor = isDarkBase ? 'text-white' : 'text-gray-900';

    const progressStyle: React.CSSProperties = {
        width: `${(currentTime / (duration || 1)) * 100}%`,
        backgroundColor: singerOverrideColors && singerOverrideColors.length === 1 ? singerOverrideColors[0] : appState.themeColor,
        boxShadow: `0 0 10px ${appState.themeColor}`,
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    };

    if (singerOverrideColors && singerOverrideColors.length > 1) {
        progressStyle.backgroundImage = `linear-gradient(to right, ${singerOverrideColors.join(', ')})`;
        progressStyle.backgroundColor = 'transparent';
    }

    return (
        <div 
            className="fixed z-50 transition-all duration-300 pointer-events-none flex justify-center w-full"
            style={{ 
                bottom: `${appState.playerBarPositionY}%`,
                left: `${appState.playerBarPositionX}%`,
                transform: `translateX(${appState.playerBarPositionX}%)` 
            }}
        >
            <div 
                className={`
                    relative backdrop-blur-2xl rounded-2xl sm:rounded-full border shadow-2xl overflow-hidden
                    transition-all duration-300 pointer-events-auto
                    hover:scale-[1.01] hover:shadow-glow
                `}
                style={{ 
                    borderColor: isDarkBase ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    backgroundColor: isDarkBase ? `rgba(10,10,10,${appState.playerControlsOpacity})` : `rgba(255,255,255,${appState.playerControlsOpacity})`,
                    backdropFilter: `blur(${appState.playerBarBlur}px)`,
                    WebkitBackdropFilter: `blur(${appState.playerBarBlur}px)`,
                    width: `min(${appState.playerBarWidth}%, 1200px)`,
                    height: `${appState.playerBarHeight}px`,
                }}
            >
                <VisualizerBar 
                    analyser={analyser} 
                    isPlaying={isPlaying} 
                    themeColor={appState.themeColor}
                    enableWaves={appState.enableWaves}
                    themeMode={appState.themeMode}
                    colorfulThemeBase={appState.colorfulThemeBase}
                    enableParticles={appState.enableParticles}
                    sensitivity={appState.barSensitivity}
                    waveHeight={appState.waveBarHeight}
                    blur={appState.waveBarBlur}
                    singerOverrideColors={singerOverrideColors}
                />

                <div className="relative z-10 w-full h-full flex items-center justify-between px-6 sm:px-10 gap-4 sm:gap-8">
                    
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button onClick={skipBackward} className={`p-2 rounded-full transition-all duration-300 ${isDarkBase ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-black/70 hover:text-black hover:bg-black/10'} active:scale-95`}>
                            <MdSkipPrevious size={24} />
                        </button>
                        <button 
                            onClick={togglePlay} 
                            className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-300 ${isDarkBase ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/20 text-black'} active:scale-95 shadow-lg`}
                        >
                            {isPlaying ? (
                                <MdPause size={30} key="pause-icon" />
                            ) : (
                                <MdPlayArrow size={30} key="play-icon" className="translate-x-0.5" />
                            )}
                        </button>
                        <button onClick={skipForward} className={`p-2 rounded-full transition-all duration-300 ${isDarkBase ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-black/70 hover:text-black hover:bg-black/10'} active:scale-95`}>
                            <MdSkipNext size={24} />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
                        <div className="flex justify-between text-[10px] font-mono tracking-widest opacity-60 px-1">
                            <span className={textColor}>{formatTime(currentTime)}</span>
                            <span className={textColor}>{formatTime(duration)}</span>
                        </div>
                        <div 
                            className="relative h-1.5 sm:h-2 rounded-full cursor-pointer group"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const pos = (e.clientX - rect.left) / rect.width;
                                seek(pos * duration);
                            }}
                        >
                            <div className={`absolute inset-0 rounded-full opacity-20 ${isDarkBase ? 'bg-white' : 'bg-black'}`}></div>
                            <div 
                                className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-150 group-hover:opacity-80 overflow-hidden"
                                style={progressStyle}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-3 w-32 group/vol">
                        <button 
                            onClick={() => setVolume(volume > 0 ? 0 : 1)}
                            className={`${textColor} opacity-60 hover:opacity-100 transition-opacity`}
                        >
                            {volume === 0 ? <MdVolumeOff size={20}/> : <MdVolumeUp size={20}/>}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isDarkBase ? 'bg-white/20' : 'bg-black/10'} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-current [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-125`}
                            style={{ color: singerOverrideColors && singerOverrideColors.length > 0 ? singerOverrideColors[0] : appState.themeColor }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerControlBar;
