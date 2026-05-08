import { AppState, CoverArtStyle, Language, LyricEffect, ParticleType, ThemeMode, VinylStyle } from './types';

type PersistableStateKey = keyof AppState;
type LegacyPersistedKey = 'waveBarScale' | 'waveBarPositionX' | 'waveBarPositionY' | 'lyricEffect';
type PersistedInput = Partial<Record<PersistableStateKey | LegacyPersistedKey, unknown>>;

const appearanceKeys = [
  'language',
  'themeMode',
  'colorfulThemeBase',
  'colorfulColors',
  'themeColor',
  'metadata',
] as const satisfies readonly PersistableStateKey[];

const lyricKeys = [
  'lyricFontSizeMain',
  'lyricFontSizeSub',
  'lyricActiveSizeCompensation',
  'lyricBold',
  'lyricOffset',
  'lyricGapTolerance',
  'lyricActiveColor',
  'lyricInactiveColor',
  'lyricStrokeWidth',
  'lyricStrokeColor',
  'lyricInactiveBlurEnabled',
  'lyricInactiveBlurStrength',
  'lyricShadowEnabled',
  'lyricShadowDirection',
  'lyricShadowStrength',
  'lyricShadowDistance',
  'lyricShadowBlur',
  'lyricShadowColor',
  'lyricPrimaryLineIndex',
  'lyricDisplayOrder',
  'activeLyricEffect',
  'activeLyricStreamerColor',
] as const satisfies readonly PersistableStateKey[];

const trackTypographyKeys = [
  'trackTitleSize',
  'trackTitleColor',
  'trackTitleBold',
  'trackTitleItalic',
  'trackTitleShadowEnabled',
  'trackTitleShadowDirection',
  'trackTitleShadowStrength',
  'trackTitleShadowDistance',
  'trackTitleShadowBlur',
  'trackTitleShadowColor',
  'trackArtistSize',
  'trackArtistColor',
  'trackArtistBold',
  'trackArtistItalic',
  'trackArtistShadowEnabled',
  'trackArtistShadowDirection',
  'trackArtistShadowStrength',
  'trackArtistShadowDistance',
  'trackArtistShadowBlur',
  'trackArtistShadowColor',
  'trackAlbumSize',
  'trackAlbumColor',
  'trackAlbumBold',
  'trackAlbumItalic',
  'trackAlbumShadowEnabled',
  'trackAlbumShadowDirection',
  'trackAlbumShadowStrength',
  'trackAlbumShadowDistance',
  'trackAlbumShadowBlur',
  'trackAlbumShadowColor',
  'trackVisualArtistSize',
  'trackVisualArtistColor',
  'trackVisualArtistBold',
  'trackVisualArtistItalic',
  'trackVisualArtistShadowEnabled',
  'trackVisualArtistShadowDirection',
  'trackVisualArtistShadowStrength',
  'trackVisualArtistShadowDistance',
  'trackVisualArtistShadowBlur',
  'trackVisualArtistShadowColor',
  'trackCoverSingerSize',
  'trackCoverSingerColor',
  'trackCoverSingerBold',
  'trackCoverSingerItalic',
  'trackCoverSingerShadowEnabled',
  'trackCoverSingerShadowDirection',
  'trackCoverSingerShadowStrength',
  'trackCoverSingerShadowDistance',
  'trackCoverSingerShadowBlur',
  'trackCoverSingerShadowColor',
] as const satisfies readonly PersistableStateKey[];

const visualKeys = [
  'enableWaves',
  'enableParticles',
  'enableParticleClimaxDensityBoost',
  'particleType',
  'particleDirection',
  'particleColor',
  'particlePalettes',
  'useThemeColorForParticles',
  'vinylSensitivity',
  'barSensitivity',
  'particleSize',
  'particleBaseSpeed',
  'baseParticleDensity',
  'climaxDensitySensitivity',
  'climaxDensityBoostStrength',
  'waveBarAmplitude',
  'waveBarWaterLevel',
  'waveBarBlur',
  'waveBarOpacity',
  'waveBarHeight',
  'waveBarFlowSpeed',
  'waveBarTurbulence',
  'waveBarIdleMotion',
] as const satisfies readonly PersistableStateKey[];

const layoutKeys = [
  'contentMaxWidth',
  'albumColumnWidth',
  'lyricsColumnWidth',
  'columnGapWidth',
  'albumColumnX',
  'albumColumnY',
  'albumInfoGap',
  'lyricsColumnX',
  'lyricsColumnY',
  'playerControlsOpacity',
  'playerBarWidth',
  'playerBarHeight',
  'playerBarBlur',
  'playerBarPositionX',
  'playerBarPositionY',
  'configSidebarWidth',
  'configContentLeftPadding',
] as const satisfies readonly PersistableStateKey[];

