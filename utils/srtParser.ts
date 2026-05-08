
import { LyricLine, SingerInfoLine } from '../types';

export const SRT_IMPORT_MAX_BYTES = 2 * 1024 * 1024;

const timeToSeconds = (timeString: string): number | null => {
  const match = timeString.trim().match(/^(\d+):([0-5]?\d):([0-5]?\d)(?:[,.](\d{1,3}))?$/);
  if (!match) return null;

  const [, hoursRaw, minutesRaw, secondsRaw, millisecondsRaw = '0'] = match;
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  const seconds = Number(secondsRaw);
  const milliseconds = Number(millisecondsRaw.padEnd(3, '0').slice(0, 3));

  if (![hours, minutes, seconds, milliseconds].every(Number.isFinite)) return null;

  const total = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
  return Number.isFinite(total) ? total : null;
};

const parseTimeRange = (timeLine: string) => {
  const parts = timeLine.split(/\s*-->\s*/);
  if (parts.length < 2) return null;

  const start = timeToSeconds(parts[0]);
  const end = timeToSeconds(parts[1].trim().split(/\s+/)[0]);

  if (start === null || end === null || end <= start) return null;

  return { start, end };
};

const getBlocks = (srtContent: string) => {
  const normalized = srtContent.replace(/^\uFEFF/, '').replace(/\r/g, '').trim();
  return normalized ? normalized.split(/\n[ \t]*\n+/) : [];
};

export const parseSRT = (srtContent: string): LyricLine[] => {
  return getBlocks(srtContent).map((block): LyricLine | null => {
    const lines = block.split('\n').map(line => line.trim());
    const timeLineIndex = lines.findIndex(line => line.includes('-->'));
    if (timeLineIndex < 0 || timeLineIndex >= lines.length - 1) return null;

    const range = parseTimeRange(lines[timeLineIndex]);
    if (!range) return null;

    const content = lines.slice(timeLineIndex + 1).filter(line => line !== '');
    if (content.length === 0) return null;

    return {
      start: range.start,
      end: range.end,
      content,
    };
  }).filter((item): item is LyricLine => item !== null);
};

export const parseSingerSRT = (srtContent: string): SingerInfoLine[] => {
  return getBlocks(srtContent).map((block): SingerInfoLine | null => {
    const lines = block.split('\n').map(line => line.trim());
    if (lines.length < 4) return null; // Needs index, time, name, typeId

    const range = parseTimeRange(lines[1]);
    if (!range) return null;

    const name = lines[2];
    const typeId = Number(lines[3]);

    if (!name || !Number.isInteger(typeId)) return null;

    return {
      start: range.start,
      end: range.end,
      name,
      typeId,
    };
  }).filter((item): item is SingerInfoLine => item !== null);
};
