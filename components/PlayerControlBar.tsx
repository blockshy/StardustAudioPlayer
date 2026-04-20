import React, { useEffect, useRef, useState } from 'react';
import { MdPause, MdPlayArrow, MdReplay10, MdForward10, MdVolumeOff, MdVolumeUp } from 'react-icons/md';
import { AppState } from '../types';
import VisualizerBar from './VisualizerBar';
import { hexToRgb } from '../utils/colorUtils';
import { formatTime } from '../utils/uiUtils';

interface PlayerControlBarProps {
    appState: AppState;
    hasAudio: boolean;
    isPlaying: boolean;
    isReady: boolean;
    isBuffering: boolean;
    audioError: string | null;
    currentTime: number;
    duration: number;
    volume: number;
    muted: boolean;
    analyser: AnalyserNode | null;
    togglePlay: () => void;
    toggleMute: () => void;
    skipBackward: () => void;
    skipForward: () => void;
    setVolume: (vol: number) => void;
    seek: (time: number) => void;
    singerOverrideColors?: string[] | null;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const colorToRgba = (hex: string, alpha: number) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return `rgba(255,255,255,${alpha})`;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};
const getReadableAccentText = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#ffffff';
    const brightness = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
    return brightness >= 160 ? '#111827' : '#ffffff';
};

