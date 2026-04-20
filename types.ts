
export interface LyricLine {
  start: number; // seconds
  end: number; // seconds
  content: string[];
}

export interface SingerInfoLine {
  start: number;
  end: number;
  name: string;
  typeId: number;
}

export interface SingerThemeGroup {
  typeId: number;
  colors: string[];
}

export interface Metadata {
  title: string;
  artist: string;
  album: string;
  visualArtist?: string;
  coverSinger?: string;
  playerTitle?: string;
  playerSubtitle?: string;
}

export type VinylStyle = 'classic' | 'vintage' | 'modern' | 'neon';
export type ParticleType =
  | 'circle'
  | 'sakura'
  | 'snowflake'
  | 'star'
  | 'lily'
  | 'rose'
  | 'dandelion'
  | 'peach'
  | 'chrysanthemum'
  | 'begonia';
export type ParticleDirection = number;
export type ThemeMode = 'dark' | 'light' | 'colorful';
export type CoverArtStyle = 'vinyl' | '3d-card';
export type LyricEffect = 'none' | 'fluid' | 'underline';
export type Language = 'en' | 'zh';

export interface AppState {
  language: Language; 
  themeMode: ThemeMode; 
  colorfulThemeBase: 'light' | 'dark';
  colorfulColors: string[]; 
  audioFile: File | null;
  audioUrl: string | null;
  coverFile: File | null;
  coverUrl: string | null;
  coverImageX: number;
  coverImageY: number;
  backgroundImageFile: File | null; 
  backgroundImageUrl: string | null;
  backgroundImageScale: number; 
  backgroundImageX: number; 
  backgroundImageY: number; 
  srtFile: File | null;
  lyrics: LyricLine[];

  // Singer Info Features
  singerSrtFile: File | null;
  singerLyrics: SingerInfoLine[];
  singerInfoFontSize: number;
  singerInfoOrientation: 'vertical' | 'horizontal';
  singerInfoX: number;
  singerInfoY: number;
  singerThemeGroups: SingerThemeGroup[];
  showSingerInfo: boolean;
  forceOverrideSingerTheme: boolean;
  singerLyricOffset: number;
  singerLyricGapTolerance: number;
  configSidebarWidth: number;
  configContentLeftPadding: number;

  themeColor: string;
  metadata: Metadata;
  lyricFontSizeMain: number;
  lyricFontSizeSub: number;
  lyricActiveSizeCompensation: number;
  lyricBold: boolean; 
  lyricOffset: number; 
  lyricGapTolerance: number; 
  lyricActiveColor: string | null; 
  lyricInactiveColor: string | null; 
  lyricStrokeWidth: number; 
  lyricStrokeColor: string;
  lyricInactiveBlurEnabled: boolean;
  lyricInactiveBlurStrength: number;
  lyricShadowEnabled: boolean;
  lyricShadowDirection: number;
  lyricShadowStrength: number;
  lyricShadowDistance: number;
  lyricShadowBlur: number;
  lyricShadowColor: string | null;
  lyricPrimaryLineIndex: number; 
  lyricDisplayOrder: number[]; 
  
  activeLyricEffect: LyricEffect; 
  activeLyricStreamerColor: string;
  
  trackTitleSize: number;
  trackTitleColor: string | null;
  trackTitleBold: boolean;
  trackTitleItalic: boolean;
  trackTitleShadowEnabled: boolean;
  trackTitleShadowDirection: number;
  trackTitleShadowStrength: number;
  trackTitleShadowDistance: number;
  trackTitleShadowBlur: number;
  trackTitleShadowColor: string | null;

  trackArtistSize: number;
  trackArtistColor: string | null;
  trackArtistBold: boolean;
  trackArtistItalic: boolean;
  trackArtistShadowEnabled: boolean;
  trackArtistShadowDirection: number;
  trackArtistShadowStrength: number;
  trackArtistShadowDistance: number;
  trackArtistShadowBlur: number;
  trackArtistShadowColor: string | null;

  trackAlbumSize: number;
  trackAlbumColor: string | null;
  trackAlbumBold: boolean;
  trackAlbumItalic: boolean;
  trackAlbumShadowEnabled: boolean;
  trackAlbumShadowDirection: number;
  trackAlbumShadowStrength: number;
  trackAlbumShadowDistance: number;
  trackAlbumShadowBlur: number;
  trackAlbumShadowColor: string | null;

  trackVisualArtistSize: number;
  trackVisualArtistColor: string | null;
  trackVisualArtistBold: boolean;
  trackVisualArtistItalic: boolean;
  trackVisualArtistShadowEnabled: boolean;
  trackVisualArtistShadowDirection: number;
  trackVisualArtistShadowStrength: number;
  trackVisualArtistShadowDistance: number;
  trackVisualArtistShadowBlur: number;
  trackVisualArtistShadowColor: string | null;

  trackCoverSingerSize: number; 
  trackCoverSingerColor: string | null;
  trackCoverSingerBold: boolean;
  trackCoverSingerItalic: boolean;
  trackCoverSingerShadowEnabled: boolean;
  trackCoverSingerShadowDirection: number;
  trackCoverSingerShadowStrength: number;
  trackCoverSingerShadowDistance: number;
  trackCoverSingerShadowBlur: number;
  trackCoverSingerShadowColor: string | null;

  enableWaves: boolean;
  enableParticles: boolean;
  enableParticleClimaxDensityBoost: boolean;
  particleType: ParticleType;
  particleDirection: ParticleDirection;
  particleColor: string;
  particlePalettes: string[][]; // Multi-color gradient support
  useThemeColorForParticles: boolean;

  vinylSensitivity: number;
  barSensitivity: number;
  particleSize: number; 
  particleBaseSpeed: number; 
  baseParticleDensity: number;
  climaxDensitySensitivity: number;
  climaxDensityBoostStrength: number;
  contentMaxWidth: number; 
  albumColumnWidth: number; 
  lyricsColumnWidth: number; 
  columnGapWidth: number; 
  albumColumnX: number; 
  albumColumnY: number; 
  albumInfoGap: number; 
  lyricsColumnX: number; 
  lyricsColumnY: number; 
  playerControlsOpacity: number;
  playerBarWidth: number; 
  playerBarHeight: number; 
  playerBarBlur: number; 
  playerBarPositionX: number; 
  playerBarPositionY: number; 
  
  waveBarScale: number; 
  waveBarPositionX: number; 
  waveBarPositionY: number; 
  waveBarBlur: number; 
  waveBarOpacity: number; 
  waveBarHeight: number;
  waveBarFlowSpeed: number;
  waveBarTurbulence: number;
  waveBarIdleMotion: number;

  coverArtStyle: CoverArtStyle; 
  enableAlbumProgress: boolean; 
  albumProgressWidth: number;   
  albumProgressOpacity: number; 

  vinylStyle: VinylStyle;
  vinylLabelSize: number; 
  showVinylCenterDot: boolean;
  vinylScale: number; 
  vinylRotationSpeed: number; 
  lyricEffect: 'none' | 'glow' | 'neon' | 'gradient' | 'retro' | 'fluid' | 'metal' | 'ink' | 'glitch' | 'particles';

}

export interface AudioContextState {
  isPlaying: boolean;
  isReady: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  error: string | null;
  analyser: AnalyserNode | null;
}

export interface AppPreset {
  id: string;
  name: string;
  isDefault?: boolean;
  config: Partial<AppState>;
}
