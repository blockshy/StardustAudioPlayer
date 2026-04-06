
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
export type ParticleType = 'circle' | 'sakura' | 'snowflake' | 'star';
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

  themeColor: string;
  metadata: Metadata;
  lyricFontSizeMain: number;
  lyricFontSizeSub: number;
  lyricBold: boolean; 
  lyricOffset: number; 
  lyricGapTolerance: number; 
  lyricActiveColor: string | null; 
  lyricInactiveColor: string | null; 
  lyricStrokeWidth: number; 
  lyricStrokeColor: string;
  lyricPrimaryLineIndex: number; 
  lyricDisplayOrder: number[]; 
  
  activeLyricEffect: LyricEffect; 
  activeLyricStreamerColor: string;
  
  trackTitleSize: number;
  trackTitleColor: string | null;
  trackTitleBold: boolean;
  trackTitleItalic: boolean;

  trackArtistSize: number;
  trackArtistColor: string | null;
  trackArtistBold: boolean;
  trackArtistItalic: boolean;

  trackAlbumSize: number;
  trackAlbumColor: string | null;
  trackAlbumBold: boolean;
  trackAlbumItalic: boolean;

  trackVisualArtistSize: number;
  trackVisualArtistColor: string | null;
  trackVisualArtistBold: boolean;
  trackVisualArtistItalic: boolean;

  trackCoverSingerSize: number; 
  trackCoverSingerColor: string | null;
  trackCoverSingerBold: boolean;
  trackCoverSingerItalic: boolean;

  enableWaves: boolean;
  enableParticles: boolean;
  enableParticleBeatSync: boolean; 
  particleType: ParticleType;
  particleDirection: ParticleDirection;
  particleColor: string;
  particlePalettes: string[][]; // Multi-color gradient support
  useThemeColorForParticles: boolean;

  vinylSensitivity: number;
  barSensitivity: number;
  particleSensitivity: number;
  particleSize: number; 
  particleBaseSpeed: number; 
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

  coverArtStyle: CoverArtStyle; 
  enableAlbumProgress: boolean; 
  albumProgressWidth: number;   
  albumProgressOpacity: number; 

  vinylStyle: VinylStyle;
  vinylLabelSize: number; 
  showVinylCenterDot: boolean;
  vinylScale: number; 
  vinylRotationSpeed: number; 
  
  enableWaterReflection: boolean;
  lyricEffect: 'none' | 'glow' | 'neon' | 'gradient' | 'retro' | 'fluid' | 'metal' | 'ink' | 'glitch' | 'particles';

}

export interface AudioContextState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  analyser: AnalyserNode | null;
}

export interface AppPreset {
  id: string;
  name: string;
  isDefault?: boolean;
  config: Partial<AppState>;
}