const PlayerControlBar: React.FC<PlayerControlBarProps> = ({
    appState,
    hasAudio,
    isPlaying,
    isReady,
    isBuffering,
    audioError,
    currentTime,
    duration,
    volume,
    muted,
    analyser,
    togglePlay,
    toggleMute,
    skipBackward,
    skipForward,
    setVolume,
    seek,
    singerOverrideColors
}) => {
    const shellRef = useRef<HTMLDivElement>(null);
    const [barWidth, setBarWidth] = useState(0);

    useEffect(() => {
        if (!shellRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            const nextWidth = entries[0]?.contentRect.width ?? 0;
            setBarWidth(nextWidth);
        });
        resizeObserver.observe(shellRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    const isDarkBase = appState.themeMode === 'light'
        ? false
        : appState.themeMode === 'colorful'
            ? appState.colorfulThemeBase === 'dark'
            : true;

    const labels = appState.language === 'zh'
        ? {
            play: '播放',
            pause: '暂停',
            rewind: '后退 10 秒',
            forward: '前进 10 秒',
            mute: '静音',
            unmute: '恢复音量',
            progress: '播放进度',
            volume: '音量',
            noAudio: '未加载音频',
            loading: '正在读取音频',
            buffering: '正在缓冲',
            error: '音频播放异常',
          }
        : {
            play: 'Play',
            pause: 'Pause',
            rewind: 'Back 10 seconds',
            forward: 'Forward 10 seconds',
            mute: 'Mute',
            unmute: 'Restore volume',
            progress: 'Playback progress',
            volume: 'Volume',
            noAudio: 'No audio loaded',
            loading: 'Loading audio',
            buffering: 'Buffering',
            error: 'Audio playback error',
          };

    const durationSafe = Number.isFinite(duration) ? duration : 0;
    const currentTimeSafe = clamp(currentTime, 0, durationSafe || 0);
    const progressRatio = durationSafe > 0 ? clamp(currentTimeSafe / durationSafe, 0, 1) : 0;
    const activePalette = singerOverrideColors && singerOverrideColors.length > 0 ? singerOverrideColors : [appState.themeColor];
    const activeColor = activePalette[0];
    const accentBackground = activePalette.length > 1 ? `linear-gradient(to right, ${activePalette.join(', ')})` : activeColor;
    const progressTrackColor = isDarkBase ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
    const textColor = isDarkBase ? 'text-white' : 'text-gray-900';
    const mutedTextColor = isDarkBase ? 'text-white/60' : 'text-black/55';
    const seekEnabled = hasAudio && durationSafe > 0;
    const transportEnabled = hasAudio;
    const compactMode = barWidth > 0 && barWidth < 640;
    const ultraCompactMode = barWidth > 0 && barWidth < 470;
    const showVolumeSlider = barWidth >= 560;
    const iconButtonSurfaceStrong = isDarkBase ? colorToRgba(activeColor, 0.24) : colorToRgba(activeColor, 0.18);
    const iconButtonSurfaceSoft = isDarkBase ? colorToRgba(activeColor, 0.08) : colorToRgba(activeColor, 0.08);
    const iconButtonBorder = isDarkBase ? colorToRgba(activeColor, 0.28) : colorToRgba(activeColor, 0.22);
    const iconButtonShadow = isDarkBase ? colorToRgba(activeColor, 0.24) : colorToRgba(activeColor, 0.16);
    const playIconColor = getReadableAccentText(activeColor);

    const statusText = !hasAudio
        ? labels.noAudio
        : audioError
            ? labels.error
            : isBuffering
                ? labels.buffering
                : !isReady
                    ? labels.loading
            : null;

    const buttonBaseClass = 'flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35';
    const iconButtonClass = `${buttonBaseClass} border hover:brightness-110 hover:saturate-125 ${ultraCompactMode ? 'h-8 w-8' : compactMode ? 'h-9 w-9' : 'h-10 w-10 sm:h-11 sm:w-11'}`;
    const playButtonClass = `${buttonBaseClass} border border-transparent hover:brightness-105 hover:saturate-110 ${ultraCompactMode ? 'h-10 w-10' : compactMode ? 'h-11 w-11' : 'h-12 w-12 sm:h-14 sm:w-14'} shadow-lg`;
    const iconSize = ultraCompactMode ? 18 : compactMode ? 20 : 22;
    const playIconSize = ultraCompactMode ? 24 : compactMode ? 26 : 30;
    const statusClass = ultraCompactMode ? 'text-[9px] tracking-[0.12em]' : 'text-[10px] tracking-[0.18em]';
    const iconButtonStyle: React.CSSProperties = {
        color: activeColor,
        background: `linear-gradient(180deg, ${iconButtonSurfaceStrong}, ${iconButtonSurfaceSoft})`,
        borderColor: iconButtonBorder,
        boxShadow: `0 0 0 1px ${iconButtonBorder} inset, 0 8px 20px ${iconButtonShadow}`,
    };
    const playButtonStyle: React.CSSProperties = {
        background: accentBackground,
        color: playIconColor,
        borderColor: colorToRgba(activeColor, isDarkBase ? 0.34 : 0.22),
        boxShadow: `0 10px 28px ${colorToRgba(activeColor, isDarkBase ? 0.28 : 0.2)}`,
    };

    return (
        <div
            className="fixed z-50 w-full pointer-events-none flex justify-center transition-all duration-300"
            style={{
                bottom: `${appState.playerBarPositionY}%`,
                left: '50%',
                transform: `translateX(calc(-50% + ${appState.playerBarPositionX}%))`,
            }}
        >
            <div
                ref={shellRef}
                className="relative pointer-events-auto overflow-hidden rounded-2xl sm:rounded-full border shadow-2xl transition-all duration-300 hover:shadow-glow"
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
                    sensitivity={appState.barSensitivity}
                    waveHeight={appState.waveBarHeight}
                    blur={appState.waveBarBlur}
                    singerOverrideColors={singerOverrideColors}
                />

                <div className={`relative z-10 grid h-full grid-cols-[auto,1fr,auto] items-center ${ultraCompactMode ? 'gap-2 px-3' : compactMode ? 'gap-3 px-4' : 'gap-3 px-4 sm:gap-6 sm:px-8'}`}>
                    <div className={`flex items-center ${ultraCompactMode ? 'gap-0.5' : compactMode ? 'gap-1' : 'gap-1 sm:gap-2'}`}>
                        <button
                            type="button"
                            onClick={skipBackward}
                            disabled={!seekEnabled}
                            aria-label={labels.rewind}
                            title={labels.rewind}
                            className={iconButtonClass}
                            style={iconButtonStyle}
                        >
                            <MdReplay10 size={iconSize} />
                        </button>
                        <button
                            type="button"
                            onClick={togglePlay}
                            disabled={!transportEnabled}
                            aria-label={isPlaying ? labels.pause : labels.play}
                            title={isPlaying ? labels.pause : labels.play}
                            className={playButtonClass}
                            style={playButtonStyle}
                        >
                            {isPlaying ? (
                                <MdPause size={playIconSize} />
                            ) : (
                                <MdPlayArrow size={playIconSize} className="translate-x-[1px]" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={skipForward}
                            disabled={!seekEnabled}
                            aria-label={labels.forward}
                            title={labels.forward}
                            className={iconButtonClass}
                            style={iconButtonStyle}
                        >
                            <MdForward10 size={iconSize} />
                        </button>
                    </div>

                    <div className="min-w-0">
                        <div className={`mb-1 flex items-center px-1 font-mono ${statusClass} ${mutedTextColor} ${ultraCompactMode ? 'justify-between gap-2' : 'justify-between'}`}>
                            {ultraCompactMode ? (
                                <>
                                    <span className={`${textColor} shrink-0`}>{formatTime(currentTimeSafe)}</span>
                                    <span className={`truncate text-center normal-case tracking-[0.08em] ${statusText ? mutedTextColor : 'opacity-0'}`} aria-live="polite">
                                        {statusText || '...'}
                                    </span>
                                    <span className={`${textColor} shrink-0`}>{formatTime(durationSafe)}</span>
                                </>
                            ) : (
                                <>
                                    <span className={`${textColor} shrink-0`}>{formatTime(currentTimeSafe)}</span>
                                    <span
                                        className={`truncate px-3 text-center normal-case tracking-[0.12em] ${statusText ? mutedTextColor : 'opacity-0'}`}
                                        aria-live="polite"
                                    >
                                        {statusText || 'placeholder'}
                                    </span>
                                    <span className={`${textColor} shrink-0`}>{formatTime(durationSafe)}</span>
                                </>
                            )}
                        </div>
                        <div className={`relative ${ultraCompactMode ? 'h-3.5' : 'h-4'}`}>
                            <div
                                className={`absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full ${ultraCompactMode ? 'h-1.5' : 'h-2'}`}
                                style={{ background: progressTrackColor }}
                            />
                            <div
                                className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full overflow-hidden transition-[width,opacity] duration-150 ease-out ${ultraCompactMode ? 'h-1.5' : 'h-2'} ${seekEnabled ? 'opacity-100' : 'opacity-55'}`}
                                style={{
                                    width: `${progressRatio * 100}%`,
                                    background: accentBackground,
                                    boxShadow: `0 0 14px ${activeColor}55`,
                                }}
                            >
                                {!ultraCompactMode && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-70" />
                                )}
                            </div>
                            <input
                                type="range"
                                min="0"
                                max={durationSafe || 1}
                                step="0.01"
                                value={durationSafe > 0 ? currentTimeSafe : 0}
                                disabled={!seekEnabled}
                                onChange={(e) => seek(Number(e.target.value))}
                                aria-label={labels.progress}
                                aria-valuetext={`${formatTime(currentTimeSafe)} / ${formatTime(durationSafe)}`}
                                className={`player-slider absolute inset-0 block w-full cursor-pointer bg-transparent disabled:cursor-not-allowed ${ultraCompactMode ? 'player-slider--compact' : ''} ${seekEnabled ? 'opacity-100' : 'opacity-55'}`}
                            />
                        </div>
                    </div>

                    <div className={`flex items-center justify-end ${showVolumeSlider ? 'gap-3 min-w-[152px]' : 'min-w-[40px]'}`}>
                        <button
                            type="button"
                            onClick={toggleMute}
                            disabled={!transportEnabled}
                            aria-label={muted ? labels.unmute : labels.mute}
                            title={muted ? labels.unmute : labels.mute}
                            className={iconButtonClass}
                            style={iconButtonStyle}
                        >
                            {muted ? <MdVolumeOff size={compactMode ? 18 : 20} /> : <MdVolumeUp size={compactMode ? 18 : 20} />}
                        </button>
                        {showVolumeSlider && (
                            <div className="relative h-4 w-28">
                                <div
                                    className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full"
                                    style={{ background: progressTrackColor }}
                                />
                                <div
                                    className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full overflow-hidden transition-[width,opacity] duration-150 ease-out"
                                    style={{
                                        width: `${volume * 100}%`,
                                        background: accentBackground,
                                        boxShadow: `0 0 12px ${activeColor}44`,
                                        opacity: transportEnabled ? 1 : 0.55,
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-70" />
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    disabled={!transportEnabled}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    aria-label={labels.volume}
                                    className={`player-slider player-slider--volume absolute inset-0 h-4 w-full cursor-pointer bg-transparent disabled:cursor-not-allowed ${transportEnabled ? 'opacity-100' : 'opacity-55'}`}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerControlBar;
