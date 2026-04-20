import React, { useEffect, useRef } from 'react';
import { hexToRgb } from '../utils/colorUtils';
import { ThemeMode } from '../types';

interface VisualizerBarProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  themeColor: string;
  enableWaves: boolean;
  themeMode: ThemeMode;
  colorfulThemeBase?: 'light' | 'dark';
  sensitivity: number;
  waveScale: number;
  waveOffsetY: number;
  waveOpacity: number;
  waveHeight: number;
  flowSpeed: number;
  turbulence: number;
  idleMotion: number;
  blur: number;
  singerOverrideColors?: string[] | null;
}

interface BandRange {
  start: number;
  end: number;
}

interface AudioSignalState {
  low: number;
  mid: number;
  high: number;
  energy: number;
  transient: number;
  lowRaw: number;
  highRaw: number;
  energyRaw: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const smoothTowards = (current: number, target: number, attack: number, release: number) => {
  const factor = target > current ? attack : release;
  return current + (target - current) * factor;
};

const getBandRange = (analyser: AnalyserNode, minHz: number, maxHz: number): BandRange => {
  const nyquist = analyser.context.sampleRate / 2;
  const start = Math.floor((minHz / nyquist) * analyser.frequencyBinCount);
  const end = Math.ceil((maxHz / nyquist) * analyser.frequencyBinCount);
  return {
    start: clamp(start, 0, analyser.frequencyBinCount - 1),
    end: clamp(end, 0, analyser.frequencyBinCount - 1),
  };
};

const getBandEnergy = (data: Uint8Array, range: BandRange) => {
  const start = clamp(range.start, 0, data.length - 1);
  const end = clamp(range.end, start, data.length - 1);
  if (end < start) return 0;

  let peak = 0;
  let sum = 0;
  let count = 0;

  for (let i = start; i <= end; i += 1) {
    const normalized = data[i] / 255;
    peak = Math.max(peak, normalized);
    sum += normalized * normalized;
    count += 1;
  }

  if (count === 0) return 0;
  const average = Math.sqrt(sum / count);
  return (average * 0.72) + (peak * 0.28);
};

const toRgba = (hex: string, alpha: number) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(255,255,255,${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

const createWaveGradient = (
  ctx: CanvasRenderingContext2D,
  colors: string[],
  width: number,
  topY: number,
  bottomY: number,
  alpha: number
) => {
  if (colors.length > 1) {
    const gradient = ctx.createLinearGradient(0, topY, width, bottomY);
    colors.forEach((color, index) => {
      const stop = colors.length === 1 ? 0 : index / (colors.length - 1);
      gradient.addColorStop(stop, toRgba(color, alpha));
    });
    return gradient;
  }

  const baseColor = colors[0] || '#ffffff';
  const gradient = ctx.createLinearGradient(0, topY, 0, bottomY);
  gradient.addColorStop(0, toRgba(baseColor, alpha * 0.42));
  gradient.addColorStop(0.58, toRgba(baseColor, alpha));
  gradient.addColorStop(1, toRgba(baseColor, clamp(alpha * 1.18, 0, 1)));
  return gradient;
};

const createStrokeGradient = (
  ctx: CanvasRenderingContext2D,
  colors: string[],
  width: number,
  alpha: number
) => {
  if (colors.length > 1) {
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    colors.forEach((color, index) => {
      const stop = colors.length === 1 ? 0 : index / (colors.length - 1);
      gradient.addColorStop(stop, toRgba(color, alpha));
    });
    return gradient;
  }

  return toRgba(colors[0] || '#ffffff', alpha);
};

const VisualizerBar: React.FC<VisualizerBarProps> = ({
  analyser,
  isPlaying,
  themeColor,
  enableWaves,
  themeMode,
  colorfulThemeBase = 'light',
  sensitivity,
  waveScale,
  waveOffsetY,
  waveOpacity,
  waveHeight,
  flowSpeed,
  turbulence,
  idleMotion,
  blur,
  singerOverrideColors,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeDomainDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const bandRangesRef = useRef<{ low: BandRange; mid: BandRange; high: BandRange } | null>(null);
  const signalRef = useRef<AudioSignalState>({
    low: 0,
    mid: 0,
    high: 0,
    energy: 0,
    transient: 0,
    lowRaw: 0,
    highRaw: 0,
    energyRaw: 0,
  });
  const phaseRef = useRef(0);
  const driftRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);

  const isDarkBase = themeMode === 'light'
    ? false
    : themeMode === 'colorful'
      ? colorfulThemeBase === 'dark'
      : true;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    if (analyser) {
      timeDomainDataRef.current = new Uint8Array(analyser.fftSize) as Uint8Array<ArrayBuffer>;
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
      bandRangesRef.current = {
        low: getBandRange(analyser, 28, 180),
        mid: getBandRange(analyser, 180, 1800),
        high: getBandRange(analyser, 1800, 7600),
      };
    } else {
      timeDomainDataRef.current = null;
      frequencyDataRef.current = null;
      bandRangesRef.current = null;
    }

    if (!enableWaves) {
      const width = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
      const height = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));
      ctx.clearRect(0, 0, width, height);
      return () => {
        resizeObserver.disconnect();
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }

    const render = (frameTime: number) => {
      if (!canvasRef.current) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvasRef.current.width / dpr;
      const height = canvasRef.current.height / dpr;
      const delta = lastFrameTimeRef.current == null
        ? 1
        : clamp((frameTime - lastFrameTimeRef.current) / 16.667, 0.65, 2.2);

      lastFrameTimeRef.current = frameTime;
      ctx.clearRect(0, 0, width, height);

      const signal = signalRef.current;
      let lowTarget = 0;
      let midTarget = 0;
      let highTarget = 0;
      let energyTarget = 0;
      let transientTarget = 0;

      if (analyser && isPlaying && timeDomainDataRef.current && frequencyDataRef.current && bandRangesRef.current) {
        analyser.getByteTimeDomainData(timeDomainDataRef.current);
        analyser.getByteFrequencyData(frequencyDataRef.current);

        let sum = 0;
        for (let i = 0; i < timeDomainDataRef.current.length; i += 1) {
          const amplitude = (timeDomainDataRef.current[i] - 128) / 128;
          sum += amplitude * amplitude;
        }

        const rms = Math.sqrt(sum / timeDomainDataRef.current.length);
        const sensitivityGain = 0.55 + (sensitivity * 0.12);

        lowTarget = clamp(getBandEnergy(frequencyDataRef.current, bandRangesRef.current.low) * (0.9 + (sensitivityGain * 0.55)), 0, 1.15);
        midTarget = clamp(getBandEnergy(frequencyDataRef.current, bandRangesRef.current.mid) * (0.72 + (sensitivityGain * 0.4)), 0, 1.05);
        highTarget = clamp(getBandEnergy(frequencyDataRef.current, bandRangesRef.current.high) * (0.62 + (sensitivityGain * 0.3)), 0, 0.95);
        energyTarget = clamp((rms * (1.2 + (sensitivityGain * 0.5))) + (lowTarget * 0.44) + (midTarget * 0.2), 0, 1.2);

        transientTarget = clamp(
          (Math.max(0, energyTarget - signal.energyRaw) * 2.15) +
          (Math.max(0, lowTarget - signal.lowRaw) * 1.2) +
          (Math.max(0, highTarget - signal.highRaw) * 0.65),
          0,
          1.05
        );

        signal.lowRaw = lowTarget;
        signal.highRaw = highTarget;
        signal.energyRaw = energyTarget;
      } else {
        signal.lowRaw = 0;
        signal.highRaw = 0;
        signal.energyRaw = 0;
      }

      const quietMotionFloor = isPlaying ? clamp(idleMotion, 0, 0.35) : 0;

      signal.low = smoothTowards(signal.low, Math.max(lowTarget, quietMotionFloor * 0.55), 0.24, 0.08);
      signal.mid = smoothTowards(signal.mid, Math.max(midTarget, quietMotionFloor * 0.35), 0.18, 0.08);
      signal.high = smoothTowards(signal.high, Math.max(highTarget, quietMotionFloor * 0.2), 0.18, 0.06);
      signal.energy = smoothTowards(signal.energy, Math.max(energyTarget, quietMotionFloor * 0.4), 0.2, 0.07);
      signal.transient = smoothTowards(signal.transient, transientTarget, 0.42, 0.14);

      const drive = clamp((signal.energy * 0.72) + (signal.low * 0.35) + (quietMotionFloor * 0.32), 0, 1.25);
      const phaseVelocity = isPlaying
        ? (0.0085 + (flowSpeed * 0.01) + (signal.high * 0.012) + (signal.transient * 0.01)) * delta
        : 0;
      const driftVelocity = isPlaying ? ((0.004 + (flowSpeed * 0.0035)) * delta) : 0;

      phaseRef.current += phaseVelocity;
      driftRef.current += driftVelocity;

      const palette = singerOverrideColors && singerOverrideColors.length > 0
        ? singerOverrideColors
        : [themeColor];
      const opacityScale = clamp(waveOpacity, 0, 1);
      const amplitudeBase = Math.min(height * 0.12, 36) * clamp(waveScale, 0.4, 2.4);
      const waterLevelBase = height - (height * clamp(waveHeight, 0, 100) / 100);
      const waterLevel = waterLevelBase + (height * clamp(waveOffsetY, -25, 25) / 100);
      const sampleStep = Math.max(3, Math.min(8, Math.round(width / 160)));
      const crestShape = 1.08 + (signal.transient * 0.8) + (signal.high * 0.24);
      const turbulenceStrength = clamp(turbulence, 0, 2.5);

      const layers = [
        { amplitude: 0.56, frequency: 1.18, speed: 0.56, detail: 0.2, alpha: isDarkBase ? 0.14 : 0.08, lift: -0.02, highlight: false, strokeAlpha: 0.1, strokeWidth: 0.8 },
        { amplitude: 0.78, frequency: 1.85, speed: 0.82, detail: 0.28, alpha: isDarkBase ? 0.2 : 0.12, lift: -0.004, highlight: false, strokeAlpha: 0.12, strokeWidth: 0.9 },
        { amplitude: 0.96, frequency: 2.55, speed: 1.14, detail: 0.34, alpha: isDarkBase ? 0.28 : 0.18, lift: 0.01, highlight: true, strokeAlpha: 0.2, strokeWidth: 1.2 },
        { amplitude: 1.08, frequency: 3.08, speed: 1.38, detail: 0.42, alpha: isDarkBase ? 0.36 : 0.24, lift: 0.018, highlight: true, strokeAlpha: 0.28, strokeWidth: 1.45 },
      ] as const;

      layers.forEach((layer, layerIndex) => {
        const layerAmplitude = amplitudeBase * layer.amplitude * (0.14 + (drive * 0.86) + (signal.low * 0.18));
        const layerTop = waterLevel - layerAmplitude;
        const layerBottom = height;
        const points: Array<{ x: number; y: number }> = [];

        for (let x = 0; x <= width; x += sampleStep) {
          const nx = x / Math.max(width, 1);
          const layerPhase = phaseRef.current * layer.speed;
          const mainWave = Math.sin((nx * Math.PI * (layer.frequency + (signal.mid * 0.9))) + layerPhase + (layerIndex * 0.9));
          const shapedMain = Math.sign(mainWave) * Math.pow(Math.abs(mainWave), crestShape);
          const detailWave = Math.sin((nx * Math.PI * ((layer.frequency * 2.3) + (signal.high * 3))) - (phaseRef.current * (1.15 + layer.detail)) + (layerIndex * 2.4)) * (0.24 + (signal.mid * 0.18));
          const microWave = Math.sin((nx * Math.PI * 9.5) + (driftRef.current * 2.1) + (layer.speed * 5.2)) * signal.high * 0.12;
          const turbulenceWave = (
            (Math.sin((nx * Math.PI * 14) + (driftRef.current * 1.8) + (layerIndex * 4.1)) * 0.5) +
            (Math.sin((nx * Math.PI * 26.5) - (phaseRef.current * 0.92) + (layerIndex * 7.3)) * 0.3)
          ) * turbulenceStrength * (0.04 + (drive * 0.1));
          const crestLift = layer.highlight
            ? Math.max(0, Math.sin((nx * Math.PI * layer.frequency) + layerPhase + (Math.PI / 2))) * signal.transient * 0.22
            : 0;

          const y = waterLevel
            + (height * layer.lift)
            - (shapedMain * layerAmplitude)
            - (detailWave * layerAmplitude * layer.detail)
            - (microWave * layerAmplitude)
            - (turbulenceWave * layerAmplitude)
            - (crestLift * amplitudeBase);

          points.push({ x: Math.min(x, width), y });
        }

        ctx.beginPath();
        ctx.moveTo(0, height);
        points.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = createWaveGradient(
          ctx,
          palette,
          width,
          layerTop,
          layerBottom,
          layer.alpha * opacityScale
        );
        ctx.fill();

        if (layer.highlight) {
          ctx.beginPath();
          points.forEach((point, pointIndex) => {
            if (pointIndex === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.strokeStyle = createStrokeGradient(
            ctx,
            palette,
            width,
            clamp((layer.strokeAlpha + (signal.transient * 0.12) + (signal.high * 0.08)) * opacityScale, 0, 1)
          );
          ctx.lineWidth = layer.strokeWidth;
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      resizeObserver.disconnect();
      lastFrameTimeRef.current = null;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [
    analyser,
    blur,
    colorfulThemeBase,
    enableWaves,
    flowSpeed,
    idleMotion,
    isDarkBase,
    isPlaying,
    sensitivity,
    singerOverrideColors,
    themeColor,
    themeMode,
    turbulence,
    waveHeight,
    waveOffsetY,
    waveOpacity,
    waveScale,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none transition-all duration-300"
      style={{ filter: `blur(${blur}px)` }}
    />
  );
};

export default VisualizerBar;
