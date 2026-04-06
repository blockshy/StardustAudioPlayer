
import React, { useState, useRef, useEffect } from 'react';
import { AppState, Metadata, VinylStyle, ParticleType, AppPreset, CoverArtStyle, Language, ThemeMode, ParticleDirection, LyricEffect, SingerThemeGroup } from '../types';
import { MdClose } from 'react-icons/md';
import { translations } from '../utils/translations';
import { getThemeClasses } from '../utils/themeStyles';

import ConfigSidebar from './ConfigSidebar';
import ConfigPresets from './config/ConfigPresets';
import ConfigAppearance from './config/ConfigAppearance';
import ConfigCover from './config/ConfigCover';
import ConfigVisuals from './config/ConfigVisuals';
import ConfigLayout from './config/ConfigLayout';
import ConfigDetails from './config/ConfigDetails';
import ConfigTypography from './config/ConfigTypography';
import ConfigAssets from './config/ConfigAssets';

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
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
  onLyricLineConfigChange: (key: 'primaryIndex' | 'order', value: number | number[]) => void;
  onTrackTypographyChange: (field: any, prop: any, value: any) => void;
  onTrackInfoSizeChange: (key: any, value: any) => void; 
  onVisualizerChange: (key: any, value: boolean) => void;
  onSensitivityChange: (target: 'vinyl' | 'bar' | 'particle', value: number) => void;
  onParticleSizeChange: (size: number) => void;
  onParticleBaseSpeedChange: (speed: number) => void;
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
}

const ConfigPanel: React.FC<ConfigPanelProps> = (props) => {
  const { isOpen, onClose, appState, onLanguageChange } = props;
  const [activeSection, setActiveSection] = useState('presets');
  const contentRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const t = (translations as any)[appState.language];
  const themeClasses = getThemeClasses(appState);

  const toggleLanguage = () => onLanguageChange(appState.language === 'en' ? 'zh' : 'en');
  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection(id);
    }
  };

  useEffect(() => {
    if (!contentRef.current) return;
    const options = { root: contentRef.current, threshold: 0.2, rootMargin: '-10% 0px -70% 0px' };
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id.replace('section-', '')); });
    };
    observerRef.current = new IntersectionObserver(handleIntersect, options);
    ['presets', 'appearance', 'cover', 'visuals', 'layout', 'details', 'typography', 'assets'].forEach(id => {
        const el = document.getElementById(`section-${id}`);
        if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [isOpen]);

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[500px] md:w-[800px] ${themeClasses.panelBg} backdrop-blur-2xl border-l ${themeClasses.border} shadow-2xl transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className={`flex-none flex justify-between items-center border-b ${themeClasses.border} p-6`}>
            <div>
                <h2 className={`font-display text-2xl font-light ${themeClasses.textMain}`}>{t.title}</h2>
                <p className={`text-[10px] ${themeClasses.textMuted} uppercase tracking-widest mt-0.5`}>{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={toggleLanguage} className={`${themeClasses.iconMuted} hover:${themeClasses.iconColor} transition-colors p-2 rounded-full flex items-center gap-1`}><span className="text-[10px] font-bold">{appState.language.toUpperCase()}</span></button>
                <button onClick={onClose} className={`${themeClasses.iconMuted} hover:${themeClasses.iconColor} transition-colors p-2 rounded-full`}><MdClose size={24} /></button>
            </div>
          </div>
          <div className="flex-1 flex min-h-0 overflow-hidden">
              <ConfigSidebar activeSection={activeSection} scrollToSection={scrollToSection} appState={appState} translations={t} />
              <div ref={contentRef} className="flex-1 overflow-y-auto config-panel-scroll p-6 md:p-8 space-y-12 scroll-smooth">
                  <ConfigPresets appState={appState} presets={props.presets} onApplyPreset={props.onApplyPreset} onSavePreset={props.onSavePreset} onDeletePreset={props.onDeletePreset} translations={t} />
                  <ConfigAppearance appState={appState} onThemeModeChange={props.onThemeModeChange} onColorfulColorsChange={props.onColorfulColorsChange} onThemeChange={props.onThemeChange} onColorfulBaseChange={props.onColorfulBaseChange} onSingerThemeGroupsChange={props.onSingerThemeGroupsChange} onForceOverrideChange={props.onForceOverrideChange} translations={t} />
                  <ConfigCover appState={appState} onCoverArtStyleChange={props.onCoverArtStyleChange} onAlbumProgressConfigChange={props.onAlbumProgressConfigChange} onVinylScaleChange={props.onVinylScaleChange} onVinylStyleChange={props.onVinylStyleChange} onVinylRotationSpeedChange={props.onVinylRotationSpeedChange} onVinylLabelSizeChange={props.onVinylLabelSizeChange} onVinylCenterDotChange={props.onVinylCenterDotChange} onSensitivityChange={props.onSensitivityChange} translations={t} />
                  <ConfigVisuals appState={appState} onSensitivityChange={props.onSensitivityChange} onWaveBarConfigChange={props.onWaveBarConfigChange} onVisualizerChange={props.onVisualizerChange} onParticleSizeChange={props.onParticleSizeChange} onParticleBaseSpeedChange={props.onParticleBaseSpeedChange} onParticleTypeChange={props.onParticleTypeChange} onParticleDirectionChange={props.onParticleDirectionChange} onParticleColorChange={props.onParticleColorChange} onParticlePalettesChange={props.onParticlePalettesChange} translations={t} />
                  <ConfigLayout appState={appState} onLayoutDimensionChange={props.onLayoutDimensionChange} onPlayerBarDimensionChange={props.onPlayerBarDimensionChange} onPlayerOpacityChange={props.onPlayerOpacityChange} onLyricLineConfigChange={props.onLyricLineConfigChange} onLyricSizeChange={props.onLyricSizeChange} onLyricBoldChange={props.onLyricBoldChange} onLyricColorChange={props.onLyricColorChange} onLyricOffsetChange={props.onLyricOffsetChange} onLyricGapToleranceChange={props.onLyricGapToleranceChange} onSingerInfoConfigChange={props.onSingerInfoConfigChange} translations={t} />
                  <ConfigDetails appState={appState} onMetadataChange={props.onMetadataChange} translations={t} />
                  <ConfigTypography appState={appState} onTrackTypographyChange={props.onTrackTypographyChange} translations={t} />
                  <ConfigAssets appState={appState} onFileChange={props.onFileChange} onFileRemove={props.onFileRemove} onBackgroundConfigChange={props.onBackgroundConfigChange} translations={t} />
                  <div className="h-20"></div>
              </div>
          </div>
      </div>
    </>
  );
};

export default ConfigPanel;
