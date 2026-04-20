
import React, { useEffect, useRef } from 'react';
import { hexToRgb } from '../utils/colorUtils';
import { ParticleType, ParticleDirection, ThemeMode } from '../types';

const MAX_PARTICLES = 240;
const BASE_PARTICLE_LIFETIME = 90;
const PARTICLE_LIFETIME_VARIANCE = 120;
const MIN_SPEED_MULTIPLIER = 0.05;
const MIN_PARTICLE_LIFETIME = 120;
const MAX_PARTICLE_LIFETIME = 1600;
const DPR_CAP = 2;

interface GlobalParticlesProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  currentTime?: number;
  themeColor: string;
  colorfulColors?: string[];
  enabled: boolean;
  enableClimaxDensityBoost?: boolean;
  climaxDensitySensitivity?: number;
  climaxDensityBoostStrength?: number;
  particleSize?: number; 
  particleBaseSpeed?: number; 
  baseParticleDensity?: number;
  particleType: ParticleType;
  particleDirection?: ParticleDirection; 
  particlePalettes?: string[][];
  useThemeColor?: boolean;
  themeMode: ThemeMode;
  singerOverrideColors?: string[] | null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number; 
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  palette: string[];
  flowPhase: number;
  flowFrequency: number;
  flowAmplitude: number;
  wobblePhase: number;
  wobbleSpeed: number;
  headingOffset: number;
}

interface ParticleMotionProfile {
  rotation: number;
  drift: number;
  crossFlow: number;
  alongFlow: number;
  flutter: number;
  eddy: number;
  frequency: number;
  life: number;
  alignment: number;
  wobble: number;
  headingOffset: number;
}

