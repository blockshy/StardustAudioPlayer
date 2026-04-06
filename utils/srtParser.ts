
import { LyricLine, SingerInfoLine } from '../types';

const timeToSeconds = (timeString: string): number => {
  const [hours, minutes, seconds] = timeString.split(':');
  const [secs, ms] = seconds.split(',');
  return (
    parseInt(hours, 10) * 3600 +
    parseInt(minutes, 10) * 60 +
    parseInt(secs, 10) +
    parseInt(ms, 10) / 1000
  );
};

export const parseSRT = (srtContent: string): LyricLine[] => {
  const blocks = srtContent.trim().split(/\n\s*\n/);
  return blocks.map((block): LyricLine | null => {
    const lines = block.split('\n');
    if (lines.length < 3) return null;

    const timeLine = lines[1];
    if (!timeLine.includes(' --> ')) return null;
    
    const [startStr, endStr] = timeLine.split(' --> ');
    const content = lines.slice(2).map(line => line.trim()).filter(line => line !== '');

    return {
      start: timeToSeconds(startStr),
      end: timeToSeconds(endStr),
      content,
    };
  }).filter((item): item is LyricLine => item !== null);
};

export const parseSingerSRT = (srtContent: string): SingerInfoLine[] => {
  const blocks = srtContent.trim().split(/\n\s*\n/);
  return blocks.map((block): SingerInfoLine | null => {
    const lines = block.split('\n');
    if (lines.length < 4) return null; // Needs index, time, name, typeId

    const timeLine = lines[1];
    if (!timeLine.includes(' --> ')) return null;
    
    const [startStr, endStr] = timeLine.split(' --> ');
    const name = lines[2].trim();
    const typeId = parseInt(lines[3].trim(), 10);

    if (isNaN(typeId)) return null;

    return {
      start: timeToSeconds(startStr),
      end: timeToSeconds(endStr),
      name,
      typeId,
    };
  }).filter((item): item is SingerInfoLine => item !== null);
};
