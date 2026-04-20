
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppState, Metadata, VinylStyle, ParticleType, AppPreset, Language, ParticleDirection, LyricEffect, SingerInfoLine } from './types';
import { parseSRT, parseSingerSRT } from './utils/srtParser';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import AlbumArt from './components/AlbumArt';
import LyricsDisplay from './components/LyricsDisplay';
import ConfigPanel from './components/ConfigPanel';
import GlobalParticles from './components/GlobalParticles';
import { extractDominantColor } from './utils/colorUtils';
import { DEFAULT_STATE, DEFAULT_PRESETS, CONFIG_KEYS } from './constants';
import BackgroundLayer from './components/BackgroundLayer';
import TopHeader from './components/TopHeader';
import TrackInfo from './components/TrackInfo';
import PlayerControlBar from './components/PlayerControlBar';
import { loadPersistedAsset, PersistedAssetType, PERSISTED_ASSET_TYPES, removePersistedAsset, savePersistedAsset } from './utils/persistedAssets';

const App: React.FC = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  const [appState, setAppState] = useState<AppState>(() => {
    try {
        const saved = localStorage.getItem('vinyl_vibe_settings_v3');
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...DEFAULT_STATE,
                ...parsed,
                audioFile: null, audioUrl: null, coverFile: null, coverUrl: null,
                backgroundImageFile: null, backgroundImageUrl: null,
                srtFile: null, singerSrtFile: null, lyrics: [], singerLyrics: []
            };
        }
    } catch (e) {}
    return DEFAULT_STATE;
  });

  const [customPresets, setCustomPresets] = useState<AppPreset[]>(() => {
      try {
          const saved = localStorage.getItem('vinyl_vibe_presets');
          return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
  });
  const [isRestoringAssets, setIsRestoringAssets] = useState(false);
  const appStateRef = useRef(appState);

  const {
    isPlaying,
    isReady,
    isBuffering,
    currentTime,
    duration,
    volume,
    muted,
    error: audioError,
    analyser,
    togglePlay,
    seek,
    setVolume,
    toggleMute
  } = useAudioPlayer(appState.audioUrl);

  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

  // --- Theme Color Lookahead Logic ---
  const lookaheadTime = 0.3; 
  
  /**
   * Helper function to find a singer segment with tolerance support
   */
  const findSingerWithTolerance = useCallback((time: number) => {
    const lyrics = appState.singerLyrics;
    if (lyrics.length === 0) return undefined;

    // 1. Direct match
    const directMatch = lyrics.find(s => time >= s.start && time <= s.end);
    if (directMatch) return directMatch;

    // 2. Gap tolerance check
    if (appState.singerLyricGapTolerance > 0) {
      for (let i = 0; i < lyrics.length - 1; i++) {
        const current = lyrics[i];
        const next = lyrics[i + 1];
        // If we are in the gap between current and next
        if (time > current.end && time < next.start) {
          const gapDuration = next.start - current.end;
          // If the gap is small enough, hold the current singer
          if (gapDuration <= appState.singerLyricGapTolerance) {
            return current;
          }
          break;
        }
      }
    }
    return undefined;
  }, [appState.singerLyrics, appState.singerLyricGapTolerance]);

  const activeSinger = useMemo(() => {
    const adjustedTime = currentTime - appState.singerLyricOffset;
    return findSingerWithTolerance(adjustedTime);
  }, [currentTime, appState.singerLyricOffset, findSingerWithTolerance]);

  const themeTargetSinger = useMemo(() => {
    const futureTime = currentTime - appState.singerLyricOffset + lookaheadTime;
    return findSingerWithTolerance(futureTime);
  }, [currentTime, appState.singerLyricOffset, findSingerWithTolerance]);

  const derivedColors = useMemo(() => {
    if (appState.themeMode === 'colorful' && themeTargetSinger) {
        const override = appState.singerThemeGroups.find(g => g.typeId === themeTargetSinger.typeId);
        if (override && override.colors.length > 0) {
            return override.colors;
        }
    }
    return appState.colorfulColors;
  }, [appState.themeMode, appState.colorfulColors, appState.singerThemeGroups, themeTargetSinger]);

  const activeThemeColor = useMemo(() => {
      if (appState.themeMode === 'colorful') return derivedColors[0] || appState.themeColor;
      return appState.themeColor;
  }, [appState.themeMode, appState.themeColor, derivedColors]);

  // Persistent AppState
  useEffect(() => {
    const persistable: Partial<AppState> = {};
    CONFIG_KEYS.forEach(key => {
      if (key in appState) {
        (persistable as any)[key] = appState[key];
      }
    });
    localStorage.setItem('vinyl_vibe_settings_v3', JSON.stringify(persistable));
  }, [appState]);

  useEffect(() => {
    localStorage.setItem('vinyl_vibe_presets', JSON.stringify(customPresets));
  }, [customPresets]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  const updateThemeColorFromUrl = useCallback((url: string) => {
    extractDominantColor(url)
      .then(color => setAppState(prev => ({ ...prev, themeColor: color })))
      .catch(() => undefined);
  }, []);

  const applyAssetFile = useCallback(async (
    type: PersistedAssetType,
    file: File,
    options: { persist?: boolean; allowEmbeddedCover?: boolean } = {}
  ) => {
    const { persist = true, allowEmbeddedCover = true } = options;
    const currentState = appStateRef.current;

    if (type === 'audio') {
      const url = URL.createObjectURL(file);
      if (currentState.audioUrl) URL.revokeObjectURL(currentState.audioUrl);
      setAppState(prev => ({
        ...prev,
        audioFile: file,
        audioUrl: url,
        metadata: { ...prev.metadata, title: file.name.replace(/\.[^/.]+$/, "") }
      }));

      if ((window as any).jsmediatags) {
        (window as any).jsmediatags.read(file, {
          onSuccess: (tag: any) => {
            const { title, artist, album, picture } = tag.tags;
            setAppState(prev => {
              const shouldUseEmbeddedCover = allowEmbeddedCover && !prev.coverFile && !!picture;
              let nextCoverUrl = prev.coverUrl;

              if (shouldUseEmbeddedCover) {
                if (prev.coverUrl) URL.revokeObjectURL(prev.coverUrl);
                const { data, format } = picture;
                const blob = new Blob([new Uint8Array(data)], { type: format });
                nextCoverUrl = URL.createObjectURL(blob);
                updateThemeColorFromUrl(nextCoverUrl);
              }

              return {
                ...prev,
                metadata: {
                  ...prev.metadata,
                  title: title || prev.metadata.title,
                  artist: artist || prev.metadata.artist,
                  album: album || prev.metadata.album
                },
                coverUrl: shouldUseEmbeddedCover ? nextCoverUrl : prev.coverUrl
              };
            });
          },
          onError: () => undefined
        });
      }
    } else if (type === 'cover') {
      const url = URL.createObjectURL(file);
      if (currentState.coverUrl) URL.revokeObjectURL(currentState.coverUrl);
      setAppState(prev => ({ ...prev, coverFile: file, coverUrl: url, coverImageX: 0, coverImageY: 0 }));
      updateThemeColorFromUrl(url);
    } else if (type === 'background') {
      const url = URL.createObjectURL(file);
      if (currentState.backgroundImageUrl) URL.revokeObjectURL(currentState.backgroundImageUrl);
      setAppState(prev => ({ ...prev, backgroundImageFile: file, backgroundImageUrl: url }));
    } else if (type === 'srt') {
      const content = await file.text();
      setAppState(prev => ({ ...prev, srtFile: file, lyrics: parseSRT(content) }));
    } else if (type === 'singerSrt') {
      const content = await file.text();
      setAppState(prev => ({ ...prev, singerSrtFile: file, singerLyrics: parseSingerSRT(content) }));
    }

    if (persist) {
      void savePersistedAsset(type, file).catch((error) => {
        console.warn(`Failed to persist ${type} asset.`, error);
      });
    }
  }, [updateThemeColorFromUrl]);

  const handleFileChange = useCallback((type: 'audio' | 'cover' | 'srt' | 'background' | 'customParticle' | 'singerSrt', file: File) => {
    if (type === 'customParticle') return;
    void applyAssetFile(type, file).catch((error) => {
      console.warn(`Failed to apply ${type} file.`, error);
    });
  }, [applyAssetFile]);

  const handleFileRemove = useCallback((type: 'audio' | 'cover' | 'srt' | 'background' | 'customParticle' | 'singerSrt') => {
    if (type !== 'customParticle') {
      void removePersistedAsset(type).catch((error) => {
        console.warn(`Failed to remove persisted ${type} asset.`, error);
      });
    }

    setAppState(prev => {
      const nextState = { ...prev };

      switch (type) {
        case 'audio':
          if (prev.audioUrl) URL.revokeObjectURL(prev.audioUrl);
          nextState.audioFile = null;
          nextState.audioUrl = null;
          break;
        case 'cover':
          if (prev.coverUrl) URL.revokeObjectURL(prev.coverUrl);
          nextState.coverFile = null;
          nextState.coverUrl = null;
          nextState.coverImageX = DEFAULT_STATE.coverImageX;
          nextState.coverImageY = DEFAULT_STATE.coverImageY;
          break;
        case 'background':
          if (prev.backgroundImageUrl) URL.revokeObjectURL(prev.backgroundImageUrl);
          nextState.backgroundImageFile = null;
          nextState.backgroundImageUrl = null;
          nextState.backgroundImageScale = DEFAULT_STATE.backgroundImageScale;
          nextState.backgroundImageX = DEFAULT_STATE.backgroundImageX;
          nextState.backgroundImageY = DEFAULT_STATE.backgroundImageY;
          break;
        case 'srt':
          nextState.srtFile = null;
          nextState.lyrics = [];
          break;
        case 'singerSrt':
          nextState.singerSrtFile = null;
          nextState.singerLyrics = [];
          break;
      }

      return nextState;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const restoreAssets = async () => {
      setIsRestoringAssets(true);
      try {
        const restoredEntries = await Promise.all(
          PERSISTED_ASSET_TYPES.map(async (type) => {
            try {
              return [type, await loadPersistedAsset(type)] as const;
            } catch (error) {
              console.warn(`Failed to load persisted ${type} asset.`, error);
              return [type, null] as const;
            }
          })
        );

        if (cancelled) return;

        const restoredAssets = Object.fromEntries(restoredEntries) as Record<PersistedAssetType, File | null>;
        const hasPersistedCover = !!restoredAssets.cover;
        const restoreOrder: PersistedAssetType[] = ['audio', 'cover', 'background', 'srt', 'singerSrt'];

        for (const type of restoreOrder) {
          const file = restoredAssets[type];
          if (!file || cancelled) continue;

          try {
            await applyAssetFile(type, file, {
              persist: false,
              allowEmbeddedCover: type === 'audio' ? !hasPersistedCover : true,
            });
          } catch (error) {
            console.warn(`Failed to restore ${type} asset.`, error);
            await removePersistedAsset(type).catch(() => undefined);
          }
        }
      } finally {
        if (!cancelled) setIsRestoringAssets(false);
      }
    };

    void restoreAssets();

    return () => {
      cancelled = true;
    };
  }, [applyAssetFile]);

  useEffect(() => () => {
    if (appState.audioUrl) URL.revokeObjectURL(appState.audioUrl);
    if (appState.coverUrl) URL.revokeObjectURL(appState.coverUrl);
    if (appState.backgroundImageUrl) URL.revokeObjectURL(appState.backgroundImageUrl);
  }, [appState.audioUrl, appState.coverUrl, appState.backgroundImageUrl]);

  const handleSavePreset = useCallback((name: string, idToOverwrite?: string) => {
      const persistableConfig: Partial<AppState> = {};
      CONFIG_KEYS.forEach(key => { (persistableConfig as any)[key] = (appState as any)[key]; });
      if (idToOverwrite) setCustomPresets(prev => prev.map(p => p.id === idToOverwrite ? { ...p, name, config: persistableConfig } : p));
      else setCustomPresets(prev => [...prev, { id: `custom_${Date.now()}`, name, config: persistableConfig }]);
  }, [appState]);

  const isLightMode = appState.themeMode === 'light' || (appState.themeMode === 'colorful' && appState.colorfulThemeBase === 'light');
  const defaultLyricShadowColor = appState.themeMode === 'dark' ? '#ffffff' : '#000000';

  // Determine current effective override set
  const singerMappingActive = appState.themeMode === 'colorful' && themeTargetSinger && appState.forceOverrideSingerTheme;
  const currentSingerColors = singerMappingActive ? derivedColors : null;

  // Singer Info Specific Multi-color styles
  const singerInfoStyles = useMemo(() => {
    const colors = currentSingerColors || [activeThemeColor];
    const isGradient = colors.length > 1;
    const isVertical = appState.singerInfoOrientation === 'vertical';
    
    // Adjust gradient direction based on orientation
    const textGradDir = isVertical ? 'to bottom' : 'to right';

    return {
        topLine: {
            background: isGradient 
                ? `linear-gradient(to top, ${colors[0]}, ${colors[colors.length-1]}, transparent)`
                : `linear-gradient(to top, ${activeThemeColor}, transparent)`
        },
        bottomLine: {
            background: isGradient 
                ? `linear-gradient(to bottom, ${colors[0]}, ${colors[colors.length-1]}, transparent)`
                : `linear-gradient(to bottom, ${activeThemeColor}, transparent)`
        },
        text: isGradient ? {
            backgroundImage: `linear-gradient(${textGradDir}, ${colors.join(', ')})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
        } : {
            color: activeThemeColor
        }
    };
  }, [currentSingerColors, activeThemeColor, appState.singerInfoOrientation]);

  return (
    <div 
        className="relative w-full h-[100dvh] overflow-hidden font-sans transition-colors duration-1000 ease-in-out"
        style={{ backgroundColor: isLightMode ? '#f2f2f2' : '#050505' }}
    >
      <BackgroundLayer appState={{...appState, colorfulColors: derivedColors}} />
      
      <GlobalParticles
        analyser={analyser} isPlaying={isPlaying} currentTime={currentTime} themeColor={appState.themeColor} colorfulColors={derivedColors}
        enabled={appState.enableParticles} enableClimaxDensityBoost={appState.enableParticleClimaxDensityBoost} climaxDensitySensitivity={appState.climaxDensitySensitivity} climaxDensityBoostStrength={appState.climaxDensityBoostStrength}
        particleSize={appState.particleSize} particleBaseSpeed={appState.particleBaseSpeed} baseParticleDensity={appState.baseParticleDensity} particleType={appState.particleType}
        particleDirection={appState.particleDirection} particlePalettes={appState.particlePalettes} useThemeColor={appState.useThemeColorForParticles}
        themeMode={appState.themeMode}
        singerOverrideColors={currentSingerColors}
      />

      <div className={`relative z-10 flex flex-col h-full w-full max-w-[1920px] mx-auto`}>
        <TopHeader appState={appState} toggleTheme={() => setAppState(prev => ({...prev, themeMode: prev.themeMode === 'dark' ? 'light' : prev.themeMode === 'light' ? 'colorful' : 'dark'}))} setIsConfigOpen={setIsConfigOpen} />

        <div className="flex-1 mx-auto flex flex-col landscape:flex-row lg:flex-row items-center justify-center pb-24 min-h-0 w-[var(--content-width)] gap-[var(--gap-width)]" style={{'--content-width': `${appState.contentMaxWidth}%`, '--gap-width': `${appState.columnGapWidth}%`} as any}>
            <div className="w-[var(--album-width)] flex flex-col items-center justify-center shrink-0 z-10 transition-transform duration-500" style={{'--album-width': `${appState.albumColumnWidth}%`, transform: `translate(${appState.albumColumnX}%, ${appState.albumColumnY}%)`} as any}>
                <AlbumArt appState={{...appState, themeColor: activeThemeColor}} isPlaying={isPlaying} analyser={analyser} currentTime={currentTime} duration={duration} singerOverrideColors={currentSingerColors} />
                <TrackInfo appState={appState} displayTitle={appState.metadata.title || 'No Audio'} displayArtist={appState.metadata.artist || 'Unknown'} singerOverrideColors={currentSingerColors} />
            </div>

            <div className="w-[var(--lyrics-width)] h-[40vh] landscape:h-full lg:h-full relative min-h-0 transition-transform duration-500" style={{'--lyrics-width': `${appState.lyricsColumnWidth}%`, transform: `translate(${appState.lyricsColumnX}%, ${appState.lyricsColumnY}%)`} as any}>
                <div className="absolute inset-0">
                    <LyricsDisplay lyrics={appState.lyrics} currentTime={currentTime} themeColor={activeThemeColor} mainFontSize={appState.lyricFontSizeMain} subFontSize={appState.lyricFontSizeSub} themeMode={appState.themeMode} lyricOffset={appState.lyricOffset} lyricGapTolerance={appState.lyricGapTolerance} isBold={appState.lyricBold} activeColor={appState.lyricActiveColor} inactiveColor={appState.lyricInactiveColor} strokeWidth={appState.lyricStrokeWidth} strokeColor={appState.lyricStrokeColor} shadowEnabled={appState.lyricShadowEnabled} shadowDirection={appState.lyricShadowDirection} shadowStrength={appState.lyricShadowStrength} shadowDistance={appState.lyricShadowDistance} shadowBlur={appState.lyricShadowBlur} shadowColor={appState.lyricShadowColor || defaultLyricShadowColor} primaryLineIndex={appState.lyricPrimaryLineIndex} displayOrder={appState.lyricDisplayOrder} activeEffect={appState.activeLyricEffect} streamerColor={appState.activeLyricStreamerColor} singerOverrideColors={currentSingerColors} />
                </div>
                
                {appState.showSingerInfo && activeSinger && (
                    <div 
                        className={`absolute z-30 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col items-center pointer-events-none gap-4`}
                        style={{
                            right: `calc(0% - ${appState.singerInfoX}px)`,
                            top: `calc(50% + ${appState.singerInfoY}px)`,
                            transform: 'translateY(-50%)'
                        }}
                    >
                        <div 
                            className="w-[1.5px] h-12 md:h-16 transition-all duration-1000 ease-in-out animate-fade-in"
                            style={{ 
                                ...singerInfoStyles.topLine,
                                opacity: 0.7,
                                boxShadow: `0 0 10px ${activeThemeColor}44`
                            }}
                        />
                        <div 
                            className={`animate-fade-in transition-all duration-1000 ease-in-out select-none tracking-[0.2em] md:tracking-[0.4em]`}
                            style={{
                                ...singerInfoStyles.text,
                                fontSize: `${appState.singerInfoFontSize}px`,
                                fontWeight: 'bold',
                                writingMode: appState.singerInfoOrientation === 'vertical' ? 'vertical-rl' : 'horizontal-tb',
                                textShadow: isLightMode || (currentSingerColors && currentSingerColors.length > 1) ? 'none' : `0 0 15px ${activeThemeColor}66`
                            }}
                        >
                            {activeSinger.name}
                        </div>
                        <div 
                            className="w-[1.5px] h-12 md:h-16 transition-all duration-1000 ease-in-out animate-fade-in"
                            style={{ 
                                ...singerInfoStyles.bottomLine,
                                opacity: 0.7,
                                boxShadow: `0 0 10px ${activeThemeColor}44`
                            }}
                        />
                    </div>
                )}
            </div>
        </div>

        <PlayerControlBar
          appState={{...appState, themeColor: activeThemeColor, colorfulColors: derivedColors}}
          hasAudio={!!appState.audioUrl}
          isPlaying={isPlaying}
          isReady={isReady}
          isBuffering={isBuffering}
          audioError={audioError}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          muted={muted}
          analyser={analyser}
          togglePlay={togglePlay}
          toggleMute={toggleMute}
          skipBackward={() => seek(Math.max(0, currentTime - 10))}
          skipForward={() => seek(Math.min(duration, currentTime + 10))}
          setVolume={setVolume}
          seek={seek}
          singerOverrideColors={currentSingerColors}
        />

        <ConfigPanel 
          isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} appState={appState}
          isRestoringAssets={isRestoringAssets}
          onFileChange={handleFileChange} onFileRemove={handleFileRemove}
          onMetadataChange={(k, v) => setAppState(prev => ({...prev, metadata: {...prev.metadata, [k]: v}}))}
          onThemeChange={(c) => setAppState(prev => ({...prev, themeColor: c}))}
          onColorfulColorsChange={(c) => setAppState(prev => ({...prev, colorfulColors: c}))}
          onThemeModeChange={(m) => setAppState(prev => ({...prev, themeMode: m}))}
          onColorfulBaseChange={(b) => setAppState(prev => ({...prev, colorfulThemeBase: b}))}
          onLyricSizeChange={(t, s) => setAppState(prev => ({...prev, [t === 'main' ? 'lyricFontSizeMain' : 'lyricFontSizeSub']: s}))}
          onLyricBoldChange={(b) => setAppState(prev => ({...prev, lyricBold: b}))}
          onLyricOffsetChange={(o) => setAppState(prev => ({...prev, lyricOffset: o}))}
          onLyricGapToleranceChange={(t) => setAppState(prev => ({...prev, lyricGapTolerance: t}))}
          onLyricColorChange={(k, v) => setAppState(prev => ({...prev, [k === 'active' ? 'lyricActiveColor' : k === 'inactive' ? 'lyricInactiveColor' : k === 'stroke' ? 'lyricStrokeColor' : k === 'effect' ? 'activeLyricEffect' : k === 'streamerColor' ? 'activeLyricStreamerColor' : 'lyricStrokeWidth']: v}))}
          onLyricShadowChange={(k, v) => setAppState(prev => ({...prev, [k === 'enabled' ? 'lyricShadowEnabled' : k === 'direction' ? 'lyricShadowDirection' : k === 'strength' ? 'lyricShadowStrength' : k === 'distance' ? 'lyricShadowDistance' : k === 'blur' ? 'lyricShadowBlur' : 'lyricShadowColor']: v}))}
          onLyricLineConfigChange={(k, v) => setAppState(prev => ({...prev, [k === 'primaryIndex' ? 'lyricPrimaryLineIndex' : 'lyricDisplayOrder']: v}))}
          onTrackTypographyChange={(f, p, v) => setAppState(prev => ({...prev, [`${f}${p}`]: v}))}
          onTrackInfoSizeChange={() => {}}
          onVisualizerChange={(k, v) => setAppState(prev => ({...prev, [k]: v}))}
          onSensitivityChange={(t, v) => setAppState(prev => ({...prev, [t === 'vinyl' ? 'vinylSensitivity' : 'barSensitivity']: v}))}
          onParticleSizeChange={(s) => setAppState(prev => ({...prev, particleSize: s}))}
          onParticleBaseSpeedChange={(s) => setAppState(prev => ({...prev, particleBaseSpeed: s}))}
          onParticleDensityChange={(d) => setAppState(prev => ({...prev, baseParticleDensity: d}))}
          onClimaxDensitySensitivityChange={(s) => setAppState(prev => ({...prev, climaxDensitySensitivity: s}))}
          onClimaxDensityBoostStrengthChange={(s) => setAppState(prev => ({...prev, climaxDensityBoostStrength: s}))}
          onLayoutChange={(w) => setAppState(prev => ({...prev, contentMaxWidth: w}))}
          onLayoutDimensionChange={(k, v) => setAppState(prev => ({...prev, [k === 'total' ? 'contentMaxWidth' : k === 'album' ? 'albumColumnWidth' : k === 'lyrics' ? 'lyricsColumnWidth' : k === 'gap' ? 'columnGapWidth' : k === 'albumX' ? 'albumColumnX' : k === 'albumY' ? 'albumColumnY' : k === 'infoGap' ? 'albumInfoGap' : k === 'lyricsX' ? 'lyricsColumnX' : 'lyricsColumnY']: v}))}
          onPlayerOpacityChange={(v) => setAppState(prev => ({...prev, playerControlsOpacity: v}))}
          onPlayerBarDimensionChange={(k, v) => setAppState(prev => ({...prev, [k === 'width' ? 'playerBarWidth' : k === 'height' ? 'playerBarHeight' : k === 'blur' ? 'playerBarBlur' : k === 'x' ? 'playerBarPositionX' : 'playerBarPositionY']: v}))}
          onVinylStyleChange={(s) => setAppState(prev => ({...prev, vinylStyle: s}))}
          onVinylLabelSizeChange={(s) => setAppState(prev => ({...prev, vinylLabelSize: s}))}
          onVinylCenterDotChange={(s) => setAppState(prev => ({...prev, showVinylCenterDot: s}))}
          onParticleTypeChange={(t) => setAppState(prev => ({...prev, particleType: t}))}
          onParticleDirectionChange={(d) => setAppState(prev => ({...prev, particleDirection: d}))}
          onParticleColorChange={(c, u) => setAppState(prev => ({...prev, particleColor: c, useThemeColorForParticles: u}))}
          onParticlePalettesChange={(p, u) => setAppState(prev => ({...prev, particlePalettes: p, useThemeColorForParticles: u}))}
          onVinylScaleChange={(s) => setAppState(prev => ({...prev, vinylScale: s}))}
          onVinylRotationSpeedChange={(s) => setAppState(prev => ({...prev, vinylRotationSpeed: s}))}
          onCoverConfigChange={(k, v) => setAppState(prev => ({...prev, [k === 'x' ? 'coverImageX' : 'coverImageY']: v}))}
          onBackgroundConfigChange={(k, v) => setAppState(prev => ({...prev, [k === 'scale' ? 'backgroundImageScale' : k === 'x' ? 'backgroundImageX' : 'backgroundImageY']: v}))}
          onWaveBarConfigChange={(k, v) => setAppState(prev => ({...prev, [k === 'scale' ? 'waveBarScale' : k === 'x' ? 'waveBarPositionX' : k === 'y' ? 'waveBarPositionY' : k === 'blur' ? 'waveBarBlur' : k === 'height' ? 'waveBarHeight' : 'waveBarOpacity']: v}))}
          onCoverArtStyleChange={(s) => setAppState(prev => ({...prev, coverArtStyle: s}))}
          onAlbumProgressConfigChange={(k, v) => setAppState(prev => ({...prev, [k === 'enable' ? 'enableAlbumProgress' : k === 'width' ? 'albumProgressWidth' : 'albumProgressOpacity']: v}))}
          presets={[...DEFAULT_PRESETS, ...customPresets]}
          onApplyPreset={(p) => setAppState(prev => ({...prev, ...p.config}))}
          onSavePreset={handleSavePreset}
          onDeletePreset={(id) => setCustomPresets(prev => prev.filter(p => p.id !== id))}
          onLanguageChange={(l) => setAppState(prev => ({...prev, language: l}))}

          // Singer Info Event Handlers
          onSingerInfoConfigChange={(key, value) => setAppState(prev => ({ ...prev, [key]: value }))}
          onSingerThemeGroupsChange={(groups) => setAppState(prev => ({ ...prev, singerThemeGroups: groups }))}
          onForceOverrideChange={(v) => setAppState(prev => ({ ...prev, forceOverrideSingerTheme: v }))}
          onConfigPanelLayoutChange={(k, v) => setAppState(prev => ({ ...prev, [k === 'sidebarWidth' ? 'configSidebarWidth' : 'configContentLeftPadding']: v }))}
        />
      </div>
    </div>
  );
};

export default App;