const coverKeys = [
  'coverArtStyle',
  'enableAlbumProgress',
  'albumProgressWidth',
  'albumProgressOpacity',
  'vinylStyle',
  'vinylLabelSize',
  'showVinylCenterDot',
  'vinylScale',
  'vinylRotationSpeed',
  'coverImageX',
  'coverImageY',
  'backgroundImageScale',
  'backgroundImageX',
  'backgroundImageY',
] as const satisfies readonly PersistableStateKey[];

const singerKeys = [
  'singerInfoFontSize',
  'singerInfoOrientation',
  'singerInfoX',
  'singerInfoY',
  'singerThemeGroups',
  'showSingerInfo',
  'forceOverrideSingerTheme',
  'singerLyricOffset',
  'singerLyricGapTolerance',
] as const satisfies readonly PersistableStateKey[];

export const PERSISTABLE_STATE_KEY_GROUPS = {
  appearance: appearanceKeys,
  lyrics: lyricKeys,
  trackTypography: trackTypographyKeys,
  visuals: visualKeys,
  layout: layoutKeys,
  cover: coverKeys,
  singer: singerKeys,
} as const;

export const PERSISTABLE_STATE_KEYS = Object.values(PERSISTABLE_STATE_KEY_GROUPS)
  .flat() as PersistableStateKey[];

const persistableKeySet = new Set<PersistableStateKey>(PERSISTABLE_STATE_KEYS);

const cloneJsonSafe = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const isRecord = (value: unknown): value is Record<string, unknown> => (
  !!value && typeof value === 'object' && !Array.isArray(value)
);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeNumber = (value: unknown, min: number, max: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return clamp(value, min, max);
};

const normalizeInteger = (value: unknown, min: number, max: number) => {
  const normalized = normalizeNumber(value, min, max);
  return normalized === undefined ? undefined : Math.round(normalized);
};

const normalizeBoolean = (value: unknown) => (
  typeof value === 'boolean' ? value : undefined
);

const hexColorPattern = /^#[0-9a-f]{6}$/i;

const normalizeColor = (value: unknown) => (
  typeof value === 'string' && hexColorPattern.test(value) ? value : undefined
);

const normalizeNullableColor = (value: unknown) => (
  value === null ? null : normalizeColor(value)
);

const normalizeString = (value: unknown, maxLength = 200) => (
  typeof value === 'string' ? value.slice(0, maxLength) : undefined
);

const oneOf = <T extends string>(allowed: readonly T[]) => (value: unknown) => (
  typeof value === 'string' && allowed.includes(value as T) ? value as T : undefined
);

