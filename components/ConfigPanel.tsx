import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AppState, Metadata, VinylStyle, ParticleType, AppPreset, CoverArtStyle, Language, ThemeMode, ParticleDirection, SingerThemeGroup } from '../types';
import { MdClose, MdOpenInNew, MdInput } from 'react-icons/md';
import { translations } from '../utils/translations';
import { getThemeClasses } from '../utils/themeStyles';

import ConfigSidebar from './ConfigSidebar';
import ConfigPresets from './config/ConfigPresets';
import ConfigAppearance from './config/ConfigAppearance';
import ConfigCover from './config/ConfigCover';
import ConfigVisuals from './config/ConfigVisuals';
import ConfigLayout from './config/ConfigLayout';
import ConfigLyrics from './config/ConfigLyrics';
import ConfigDetails from './config/ConfigDetails';
import ConfigTypography from './config/ConfigTypography';
import ConfigAssets from './config/ConfigAssets';

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  isRestoringAssets: boolean;
  onFileChange: (type: any, file: File) => void;
  onFileRemove: (type: any) => void;
  onMetadataChange: (key: keyof Metadata, value: string) => void;
  onThemeChange: (color: string) => void;
  onColorfulColorsChange: (colors: string[]) => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  onColorfulBaseChange: (base: 'light' | 'dark') => void;
  onLyricSizeChange: (type: 'main' | 'sub', size: number) => void;
  onLyricBoldChange: (isBold: boolean) => void;
  onLyricOffsetChange: (offset: number) => void;
  onLyricGapToleranceChange: (tolerance: number) => void;
  onLyricColorChange: (key: any, value: any) => void;
  onLyricShadowChange: (key: 'enabled' | 'direction' | 'strength' | 'distance' | 'blur' | 'color', value: boolean | number | string | null) => void;
  onLyricLineConfigChange: (key: 'primaryIndex' | 'order', value: number | number[]) => void;
  onTrackTypographyChange: (field: any, prop: any, value: any) => void;
  onTrackInfoSizeChange: (key: any, value: any) => void;
  onVisualizerChange: (key: any, value: boolean) => void;
  onSensitivityChange: (target: 'vinyl' | 'bar', value: number) => void;
  onParticleSizeChange: (size: number) => void;
  onParticleBaseSpeedChange: (speed: number) => void;
  onParticleDensityChange: (density: number) => void;
  onClimaxDensitySensitivityChange: (sensitivity: number) => void;
  onClimaxDensityBoostStrengthChange: (strength: number) => void;
  onLayoutChange: (width: number) => void;
  onLayoutDimensionChange: (key: any, value: number) => void;
  onPlayerOpacityChange: (value: number) => void;
  onPlayerBarDimensionChange: (key: any, value: number) => void;
  onVinylStyleChange: (style: VinylStyle) => void;
  onVinylLabelSizeChange: (size: number) => void;
  onVinylCenterDotChange: (show: boolean) => void;
  onParticleTypeChange: (type: ParticleType) => void;
  onParticleDirectionChange: (direction: ParticleDirection) => void;
  onParticleColorChange: (color: string, useTheme: boolean) => void;
  onParticlePalettesChange: (palettes: string[][], useTheme: boolean) => void;
  onVinylScaleChange: (scale: number) => void;
  onVinylRotationSpeedChange: (speed: number) => void;
  onCoverConfigChange: (key: 'x' | 'y', value: number) => void;
  onBackgroundConfigChange: (key: 'scale' | 'x' | 'y', value: number) => void;
  onWaveBarConfigChange?: (key: any, value: number) => void;
  onCoverArtStyleChange: (style: CoverArtStyle) => void;
  onAlbumProgressConfigChange: (key: any, value: any) => void;
  presets: AppPreset[];
  onApplyPreset: (preset: AppPreset) => void;
  onSavePreset: (name: string, idToOverwrite?: string) => void;
  onDeletePreset: (id: string) => void;
  onLanguageChange: (lang: Language) => void;
  onSingerInfoConfigChange: (key: string, value: any) => void;
  onSingerThemeGroupsChange: (groups: SingerThemeGroup[]) => void;
  onForceOverrideChange: (value: boolean) => void;
  onConfigPanelLayoutChange: (key: 'sidebarWidth' | 'contentLeftPadding', value: number) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = (props) => {
  const { isOpen, onClose, appState, onLanguageChange, isRestoringAssets } = props;
  const [activeSection, setActiveSection] = useState('presets');
  const [isDetached, setIsDetached] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const dragTypeRef = useRef<'sidebar' | 'content' | null>(null);
  const detachedWindowRef = useRef<Window | null>(null);
  const detachedContainerRef = useRef<HTMLDivElement | null>(null);
  const detachedCloseModeRef = useRef<'close' | 'dock' | null>(null);

  const t = (translations as any)[appState.language];
  const themeClasses = getThemeClasses(appState);
  const sidebarWidth = Math.max(60, Math.min(340, appState.configSidebarWidth || 160));
  const contentLeftPadding = Math.max(0, Math.min(160, appState.configContentLeftPadding || 0));

  const toggleLanguage = () => onLanguageChange(appState.language === 'en' ? 'zh' : 'en');
  const scrollToSection = (id: string) => {
    const el = contentRef.current?.querySelector(`#section-${id}`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  const copyStylesToDetachedWindow = (targetWindow: Window) => {
    const sourceNodes = document.querySelectorAll('link[rel="stylesheet"], style');
    sourceNodes.forEach(node => {
      targetWindow.document.head.appendChild(node.cloneNode(true));
    });
  };

  const detachToWindow = () => {
    if (detachedWindowRef.current && !detachedWindowRef.current.closed) {
      detachedWindowRef.current.focus();
      setIsDetached(true);
      return;
    }

    const popout = window.open('', 'stardust_audio_player_config', 'width=980,height=900,left=120,top=80');
    if (!popout) return;

    popout.document.title = `${t.title} - StardustAudioPlayer`;
    popout.document.body.style.margin = '0';
    popout.document.body.style.height = '100vh';
    popout.document.body.style.overflow = 'hidden';
    copyStylesToDetachedWindow(popout);

    const root = popout.document.createElement('div');
    root.id = 'detached-config-root';
    root.style.width = '100%';
    root.style.height = '100%';
    popout.document.body.appendChild(root);

    popout.addEventListener('beforeunload', () => {
      const mode = detachedCloseModeRef.current;
      detachedCloseModeRef.current = null;
      detachedWindowRef.current = null;
      detachedContainerRef.current = null;
      setIsDetached(false);
      if (mode !== 'dock') onClose();
    });

    detachedWindowRef.current = popout;
    detachedContainerRef.current = root;
    setIsDetached(true);
    popout.focus();
  };

  const dockBackToMain = () => {
    if (!detachedWindowRef.current || detachedWindowRef.current.closed) {
      setIsDetached(false);
      return;
    }
    detachedCloseModeRef.current = 'dock';
    detachedWindowRef.current.close();
  };

  const closePanel = () => {
    if (isDetached && detachedWindowRef.current && !detachedWindowRef.current.closed) {
      detachedCloseModeRef.current = 'close';
      detachedWindowRef.current.close();
      return;
    }
    onClose();
  };

  useEffect(() => {
    if (!contentRef.current || !isOpen) return;
    const options = { root: contentRef.current, threshold: 0.2, rootMargin: '-10% 0px -70% 0px' };
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id.replace('section-', ''));
      });
    };
    observerRef.current = new IntersectionObserver(handleIntersect, options);
    ['presets', 'appearance', 'cover', 'visuals', 'layout', 'lyrics', 'details', 'typography', 'assets'].forEach(id => {
      const el = contentRef.current?.querySelector(`#section-${id}`);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [isOpen, isDetached]);

  useEffect(() => {
    const hostWindow = isDetached && detachedWindowRef.current ? detachedWindowRef.current : window;
    const hostDocument = hostWindow.document;

    const onMouseMove = (e: MouseEvent) => {
      if (!dragTypeRef.current) return;

      if (dragTypeRef.current === 'sidebar' && layoutRef.current) {
        const rect = layoutRef.current.getBoundingClientRect();
        const width = Math.max(60, Math.min(340, e.clientX - rect.left));
        props.onConfigPanelLayoutChange('sidebarWidth', Math.round(width));
      }

      if (dragTypeRef.current === 'content' && contentAreaRef.current) {
        const rect = contentAreaRef.current.getBoundingClientRect();
        const left = Math.max(0, Math.min(160, e.clientX - rect.left));
        props.onConfigPanelLayoutChange('contentLeftPadding', Math.round(left));
      }
    };

    const onMouseUp = () => {
      if (!dragTypeRef.current) return;
      dragTypeRef.current = null;
      hostDocument.body.style.cursor = '';
      hostDocument.body.style.userSelect = '';
    };

    hostWindow.addEventListener('mousemove', onMouseMove);
    hostWindow.addEventListener('mouseup', onMouseUp);
    return () => {
      hostWindow.removeEventListener('mousemove', onMouseMove);
      hostWindow.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDetached, props.onConfigPanelLayoutChange]);

  useEffect(() => {
    if (isOpen || !isDetached) return;
    if (detachedWindowRef.current && !detachedWindowRef.current.closed) {
      detachedCloseModeRef.current = 'dock';
      detachedWindowRef.current.close();
    }
    setIsDetached(false);
  }, [isOpen, isDetached]);

  useEffect(() => () => {
    if (detachedWindowRef.current && !detachedWindowRef.current.closed) {
      detachedCloseModeRef.current = 'dock';
      detachedWindowRef.current.close();
    }
  }, []);

  const panelBody = (
    <div className={`h-full ${themeClasses.panelBg} backdrop-blur-2xl border-l ${themeClasses.border} shadow-2xl flex flex-col`}>
      <div className={`flex-none flex justify-between items-center border-b ${themeClasses.border} p-6`}>
        <div>
          <h2 className={`font-display text-2xl font-light ${themeClasses.textMain}`}>{t.title}</h2>
          <p className={`text-[10px] ${themeClasses.textMuted} uppercase tracking-widest mt-0.5`}>{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={isDetached ? dockBackToMain : detachToWindow} className={`${themeClasses.iconMuted} ${themeClasses.iconColor} transition-colors p-2 rounded-full`} title={isDetached ? 'Dock back' : 'Pop out'}>
            {isDetached ? <MdInput size={20} /> : <MdOpenInNew size={20} />}
          </button>
          <button onClick={toggleLanguage} className={`${themeClasses.iconMuted} ${themeClasses.iconColor} transition-colors p-2 rounded-full flex items-center gap-1`}><span className="text-[10px] font-bold">{appState.language.toUpperCase()}</span></button>
          <button onClick={closePanel} className={`${themeClasses.iconMuted} ${themeClasses.iconColor} transition-colors p-2 rounded-full`}><MdClose size={24} /></button>
        </div>
      </div>
      <div ref={layoutRef} className="flex-1 flex min-h-0 overflow-hidden">
        <ConfigSidebar activeSection={activeSection} scrollToSection={scrollToSection} appState={appState} translations={t} width={sidebarWidth} />
        <div
          className={`hidden md:block w-2 cursor-col-resize ${themeClasses.itemBg} ${themeClasses.itemHover} transition-colors`}
          onMouseDown={() => {
            dragTypeRef.current = 'sidebar';
            const doc = isDetached && detachedWindowRef.current ? detachedWindowRef.current.document : document;
            doc.body.style.cursor = 'col-resize';
            doc.body.style.userSelect = 'none';
          }}
          title="Resize navigation width"
        />
        <div ref={contentAreaRef} className="relative flex-1 min-w-0">
          <div
            className="hidden md:block absolute top-0 bottom-0 w-2 cursor-col-resize z-20"
            style={{ left: `${contentLeftPadding}px` }}
            onMouseDown={() => {
              dragTypeRef.current = 'content';
              const doc = isDetached && detachedWindowRef.current ? detachedWindowRef.current.document : document;
              doc.body.style.cursor = 'col-resize';
              doc.body.style.userSelect = 'none';
            }}
            title="Adjust content left padding"
          >
            <div className={`mx-auto h-full w-px ${themeClasses.border}`} />
          </div>
          <div ref={contentRef} className="h-full overflow-y-auto config-panel-scroll p-6 md:p-8 scroll-smooth">
            <div className="space-y-12" style={{ paddingLeft: `${contentLeftPadding}px` }}>
              <ConfigPresets appState={appState} presets={props.presets} onApplyPreset={props.onApplyPreset} onSavePreset={props.onSavePreset} onDeletePreset={props.onDeletePreset} translations={t} />
              <ConfigAppearance appState={appState} onThemeModeChange={props.onThemeModeChange} onColorfulColorsChange={props.onColorfulColorsChange} onThemeChange={props.onThemeChange} onColorfulBaseChange={props.onColorfulBaseChange} onSingerThemeGroupsChange={props.onSingerThemeGroupsChange} onForceOverrideChange={props.onForceOverrideChange} translations={t} />
              <ConfigCover appState={appState} onCoverArtStyleChange={props.onCoverArtStyleChange} onAlbumProgressConfigChange={props.onAlbumProgressConfigChange} onVinylScaleChange={props.onVinylScaleChange} onVinylStyleChange={props.onVinylStyleChange} onVinylRotationSpeedChange={props.onVinylRotationSpeedChange} onVinylLabelSizeChange={props.onVinylLabelSizeChange} onVinylCenterDotChange={props.onVinylCenterDotChange} onSensitivityChange={props.onSensitivityChange} translations={t} />
              <ConfigVisuals appState={appState} onSensitivityChange={props.onSensitivityChange} onWaveBarConfigChange={props.onWaveBarConfigChange} onVisualizerChange={props.onVisualizerChange} onParticleSizeChange={props.onParticleSizeChange} onParticleBaseSpeedChange={props.onParticleBaseSpeedChange} onParticleDensityChange={props.onParticleDensityChange} onClimaxDensitySensitivityChange={props.onClimaxDensitySensitivityChange} onClimaxDensityBoostStrengthChange={props.onClimaxDensityBoostStrengthChange} onParticleTypeChange={props.onParticleTypeChange} onParticleDirectionChange={props.onParticleDirectionChange} onParticleColorChange={props.onParticleColorChange} onParticlePalettesChange={props.onParticlePalettesChange} translations={t} />
              <ConfigLayout appState={appState} onLayoutDimensionChange={props.onLayoutDimensionChange} onPlayerBarDimensionChange={props.onPlayerBarDimensionChange} onPlayerOpacityChange={props.onPlayerOpacityChange} onSingerInfoConfigChange={props.onSingerInfoConfigChange} translations={t} />
              <ConfigLyrics appState={appState} onLyricLineConfigChange={props.onLyricLineConfigChange} onLyricSizeChange={props.onLyricSizeChange} onLyricBoldChange={props.onLyricBoldChange} onLyricColorChange={props.onLyricColorChange} onLyricShadowChange={props.onLyricShadowChange} onLyricOffsetChange={props.onLyricOffsetChange} onLyricGapToleranceChange={props.onLyricGapToleranceChange} translations={t} />
              <ConfigDetails appState={appState} onMetadataChange={props.onMetadataChange} translations={t} />
              <ConfigTypography appState={appState} onTrackTypographyChange={props.onTrackTypographyChange} translations={t} />
              <ConfigAssets appState={appState} isRestoringAssets={isRestoringAssets} onFileChange={props.onFileChange} onFileRemove={props.onFileRemove} onCoverConfigChange={props.onCoverConfigChange} onBackgroundConfigChange={props.onBackgroundConfigChange} translations={t} />
              <div className="h-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!isDetached && (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={closePanel} />
      )}
      {!isDetached && (
        <div className={`fixed inset-y-0 right-0 w-full sm:w-[500px] md:w-[800px] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {panelBody}
        </div>
      )}
      {isOpen && isDetached && detachedContainerRef.current && createPortal(<div className="w-full h-full">{panelBody}</div>, detachedContainerRef.current)}
    </>
  );
};

export default ConfigPanel;
