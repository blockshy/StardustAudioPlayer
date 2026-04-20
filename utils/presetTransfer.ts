import { AppPreset, AppState } from '../types';

export interface PresetTransferItem {
  name: string;
  config: Partial<AppState>;
}

export interface PresetTransferPayload {
  type: 'stardust-audio-player-presets';
  version: 1;
  exportedAt: string;
  presets: PresetTransferItem[];
}

export interface PresetImportSummary {
  created: number;
  overwritten: number;
  renamed: number;
  total: number;
}

const cloneJsonSafe = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const normalizePresetName = (name: string) => name.trim();

export const sanitizePresetConfig = (
  config: Partial<AppState>,
  allowedKeys: (keyof AppState)[]
) => {
  const sanitized: Partial<AppState> = {};

  allowedKeys.forEach((key) => {
    if (!(key in config)) return;
    const value = config[key];
    if (value === undefined) return;
    (sanitized as Record<string, unknown>)[key] = cloneJsonSafe(value);
  });

  return sanitized;
};

export const buildPresetTransferPayload = (
  presets: AppPreset[],
  allowedKeys: (keyof AppState)[]
): PresetTransferPayload => ({
  type: 'stardust-audio-player-presets',
  version: 1,
  exportedAt: new Date().toISOString(),
  presets: presets.map((preset) => ({
    name: normalizePresetName(preset.name),
    config: sanitizePresetConfig(preset.config, allowedKeys),
  })),
});

export const parsePresetTransferPayload = (
  raw: string,
  allowedKeys: (keyof AppState)[]
) => {
  const parsed = JSON.parse(raw) as Partial<PresetTransferPayload>;

  if (parsed.type !== 'stardust-audio-player-presets' || parsed.version !== 1 || !Array.isArray(parsed.presets)) {
    throw new Error('invalid_preset_file');
  }

  const presets = parsed.presets
    .map((preset) => {
      if (!preset || typeof preset !== 'object') return null;
      const name = typeof preset.name === 'string' ? normalizePresetName(preset.name) : '';
      const config = preset.config && typeof preset.config === 'object'
        ? sanitizePresetConfig(preset.config as Partial<AppState>, allowedKeys)
        : null;

      if (!name || !config) return null;

      return {
        name,
        config,
      };
    })
    .filter((preset): preset is PresetTransferItem => !!preset);

  if (presets.length === 0) {
    throw new Error('empty_preset_file');
  }

  return presets;
};

export const mergeImportedPresets = (
  existingCustomPresets: AppPreset[],
  importedPresets: PresetTransferItem[],
  options: {
    defaultPresetNames: string[];
    importedSuffix: string;
  }
) => {
  const summary: PresetImportSummary = {
    created: 0,
    overwritten: 0,
    renamed: 0,
    total: importedPresets.length,
  };

  const defaultNameSet = new Set(options.defaultPresetNames.map(normalizePresetName));
  const workingPresets = [...existingCustomPresets];
  let idCounter = 0;

  const getUniqueImportedName = (baseName: string) => {
    const preferred = `${baseName}${options.importedSuffix}`;
    if (!workingPresets.some((preset) => normalizePresetName(preset.name) === preferred) && !defaultNameSet.has(preferred)) {
      return preferred;
    }

    let suffixIndex = 2;
    while (true) {
      const candidate = `${preferred} ${suffixIndex}`;
      const exists = workingPresets.some((preset) => normalizePresetName(preset.name) === candidate) || defaultNameSet.has(candidate);
      if (!exists) return candidate;
      suffixIndex += 1;
    }
  };

  importedPresets.forEach((importedPreset) => {
    let nextName = normalizePresetName(importedPreset.name);
    const existingIndex = workingPresets.findIndex((preset) => normalizePresetName(preset.name) === nextName);

    if (existingIndex >= 0) {
      const current = workingPresets[existingIndex];
      workingPresets[existingIndex] = {
        ...current,
        name: nextName,
        config: importedPreset.config,
      };
      summary.overwritten += 1;
      return;
    }

    if (defaultNameSet.has(nextName)) {
      nextName = getUniqueImportedName(nextName);
      summary.renamed += 1;
    }

    workingPresets.push({
      id: `custom_import_${Date.now()}_${idCounter}`,
      name: nextName,
      config: importedPreset.config,
    });
    idCounter += 1;
    summary.created += 1;
  });

  return {
    presets: workingPresets,
    summary,
  };
};