const GlobalParticles: React.FC<GlobalParticlesProps> = ({
  analyser, isPlaying, currentTime = 0, themeColor, colorfulColors = [], enabled, enableClimaxDensityBoost = true, climaxDensitySensitivity = 1.0, climaxDensityBoostStrength = 1.4,
  particleSize = 1.0, particleBaseSpeed = 1.0, baseParticleDensity = 1.0, particleType, particleDirection = 270,
  particlePalettes = [['#ffffff']], useThemeColor = true, themeMode,
  singerOverrideColors
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const timeDomainDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const fastEnergyRef = useRef(0);
  const phraseEnergyRef = useRef(0);
  const sectionEnergyRef = useRef(0);
  const energyFloorRef = useRef(0);
  const energyPeakRef = useRef(0);
  const emotionLevelRef = useRef(0);
  const emotionHoldRef = useRef(0);
  const presenceLevelRef = useRef(0);
  const playbackGateRef = useRef(0);
  const prevPlaybackTimeRef = useRef<number | null>(null);

  const isDarkBase = themeMode !== 'light';

  const setCtxStyle = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
    if (p.palette.length === 1) {
        const rgb = hexToRgb(p.palette[0]) || {r:255, g:255, b:255};
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${renderAlpha})`;
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${renderAlpha})`;
    } else {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.5);
        p.palette.forEach((color, idx) => {
            const rgb = hexToRgb(color) || {r:255, g:255, b:255};
            const stop = idx / (p.palette.length - 1);
            grad.addColorStop(stop, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${renderAlpha})`);
        });
        ctx.fillStyle = grad; ctx.strokeStyle = grad;
    }
  };

  const drawPetal = (ctx: CanvasRenderingContext2D, radius: number, widthFactor = 0.52, pinch = 0.18) => {
    const width = radius * widthFactor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(width, -radius * pinch, width, -radius * 0.72, 0, -radius);
    ctx.bezierCurveTo(-width, -radius * 0.72, -width, -radius * pinch, 0, 0);
    ctx.closePath();
    ctx.fill();
  };

  const drawSakura = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    setCtxStyle(ctx, p, renderAlpha);
    const petalRadius = p.size * 1.35;
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / 5);
      drawPetal(ctx, petalRadius, 0.62, 0.1);
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(0, -p.size * 0.52, p.size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    setCtxStyle(ctx, p, renderAlpha * 0.75);
    ctx.beginPath();
    ctx.arc(0, 0, p.size * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawSnowflake = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    setCtxStyle(ctx, p, renderAlpha);
    const armLength = p.size * 1.55;
    ctx.lineWidth = Math.max(0.55, p.size * 0.22);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const sideA = angle + (Math.PI / 6);
      const sideB = angle - (Math.PI / 6);
      const branchStart = armLength * 0.48;
      const branchLength = armLength * 0.32;
      ctx.moveTo(0, 0);
      ctx.lineTo(cos * armLength, sin * armLength);
      ctx.moveTo(cos * branchStart, sin * branchStart);
      ctx.lineTo(
        (cos * branchStart) + (Math.cos(sideA) * branchLength),
        (sin * branchStart) + (Math.sin(sideA) * branchLength)
      );
      ctx.moveTo(cos * branchStart, sin * branchStart);
      ctx.lineTo(
        (cos * branchStart) + (Math.cos(sideB) * branchLength),
        (sin * branchStart) + (Math.sin(sideB) * branchLength)
      );
    }
    ctx.stroke();
    ctx.restore();
  };

  const drawStar = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation - (Math.PI / 2));
      setCtxStyle(ctx, p, renderAlpha);
      const spikes = 5;
      const outerRadius = p.size * 1.15;
      const innerRadius = p.size * 0.5;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI * i) / spikes;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
  };

  const drawLily = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      setCtxStyle(ctx, p, renderAlpha);
      const petalLength = p.size * 2.05;
      for (let i = 0; i < 6; i++) {
          ctx.save();
          ctx.rotate((Math.PI * 2 * i) / 6 + ((i % 2) * 0.08));
          drawPetal(ctx, petalLength, i % 2 === 0 ? 0.42 : 0.36, 0.12);
          ctx.restore();
      }
      ctx.lineWidth = Math.max(0.4, p.size * 0.12);
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
          ctx.save();
          ctx.rotate(-0.24 + (i * 0.24));
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -p.size * 1.25);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, -p.size * 1.28, p.size * 0.12, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
  };

  const drawRose = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      setCtxStyle(ctx, p, renderAlpha);
      const layers = [
        { petals: 3, radius: p.size * 0.85, width: 0.32, offset: 0.18 },
        { petals: 5, radius: p.size * 1.16, width: 0.4, offset: 0.08 },
        { petals: 7, radius: p.size * 1.46, width: 0.48, offset: -0.06 },
      ];
      layers.forEach((layer, layerIndex) => {
        for (let i = 0; i < layer.petals; i++) {
          ctx.save();
          ctx.rotate(((Math.PI * 2 * i) / layer.petals) + (layerIndex * 0.18));
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(layer.radius * layer.width, -layer.radius * 0.08, layer.radius * (layer.width + 0.06), -layer.radius * 0.78, 0, -layer.radius);
          ctx.bezierCurveTo(-layer.radius * (layer.width + layer.offset), -layer.radius * 0.74, -layer.radius * layer.width, -layer.radius * 0.06, 0, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
  };

  const drawDandelion = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      setCtxStyle(ctx, p, renderAlpha);
      const tuftRadius = p.size * 1.05;
      const shaftStartY = -p.size * 0.18;
      const shaftEndY = p.size * 1.08;
      const seedY = p.size * 1.5;
      ctx.lineWidth = Math.max(0.4, p.size * 0.1);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, shaftStartY);
      ctx.lineTo(0, shaftEndY);
      ctx.stroke();
      for (let i = 0; i < 9; i++) {
          const spread = (i - 4) / 4;
          const angle = (-Math.PI / 2) + (spread * 0.78);
          const inner = p.size * 0.18;
          const outerX = Math.cos(angle) * tuftRadius;
          const outerY = (Math.sin(angle) * tuftRadius) - (p.size * 0.14);
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * inner, (Math.sin(angle) * inner) - (p.size * 0.08));
          ctx.lineTo(outerX, outerY);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(outerX, outerY, p.size * 0.08, 0, Math.PI * 2);
          ctx.fill();
      }
      ctx.beginPath();
      ctx.ellipse(0, seedY, p.size * 0.18, p.size * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
  };

  const drawPeach = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      setCtxStyle(ctx, p, renderAlpha);
      for (let i = 0; i < 5; i++) {
          ctx.save();
          ctx.rotate((Math.PI * 2 * i) / 5);
          drawPetal(ctx, p.size * 1.5, 0.74, 0.24);
          ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
  };

  const drawChrysanthemum = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      setCtxStyle(ctx, p, renderAlpha);
      const layers = [
        { petals: 14, radius: p.size * 1.42, width: 0.18, twist: 0 },
        { petals: 12, radius: p.size * 1.1, width: 0.16, twist: 0.12 },
      ];
      layers.forEach(layer => {
          for (let i = 0; i < layer.petals; i++) {
              ctx.save();
              ctx.rotate(((Math.PI * 2 * i) / layer.petals) + layer.twist);
              drawPetal(ctx, layer.radius, layer.width, 0.06);
              ctx.restore();
          }
      });
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
  };

  const drawBegonia = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation + 0.2);
      setCtxStyle(ctx, p, renderAlpha);
      const petals = [
        { angle: -0.25, radius: p.size * 1.45, width: 0.72 },
        { angle: Math.PI - 0.1, radius: p.size * 1.18, width: 0.62 },
        { angle: Math.PI / 2 + 0.08, radius: p.size * 1.1, width: 0.58 },
        { angle: -Math.PI / 2 - 0.18, radius: p.size * 0.95, width: 0.52 },
      ];
      petals.forEach(petal => {
          ctx.save();
          ctx.rotate(petal.angle);
          drawPetal(ctx, petal.radius, petal.width, 0.2);
          ctx.restore();
      });
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
  };

  const drawCircle = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
      ctx.save(); ctx.translate(p.x, p.y); setCtxStyle(ctx, p, renderAlpha);
      ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  };

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const lerp = (from: number, to: number, amount: number) => from + ((to - from) * amount);
  const lerpAngle = (from: number, to: number, amount: number) => (
    from + (Math.atan2(Math.sin(to - from), Math.cos(to - from)) * amount)
  );

  const averageRange = (data: Uint8Array<ArrayBuffer>, startRatio: number, endRatio: number) => {
    const start = Math.floor(data.length * startRatio);
    const end = Math.max(start + 1, Math.floor(data.length * endRatio));
    let total = 0;
    for (let i = start; i < end; i++) total += data[i];
    return (total / Math.max(1, end - start)) / 255;
  };

  const calculateRms = (data: Uint8Array<ArrayBuffer>) => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const amplitude = (data[i] - 128) / 128;
      sum += amplitude * amplitude;
    }
    return Math.sqrt(sum / Math.max(1, data.length));
  };

  const getMotionProfile = (type: ParticleType): ParticleMotionProfile => {
    if (type === 'sakura') return { rotation: 1.18, drift: 1.08, crossFlow: 1.18, alongFlow: 0.58, flutter: 1.0, eddy: 0.78, frequency: 1.05, life: 1.03, alignment: 0.18, wobble: 0.78, headingOffset: 0 };
    if (type === 'peach') return { rotation: 0.94, drift: 0.96, crossFlow: 1.02, alongFlow: 0.62, flutter: 0.82, eddy: 0.7, frequency: 1.0, life: 1.02, alignment: 0.2, wobble: 0.62, headingOffset: 0 };
    if (type === 'lily') return { rotation: 0.4, drift: 0.72, crossFlow: 0.78, alongFlow: 0.7, flutter: 0.38, eddy: 0.54, frequency: 0.9, life: 1.08, alignment: 0.12, wobble: 0.22, headingOffset: 0 };
    if (type === 'rose') return { rotation: 0.26, drift: 0.62, crossFlow: 0.64, alongFlow: 0.72, flutter: 0.28, eddy: 0.4, frequency: 0.82, life: 1.16, alignment: 0.08, wobble: 0.16, headingOffset: 0 };
    if (type === 'snowflake') return { rotation: 0.54, drift: 0.9, crossFlow: 1.02, alongFlow: 0.62, flutter: 0.5, eddy: 0.72, frequency: 0.96, life: 1.1, alignment: 0.18, wobble: 0.34, headingOffset: 0 };
    if (type === 'star') return { rotation: 0.84, drift: 0.88, crossFlow: 0.84, alongFlow: 0.62, flutter: 0.62, eddy: 0.98, frequency: 1.08, life: 0.95, alignment: 0.14, wobble: 0.46, headingOffset: 0 };
    if (type === 'dandelion') return { rotation: 0.14, drift: 1.28, crossFlow: 1.36, alongFlow: 0.54, flutter: 1.34, eddy: 0.92, frequency: 1.16, life: 1.28, alignment: 0.88, wobble: 0.78, headingOffset: -Math.PI / 2 };
    if (type === 'chrysanthemum') return { rotation: 0.2, drift: 0.56, crossFlow: 0.6, alongFlow: 0.66, flutter: 0.2, eddy: 0.34, frequency: 0.78, life: 1.12, alignment: 0.06, wobble: 0.08, headingOffset: 0 };
    if (type === 'begonia') return { rotation: 0.5, drift: 0.9, crossFlow: 0.96, alongFlow: 0.66, flutter: 0.54, eddy: 0.62, frequency: 0.96, life: 1.08, alignment: 0.3, wobble: 0.44, headingOffset: 0.12 };
    return { rotation: 0.32, drift: 0.68, crossFlow: 0.72, alongFlow: 0.56, flutter: 0.32, eddy: 0.46, frequency: 0.92, life: 1.0, alignment: 0.1, wobble: 0.12, headingOffset: 0 };
  };

  const resetEmotionState = () => {
    fastEnergyRef.current = 0;
    phraseEnergyRef.current = 0;
    sectionEnergyRef.current = 0;
    energyFloorRef.current = 0;
    energyPeakRef.current = 0;
    emotionLevelRef.current = 0;
    emotionHoldRef.current = 0;
    presenceLevelRef.current = 0;
    playbackGateRef.current = 0;
  };

  useEffect(() => {
    resetEmotionState();
    prevPlaybackTimeRef.current = currentTime;
  }, [analyser, enableClimaxDensityBoost]);

  useEffect(() => {
    const previousTime = prevPlaybackTimeRef.current;
    if (
      enableClimaxDensityBoost &&
      previousTime !== null &&
      Math.abs(currentTime - previousTime) > 1.25
    ) {
      resetEmotionState();
    }
    prevPlaybackTimeRef.current = currentTime;
  }, [currentTime, enableClimaxDensityBoost]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    if (analyser) {
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount) as unknown as Uint8Array<ArrayBuffer>;
      timeDomainDataRef.current = new Uint8Array(analyser.fftSize) as unknown as Uint8Array<ArrayBuffer>;
    } else {
      frequencyDataRef.current = null;
      timeDomainDataRef.current = null;
    }

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const viewWidth = canvas.width / dpr;
      const viewHeight = canvas.height / dpr;
      ctx.clearRect(0, 0, viewWidth, viewHeight);
      if (!enabled) { particlesRef.current = []; animationRef.current = requestAnimationFrame(render); return; }

      let emotionDrive = 0;
      let transientDrive = 0;
      let presenceDrive = enableClimaxDensityBoost ? 0 : 1;
      let bassDrive = 0;
      let midDrive = 0;
      let airDrive = 0;
      const frequencyData = frequencyDataRef.current;
      const timeDomainData = timeDomainDataRef.current;
      if (enableClimaxDensityBoost) {
        const playbackTarget = isPlaying ? 1 : 0;
        playbackGateRef.current = playbackTarget > playbackGateRef.current
          ? lerp(playbackGateRef.current, playbackTarget, 0.045)
          : lerp(playbackGateRef.current, playbackTarget, 0.14);

        if (analyser && isPlaying && frequencyData && timeDomainData) {
          analyser.getByteFrequencyData(frequencyData);
          analyser.getByteTimeDomainData(timeDomainData);

          const bassEnergy = averageRange(frequencyData, 0.02, 0.14);
          const midEnergy = averageRange(frequencyData, 0.14, 0.50);
          const airEnergy = averageRange(frequencyData, 0.50, 0.92);
          const weightedEnergy = (bassEnergy * 0.30) + (midEnergy * 0.50) + (airEnergy * 0.20);
          const rms = calculateRms(timeDomainData);

          const fastEnergy = lerp(fastEnergyRef.current, weightedEnergy, 0.16);
          const phraseEnergy = lerp(phraseEnergyRef.current, weightedEnergy, 0.04);
          const sectionEnergy = lerp(sectionEnergyRef.current, weightedEnergy, 0.009);

          fastEnergyRef.current = fastEnergy;
          phraseEnergyRef.current = phraseEnergy;
          sectionEnergyRef.current = sectionEnergy;

          if (energyPeakRef.current === 0 && energyFloorRef.current === 0) {
            energyFloorRef.current = weightedEnergy;
            energyPeakRef.current = weightedEnergy;
          } else {
            energyFloorRef.current = weightedEnergy < energyFloorRef.current
              ? lerp(energyFloorRef.current, weightedEnergy, 0.08)
              : lerp(energyFloorRef.current, weightedEnergy, 0.0025);
            energyPeakRef.current = weightedEnergy > energyPeakRef.current
              ? lerp(energyPeakRef.current, weightedEnergy, 0.085)
              : lerp(energyPeakRef.current, weightedEnergy, 0.0035);
          }

          const range = Math.max(0.08, energyPeakRef.current - energyFloorRef.current);
          const normalizedHeight = clamp((phraseEnergy - energyFloorRef.current) / range, 0, 1);
          const sectionBuild = clamp((phraseEnergy - sectionEnergy) / (range * 0.9), 0, 1.25);
          const transientAccent = clamp((fastEnergy - phraseEnergy) / (range * 0.55), 0, 1.2);
          const sensitivityGain = clamp(climaxDensitySensitivity, 0.3, 4.5);
          const buildSignal = clamp(sectionBuild * (0.75 + (sensitivityGain * 0.35)), 0, 1.2);
          const accentSignal = clamp(transientAccent * (0.8 + (Math.sqrt(sensitivityGain) * 0.22)), 0, 1.1);
          const rawEmotion = clamp(
            (normalizedHeight * 0.48) +
            (buildSignal * 0.34) +
            (accentSignal * 0.18),
            0,
            1.1
          );

          const spectralPresence = clamp((weightedEnergy - 0.018) / 0.28, 0, 1);
          const rmsPresence = clamp((rms - 0.008) / 0.11, 0, 1);
          bassDrive = clamp((bassEnergy - 0.015) / 0.34, 0, 1);
          midDrive = clamp((midEnergy - 0.015) / 0.32, 0, 1);
          airDrive = clamp((airEnergy - 0.012) / 0.24, 0, 1);
          const presenceTarget = clamp(
            (spectralPresence * 0.44) +
            (rmsPresence * 0.41) +
            (bassDrive * 0.07) +
            (midDrive * 0.05) +
            (airDrive * 0.03),
            0,
            1
          ) * playbackGateRef.current;

          presenceLevelRef.current = presenceTarget > presenceLevelRef.current
            ? lerp(presenceLevelRef.current, presenceTarget, 0.08)
            : lerp(presenceLevelRef.current, presenceTarget, 0.13);

          const previousEmotion = emotionLevelRef.current;
          emotionLevelRef.current = rawEmotion > previousEmotion
            ? lerp(previousEmotion, rawEmotion, 0.11)
            : lerp(previousEmotion, rawEmotion, 0.028);
          emotionHoldRef.current = Math.max(emotionLevelRef.current, emotionHoldRef.current * 0.992);
          emotionDrive = clamp((emotionLevelRef.current * 0.72) + (emotionHoldRef.current * 0.28), 0, 1);
          transientDrive = clamp(accentSignal, 0, 1);
        } else {
          fastEnergyRef.current = lerp(fastEnergyRef.current, 0, 0.08);
          phraseEnergyRef.current = lerp(phraseEnergyRef.current, 0, 0.05);
          sectionEnergyRef.current = lerp(sectionEnergyRef.current, 0, 0.025);
          energyFloorRef.current = lerp(energyFloorRef.current, 0, 0.04);
          energyPeakRef.current = lerp(energyPeakRef.current, 0, 0.035);
          emotionLevelRef.current = lerp(emotionLevelRef.current, 0, 0.05);
          emotionHoldRef.current = lerp(emotionHoldRef.current, 0, 0.04);
          presenceLevelRef.current = lerp(presenceLevelRef.current, 0, 0.16);
        }

        presenceDrive = clamp((presenceLevelRef.current * 0.82) + (playbackGateRef.current * 0.18), 0, 1);
      }

      const boostStrength = clamp(climaxDensityBoostStrength, 0.5, 3.0);
      const boostNorm = (boostStrength - 0.5) / 2.5;
      const responseGain = 0.95 + (boostNorm * 1.45);
      const densityPeakGain = 1.0 + (boostNorm * 0.85);
      const motionPeakGain = 1.0 + (boostNorm * 0.65);

      const motionPresence = enableClimaxDensityBoost ? Math.pow(presenceDrive, 0.9) : 1;
      const densityPresence = enableClimaxDensityBoost ? Math.pow(presenceDrive, 1.05) : 1;
      const accentPresence = enableClimaxDensityBoost ? Math.pow(presenceDrive, 1.25) : 1;
      const gatedEmotionDrive = emotionDrive * motionPresence;
      const gatedTransientDrive = transientDrive * accentPresence;

      const densityBoost = enableClimaxDensityBoost
        ? lerp(
            0.12,
            1 + (gatedEmotionDrive * 0.82 * responseGain * densityPeakGain) + (bassDrive * (0.16 + (boostNorm * 0.18))) + (gatedTransientDrive * (0.06 + (boostNorm * 0.08))),
            densityPresence
          )
        : 1;
      const speedBoost = enableClimaxDensityBoost
        ? lerp(0.42, 1 + (gatedEmotionDrive * 0.18 * responseGain * motionPeakGain) + (midDrive * (0.08 + (boostNorm * 0.07))), motionPresence)
        : 1;
      const sizeBoost = enableClimaxDensityBoost
        ? lerp(0.54, 1 + (gatedEmotionDrive * 0.14 * (0.95 + (boostNorm * 0.7))) + (airDrive * (0.05 + (boostNorm * 0.05))), motionPresence)
        : 1;
      const flowBoost = enableClimaxDensityBoost
        ? lerp(0.26, 1 + (gatedEmotionDrive * 0.24 * responseGain * motionPeakGain) + (midDrive * (0.08 + (boostNorm * 0.1))), motionPresence)
        : 1;
      const alphaBoost = enableClimaxDensityBoost
        ? lerp(0.3, 1 + (airDrive * (0.1 + (boostNorm * 0.08))) + (gatedTransientDrive * (0.08 + (boostNorm * 0.09))), motionPresence)
        : 1;
      const renderPresenceAlpha = enableClimaxDensityBoost ? lerp(0.24, 1, motionPresence) : 1;
      const lifeStepMultiplier = enableClimaxDensityBoost ? lerp(1.85, 1, densityPresence) : 1;

      const finalSpeedMultiplier = particleBaseSpeed * speedBoost;
      const maxDensityCap = 2.8 + (boostNorm * 1.0);
      const densityValue = clamp(baseParticleDensity * densityBoost, 0.2, maxDensityCap);
      const minParticles = enableClimaxDensityBoost ? Math.max(2, Math.round(lerp(2, 24, densityPresence))) : 24;
      const densityMaxParticles = Math.max(minParticles, Math.floor(MAX_PARTICLES * densityValue));
      const rad = (particleDirection || 0) * (Math.PI / 180);
      const dirX = Math.cos(rad); const dirY = Math.sin(rad);
      const crossX = -dirY;
      const crossY = dirX;
      const motionProfile = getMotionProfile(particleType);
      const densityInfluence = 0.48 + (0.52 * clamp(densityValue / Math.max(baseParticleDensity, 0.2), 0.4, 2.1));
      const baseSpawnProbability = enableClimaxDensityBoost
        ? lerp(
            clamp(0.0015 + (baseParticleDensity * 0.004), 0.001, 0.015),
            clamp((0.026 + (baseParticleDensity * 0.028)) * densityInfluence * (0.78 + (bassDrive * 0.22)) * (1 + (boostNorm * 0.32)), 0.01, 0.5),
            densityPresence
          )
        : clamp((0.045 + (baseParticleDensity * 0.035)) * densityInfluence, 0.012, 0.42);
      const spawnProbability = clamp(baseSpawnProbability, 0.002, 0.5);
      const activeSpawnCount = Math.max(
        1,
        Math.round(1 + (Math.max(0, densityValue - 1) * (1.65 + (boostNorm * 0.55))) + (gatedEmotionDrive * (1.45 + (boostNorm * 1.35))) + (bassDrive * (0.4 + (boostNorm * 0.35))))
      );
      const spawnCount = enableClimaxDensityBoost
        ? Math.max(1, Math.round(lerp(1, activeSpawnCount, densityPresence)))
        : Math.max(1, Math.round(1 + (Math.max(0, densityValue - 1) * 1.75)));

      if (Math.random() < spawnProbability) {
        const availableSlots = Math.max(0, densityMaxParticles - particlesRef.current.length);
        const particlesToSpawn = Math.min(spawnCount, availableSlots);

        for (let i = 0; i < particlesToSpawn; i++) {
            let chosenPalette: string[] = ['#ffffff'];

            // Priority logic for singer override
            if (singerOverrideColors && singerOverrideColors.length > 0) {
                // Random selection from the override palette
                chosenPalette = [singerOverrideColors[Math.floor(Math.random() * singerOverrideColors.length)]];
            } else if (useThemeColor) {
               if (themeMode === 'colorful' && colorfulColors.length > 0) chosenPalette = [colorfulColors[Math.floor(Math.random() * colorfulColors.length)]];
               else chosenPalette = [themeColor];
            } else if (particlePalettes && particlePalettes.length > 0) {
               chosenPalette = particlePalettes[Math.floor(Math.random() * particlePalettes.length)];
            }

            const baseSize = Math.random() * 2.2 + 1.0;
            const scaledSize = baseSize * particleSize * sizeBoost;
            const mainSpeed = (Math.random() * 1.4 + 0.9) * speedBoost;
            const driftSpeed = (Math.random() - 0.5) * (1.5 + (emotionDrive * 0.8)) * motionProfile.drift;
            const vX = (dirX * mainSpeed) + (crossX * driftSpeed);
            const vY = (dirY * mainSpeed) + (crossY * driftSpeed);
            
            const w = viewWidth; const h = viewHeight;
            const buffer = 50;
            const fluxX = h * Math.abs(dirX); const fluxY = w * Math.abs(dirY);
            const totalFlux = fluxX + fluxY;
            
            let startX = 0, startY = 0;
            const randFlux = Math.random() * totalFlux;
            if (randFlux < fluxX) { startY = Math.random() * h; startX = dirX > 0 ? -buffer : w + buffer; }
            else { startX = Math.random() * w; startY = dirY > 0 ? -buffer : h + buffer; }

            // Keep particles traveling visually meaningful distances even at low base speed.
            // 65% target full-screen distance, 35% target half-screen distance.
            const screenTravelBase = Math.hypot(w, h);
            const travelTarget = screenTravelBase * (Math.random() < 0.65 ? 1 : 0.5);
            const velocityMag = Math.hypot(vX, vY);
            const effectiveSpeed = Math.max(velocityMag * Math.max(finalSpeedMultiplier, MIN_SPEED_MULTIPLIER), 0.01);
            const travelLife = travelTarget / effectiveSpeed;
            const legacyLife = BASE_PARTICLE_LIFETIME + Math.random() * PARTICLE_LIFETIME_VARIANCE;
            const resolvedLife = clamp(Math.max(legacyLife, travelLife) * motionProfile.life, MIN_PARTICLE_LIFETIME, MAX_PARTICLE_LIFETIME);

            particlesRef.current.push({
                x: startX, y: startY, vx: vX, vy: vY, size: scaledSize, alpha: clamp((0.12 + (Math.random() * 0.35)) * alphaBoost, 0.08, 0.65),
                life: 0, maxLife: resolvedLife, rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1 * motionProfile.rotation, palette: chosenPalette,
                flowPhase: Math.random() * Math.PI * 2,
                flowFrequency: (0.35 + Math.random() * 0.55) * motionProfile.frequency,
                flowAmplitude: (0.25 + Math.random() * 1.2) * flowBoost * motionProfile.crossFlow,
                wobblePhase: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.8 + (Math.random() * 1.1),
                headingOffset: motionProfile.headingOffset + ((Math.random() - 0.5) * 0.2 * motionProfile.wobble)
            });
        }
      }

      const time = performance.now() * 0.001;
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life += lifeStepMultiplier;
        const baseAdvanceX = p.vx * finalSpeedMultiplier;
        const baseAdvanceY = p.vy * finalSpeedMultiplier;
        p.x += baseAdvanceX;
        p.y += baseAdvanceY;

        // Direction-aware curl field so drifting stays natural regardless of emission angle.
        const along = (p.x * dirX) + (p.y * dirY);
        const across = (p.x * crossX) + (p.y * crossY);
        const ribbonWave = Math.sin((along * 0.0074) + (time * p.flowFrequency) + p.flowPhase);
        const sideWave = Math.sin((across * 0.0125) - (time * (0.34 + (p.flowFrequency * 0.18))) + (p.flowPhase * 0.6));
        const eddyWave = Math.sin(((along + across) * 0.0046) + (time * 0.58 * motionProfile.eddy) + (p.flowPhase * 1.7));
        const flutter = Math.sin((time * 1.7 * motionProfile.flutter) + (p.life * 0.012) + (p.flowPhase * 1.3));
        const crossFlow = (
          (ribbonWave * 0.58) +
          (sideWave * 0.3) +
          (eddyWave * 0.22 * motionProfile.eddy) +
          (flutter * 0.08 * motionProfile.flutter)
        ) * p.flowAmplitude * finalSpeedMultiplier * motionProfile.crossFlow;
        const alongFlow = (
          (sideWave * 0.12 * motionProfile.alongFlow) +
          (eddyWave * 0.1 * motionProfile.alongFlow) -
          (flutter * 0.04 * motionProfile.flutter)
        ) * p.flowAmplitude * finalSpeedMultiplier;
        const flowOffsetX = (crossX * crossFlow) + (dirX * alongFlow);
        const flowOffsetY = (crossY * crossFlow) + (dirY * alongFlow);
        p.x += flowOffsetX;
        p.y += flowOffsetY;

        const netVx = baseAdvanceX + flowOffsetX;
        const netVy = baseAdvanceY + flowOffsetY;
        const velocityAngle = Math.atan2(
          Math.abs(netVy) > 0.0001 ? netVy : dirY,
          Math.abs(netVx) > 0.0001 ? netVx : dirX
        );
        const wobbleAngle = Math.sin((time * p.wobbleSpeed) + p.wobblePhase + (p.life * 0.01)) * (0.12 + (motionProfile.wobble * 0.22));
        const freeSpin = p.rotation + (p.rotationSpeed * finalSpeedMultiplier);
        const targetRotation = velocityAngle + p.headingOffset + wobbleAngle;
        const followAmount = clamp(0.012 + (motionProfile.alignment * 0.055), 0.008, 0.09);
        p.rotation = lerpAngle(freeSpin, targetRotation, followAmount);

        const fadeOutRange = Math.min(240, Math.max(60, p.maxLife * 0.35));
        let currentRenderAlpha = p.alpha;
        if (p.life > p.maxLife - fadeOutRange) {
            const fadeFactor = (p.maxLife - p.life) / fadeOutRange;
            currentRenderAlpha = p.alpha * Math.max(0, fadeFactor);
        }
        currentRenderAlpha *= renderPresenceAlpha;
        
        const buffer = 100;
        const outOfBounds = p.x < -buffer || p.x > viewWidth + buffer || p.y < -buffer || p.y > viewHeight + buffer;
        if (outOfBounds || p.life >= p.maxLife) { particlesRef.current.splice(i, 1); continue; }

        if (particleType === 'circle') drawCircle(ctx, p, currentRenderAlpha);
        else if (particleType === 'sakura') drawSakura(ctx, p, currentRenderAlpha);
        else if (particleType === 'lily') drawLily(ctx, p, currentRenderAlpha);
        else if (particleType === 'rose') drawRose(ctx, p, currentRenderAlpha);
        else if (particleType === 'snowflake') drawSnowflake(ctx, p, currentRenderAlpha);
        else if (particleType === 'star') drawStar(ctx, p, currentRenderAlpha);
        else if (particleType === 'dandelion') drawDandelion(ctx, p, currentRenderAlpha);
        else if (particleType === 'peach') drawPeach(ctx, p, currentRenderAlpha);
        else if (particleType === 'chrysanthemum') drawChrysanthemum(ctx, p, currentRenderAlpha);
        else if (particleType === 'begonia') drawBegonia(ctx, p, currentRenderAlpha);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isPlaying, themeColor, colorfulColors, enabled, enableClimaxDensityBoost, climaxDensitySensitivity, climaxDensityBoostStrength, particleSize, particleBaseSpeed, baseParticleDensity, particleType, themeMode, particleDirection, particlePalettes, useThemeColor, singerOverrideColors]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-[1] pointer-events-none" style={{ mixBlendMode: isDarkBase ? 'screen' : 'multiply' }} />;
};

export default GlobalParticles;