const numericRanges = {
  lyricFontSizeMain: [20, 80],
  lyricFontSizeSub: [10, 40],
  lyricActiveSizeCompensation: [-12, 24],
  lyricOffset: [-5, 5],
  lyricGapTolerance: [0, 5],
  lyricStrokeWidth: [0, 4],
  lyricInactiveBlurStrength: [0.5, 8],
  lyricShadowDirection: [0, 360],
  lyricShadowStrength: [0, 1],
  lyricShadowDistance: [0, 20],
  lyricShadowBlur: [0, 30],
  trackTitleSize: [8, 100],
  trackTitleShadowDirection: [0, 360],
  trackTitleShadowStrength: [0, 1],
  trackTitleShadowDistance: [0, 20],
  trackTitleShadowBlur: [0, 30],
  trackArtistSize: [8, 100],
  trackArtistShadowDirection: [0, 360],
  trackArtistShadowStrength: [0, 1],
  trackArtistShadowDistance: [0, 20],
  trackArtistShadowBlur: [0, 30],
  trackAlbumSize: [8, 100],
  trackAlbumShadowDirection: [0, 360],
  trackAlbumShadowStrength: [0, 1],
  trackAlbumShadowDistance: [0, 20],
  trackAlbumShadowBlur: [0, 30],
  trackVisualArtistSize: [8, 100],
  trackVisualArtistShadowDirection: [0, 360],
  trackVisualArtistShadowStrength: [0, 1],
  trackVisualArtistShadowDistance: [0, 20],
  trackVisualArtistShadowBlur: [0, 30],
  trackCoverSingerSize: [8, 100],
  trackCoverSingerShadowDirection: [0, 360],
  trackCoverSingerShadowStrength: [0, 1],
  trackCoverSingerShadowDistance: [0, 20],
  trackCoverSingerShadowBlur: [0, 30],
  vinylSensitivity: [0.5, 5],
  barSensitivity: [0, 10],
  particleSize: [0.2, 8],
  particleBaseSpeed: [0.1, 3],
  baseParticleDensity: [0.2, 2.5],
  climaxDensitySensitivity: [0.3, 4.5],
  climaxDensityBoostStrength: [0.5, 3],
  particleDirection: [0, 360],
  waveBarAmplitude: [0.4, 2.2],
  waveBarWaterLevel: [-25, 25],
  waveBarBlur: [0, 10],
  waveBarOpacity: [0.05, 1],
  waveBarHeight: [0, 100],
  waveBarFlowSpeed: [0.4, 2.4],
  waveBarTurbulence: [0, 2.5],
  waveBarIdleMotion: [0, 0.24],
  contentMaxWidth: [30, 100],
  albumColumnWidth: [10, 90],
  lyricsColumnWidth: [10, 90],
  columnGapWidth: [0, 20],
  albumColumnX: [-100, 100],
  albumColumnY: [-100, 100],
  albumInfoGap: [0, 150],
  lyricsColumnX: [-100, 100],
  lyricsColumnY: [-100, 100],
  playerControlsOpacity: [0, 1],
  playerBarWidth: [40, 100],
  playerBarHeight: [60, 160],
  playerBarBlur: [0, 40],
  playerBarPositionX: [-45, 45],
  playerBarPositionY: [0, 90],
  configSidebarWidth: [60, 340],
  configContentLeftPadding: [0, 160],
  albumProgressWidth: [2, 20],
  albumProgressOpacity: [0.1, 1],
  vinylLabelSize: [10, 90],
  vinylScale: [0.5, 1.5],
  vinylRotationSpeed: [0.1, 4],
  coverImageX: [-50, 50],
  coverImageY: [-50, 50],
  backgroundImageScale: [1, 3],
  backgroundImageX: [-50, 50],
  backgroundImageY: [-50, 50],
  singerInfoFontSize: [8, 48],
  singerInfoX: [-300, 300],
  singerInfoY: [-500, 500],
  singerLyricOffset: [-5, 5],
  singerLyricGapTolerance: [0, 5],
} as const satisfies Partial<Record<PersistableStateKey, readonly [number, number]>>;

const booleanKeys = [
  'lyricBold',
  'lyricInactiveBlurEnabled',
  'lyricShadowEnabled',
  'trackTitleBold',
  'trackTitleItalic',
  'trackTitleShadowEnabled',
  'trackArtistBold',
  'trackArtistItalic',
  'trackArtistShadowEnabled',
  'trackAlbumBold',
  'trackAlbumItalic',
  'trackAlbumShadowEnabled',
  'trackVisualArtistBold',
  'trackVisualArtistItalic',
  'trackVisualArtistShadowEnabled',
  'trackCoverSingerBold',
  'trackCoverSingerItalic',
  'trackCoverSingerShadowEnabled',
  'enableWaves',
  'enableParticles',
  'enableParticleClimaxDensityBoost',
  'useThemeColorForParticles',
  'enableAlbumProgress',
  'showVinylCenterDot',
  'showSingerInfo',
  'forceOverrideSingerTheme',
] as const satisfies readonly PersistableStateKey[];

const booleanKeySet = new Set<PersistableStateKey>(booleanKeys);

const nullableColorKeys = [
  'lyricActiveColor',
  'lyricInactiveColor',
  'lyricShadowColor',
  'trackTitleColor',
  'trackTitleShadowColor',
  'trackArtistColor',
  'trackArtistShadowColor',
  'trackAlbumColor',
  'trackAlbumShadowColor',
  'trackVisualArtistColor',
  'trackVisualArtistShadowColor',
  'trackCoverSingerColor',
  'trackCoverSingerShadowColor',
] as const satisfies readonly PersistableStateKey[];

const nullableColorKeySet = new Set<PersistableStateKey>(nullableColorKeys);

const normalizeColorArray = (value: unknown, minLength: number, maxLength: number) => {
  if (!Array.isArray(value)) return undefined;

  const colors = value
    .map(normalizeColor)
    .filter((color): color is string => !!color)
    .slice(0, maxLength);

  return colors.length >= minLength ? colors : undefined;
};

const normalizeColorPalettes = (value: unknown) => {
  if (!Array.isArray(value)) return undefined;

  const palettes = value
    .map((palette) => normalizeColorArray(palette, 1, 3))
    .filter((palette): palette is string[] => !!palette)
    .slice(0, 10);

  return palettes.length > 0 ? palettes : undefined;
};

const normalizeMetadata = (value: unknown) => {
  if (!isRecord(value)) return undefined;

  return {
    title: normalizeString(value.title) ?? '',
    artist: normalizeString(value.artist) ?? '',
    album: normalizeString(value.album) ?? '',
    visualArtist: normalizeString(value.visualArtist),
    coverSinger: normalizeString(value.coverSinger),
    playerTitle: normalizeString(value.playerTitle),
    playerSubtitle: normalizeString(value.playerSubtitle),
  };
};

const normalizeLyricDisplayOrder = (value: unknown) => {
  if (!Array.isArray(value)) return undefined;

  const orderedIndexes = value
    .map((item) => normalizeInteger(item, 0, 11))
    .filter((item): item is number => item !== undefined);
  const uniqueIndexes = [...new Set(orderedIndexes)].slice(0, 12);

  return uniqueIndexes.length > 0 ? uniqueIndexes : undefined;
};

const normalizeSingerThemeGroups = (value: unknown) => {
  if (!Array.isArray(value)) return undefined;

  const groups = value
    .map((group) => {
      if (!isRecord(group)) return null;

      const typeId = normalizeInteger(group.typeId, -9999, 9999);
      const colors = normalizeColorArray(group.colors, 1, 5);

      if (typeId === undefined || !colors) return null;

      return { typeId, colors };
    })
    .filter((group): group is { typeId: number; colors: string[] } => !!group)
    .slice(0, 5);

  return groups.length > 0 ? groups : undefined;
};

type StateNormalizer = (value: unknown) => unknown;

const stateNormalizers: Partial<Record<PersistableStateKey, StateNormalizer>> = {
  language: oneOf<Language>(['en', 'zh']),
  themeMode: oneOf<ThemeMode>(['dark', 'light', 'colorful']),
  colorfulThemeBase: oneOf(['light', 'dark']),
  colorfulColors: (value) => normalizeColorArray(value, 1, 5),
  themeColor: normalizeColor,
  metadata: normalizeMetadata,
  lyricStrokeColor: normalizeColor,
  activeLyricEffect: oneOf<LyricEffect>(['none', 'fluid', 'underline']),
  activeLyricStreamerColor: normalizeColor,
  particleType: oneOf<ParticleType>(['circle', 'sakura', 'snowflake', 'star', 'lily', 'rose', 'dandelion', 'peach', 'chrysanthemum', 'begonia']),
  particleColor: normalizeColor,
  particlePalettes: normalizeColorPalettes,
  coverArtStyle: oneOf<CoverArtStyle>(['vinyl', '3d-card']),
  vinylStyle: oneOf<VinylStyle>(['classic', 'vintage', 'modern', 'neon']),
  singerInfoOrientation: oneOf(['vertical', 'horizontal']),
  singerThemeGroups: normalizeSingerThemeGroups,
  lyricPrimaryLineIndex: (value) => normalizeInteger(value, 0, 2),
  lyricDisplayOrder: normalizeLyricDisplayOrder,
};

const normalizePersistedValue = (key: PersistableStateKey, value: unknown) => {
  if (key in numericRanges) {
    const [min, max] = numericRanges[key as keyof typeof numericRanges];
    return normalizeNumber(value, min, max);
  }

  if (booleanKeySet.has(key)) {
    return normalizeBoolean(value);
  }

  if (nullableColorKeySet.has(key)) {
    return normalizeNullableColor(value);
  }

  const normalizer = stateNormalizers[key];
  return normalizer ? normalizer(value) : value;
};

export const sanitizePersistedState = (raw: unknown): Partial<AppState> => {
  if (!isRecord(raw)) return {};

  const input = raw as PersistedInput;
  const migrated: Record<string, unknown> = { ...input };

  if ('waveBarScale' in input && !('waveBarAmplitude' in migrated)) {
    migrated.waveBarAmplitude = input.waveBarScale;
  }

  if ('waveBarPositionY' in input && !('waveBarWaterLevel' in migrated)) {
    migrated.waveBarWaterLevel = input.waveBarPositionY;
  }

  delete migrated.waveBarScale;
  delete migrated.waveBarPositionX;
  delete migrated.waveBarPositionY;
  delete migrated.lyricEffect;

  const sanitized: Partial<AppState> = {};
  PERSISTABLE_STATE_KEYS.forEach((key) => {
    if (!(key in migrated)) return;
    const value = normalizePersistedValue(key, migrated[key]);
    if (value === undefined) return;
    (sanitized as Record<string, unknown>)[key] = cloneJsonSafe(value);
  });

  return sanitized;
};

export const extractPersistableState = (appState: AppState): Partial<AppState> => {
  const persistable: Partial<AppState> = {};

  PERSISTABLE_STATE_KEYS.forEach((key) => {
    (persistable as Record<string, unknown>)[key] = cloneJsonSafe(appState[key]);
  });

  return persistable;
};

export const isPersistableStateKey = (key: string): key is PersistableStateKey => (
  persistableKeySet.has(key as PersistableStateKey)
);
