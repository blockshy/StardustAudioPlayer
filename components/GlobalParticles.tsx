
import React, { useEffect, useRef } from 'react';
import { hexToRgb } from '../utils/colorUtils';
import { ParticleType, ParticleDirection, ThemeMode } from '../types';

const MAX_PARTICLES = 240;
const BASE_PARTICLE_LIFETIME = 90;
const PARTICLE_LIFETIME_VARIANCE = 120;
const MIN_SPEED_MULTIPLIER = 0.05;
const MIN_PARTICLE_LIFETIME = 120;
const MAX_PARTICLE_LIFETIME = 1600;

interface GlobalParticlesProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  themeColor: string;
  colorfulColors?: string[];
  enabled: boolean;
  enableClimaxDensityBoost?: boolean;
  climaxDensitySensitivity?: number;
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
}

const GlobalParticles: React.FC<GlobalParticlesProps> = ({
  analyser, isPlaying, themeColor, colorfulColors = [], enabled, enableClimaxDensityBoost = true, climaxDensitySensitivity = 1.0,
  particleSize = 1.0, particleBaseSpeed = 1.0, baseParticleDensity = 1.0, particleType, particleDirection = 270,
  particlePalettes = [['#ffffff']], useThemeColor = true, themeMode,
  singerOverrideColors
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const shortEnergyRef = useRef(0);
  const longEnergyRef = useRef(0);
  const prevShortEnergyRef = useRef(0);
  const climaxLevelRef = useRef(0);

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

  const drawSakura = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); setCtxStyle(ctx, p, renderAlpha);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(p.size, -p.size, 0, -p.size * 1.8);
    ctx.quadraticCurveTo(-p.size, -p.size, 0, 0); ctx.fill(); ctx.restore();
  };

  const drawSnowflake = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); setCtxStyle(ctx, p, renderAlpha);
    ctx.lineWidth = p.size / 5; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i < 6; i++) { ctx.moveTo(0, 0); ctx.lineTo(0, p.size); ctx.rotate(Math.PI / 3); }
    ctx.stroke(); ctx.restore();
  };

  const drawStar = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); setCtxStyle(ctx, p, renderAlpha);
      ctx.beginPath(); const spikes = 5; const outerRadius = p.size; const innerRadius = p.size / 2;
      for(let i=0; i<spikes * 2; i++){ const r = (i % 2 === 0) ? outerRadius : innerRadius; const angle = (Math.PI * i) / spikes; ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r); }
      ctx.closePath(); ctx.fill(); ctx.restore();
  };

  const drawLily = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); setCtxStyle(ctx, p, renderAlpha);
      const petalLength = p.size * 1.9;
      const petalWidth = p.size * 0.8;
      for (let i = 0; i < 6; i++) {
          ctx.save();
          ctx.rotate((Math.PI * 2 * i) / 6);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(petalWidth, -petalLength * 0.2, petalWidth, -petalLength * 0.8, 0, -petalLength);
          ctx.bezierCurveTo(-petalWidth, -petalLength * 0.8, -petalWidth, -petalLength * 0.2, 0, 0);
          ctx.fill();
          ctx.restore();
      }
      // Stamen center
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
  };

  const drawRose = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); setCtxStyle(ctx, p, renderAlpha);
      const ringCount = 4;
      for (let ring = 0; ring < ringCount; ring++) {
          const petals = 4 + ring * 2;
          const radius = p.size * (0.35 + ring * 0.28);
          for (let i = 0; i < petals; i++) {
              ctx.save();
              ctx.rotate((Math.PI * 2 * i) / petals + ring * 0.18);
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.bezierCurveTo(radius * 0.7, -radius * 0.15, radius * 0.75, -radius * 0.85, 0, -radius);
              ctx.bezierCurveTo(-radius * 0.75, -radius * 0.85, -radius * 0.7, -radius * 0.15, 0, 0);
              ctx.fill();
              ctx.restore();
          }
      }
      ctx.restore();
  };

  const drawCircle = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
      ctx.save(); ctx.translate(p.x, p.y); setCtxStyle(ctx, p, renderAlpha);
      ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  };

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    if (analyser) {
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount) as unknown as Uint8Array<ArrayBuffer>;
    } else {
      frequencyDataRef.current = null;
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!enabled) { particlesRef.current = []; animationRef.current = requestAnimationFrame(render); return; }

      let energyIntensity = 0;
      const frequencyData = frequencyDataRef.current;
      if (analyser && isPlaying && frequencyData) {
        analyser.getByteFrequencyData(frequencyData);
        const bins = frequencyData.length;
        let energyTotal = 0;
        for (let i = 0; i < bins; i++) {
          energyTotal += frequencyData[i];
        }
        const normalizedEnergy = (energyTotal / bins) / 255;
        energyIntensity = normalizedEnergy;
        const climaxInput = normalizedEnergy * climaxDensitySensitivity;

        const shortEnergy = shortEnergyRef.current * 0.88 + climaxInput * 0.12;
        const longEnergy = longEnergyRef.current * 0.985 + climaxInput * 0.015;
        const flux = Math.max(0, shortEnergy - prevShortEnergyRef.current);
        prevShortEnergyRef.current = shortEnergy;
        shortEnergyRef.current = shortEnergy;
        longEnergyRef.current = longEnergy;

        const ratio = longEnergy > 0.001 ? shortEnergy / longEnergy : 1;
        const ratioBoost = clamp((ratio - 1) * 0.95, 0, 1.2);
        const fluxBoost = clamp(flux * 4.2, 0, 1.0);
        const loudnessBoost = clamp((shortEnergy - 0.24) * 1.25, 0, 1.0);
        const rawClimax = clamp((ratioBoost * 0.55) + (fluxBoost * 0.3) + (loudnessBoost * 0.35), 0, 1.5);

        const prevClimax = climaxLevelRef.current;
        climaxLevelRef.current = rawClimax > prevClimax
          ? prevClimax * 0.84 + rawClimax * 0.16
          : prevClimax * 0.96 + rawClimax * 0.04;
      } else {
        shortEnergyRef.current *= 0.9;
        longEnergyRef.current *= 0.98;
        prevShortEnergyRef.current = shortEnergyRef.current;
        climaxLevelRef.current *= 0.95;
      }

      const finalSpeedMultiplier = particleBaseSpeed;
      const climaxDensityBoost = enableClimaxDensityBoost ? (1 + (climaxLevelRef.current * 0.85)) : 1;
      const densityValue = clamp(baseParticleDensity * climaxDensityBoost, 0.2, 3.5);
      const densityMaxParticles = Math.max(24, Math.floor(MAX_PARTICLES * densityValue));
      const rad = (particleDirection || 0) * (Math.PI / 180);
      const dirX = Math.cos(rad); const dirY = Math.sin(rad);
      const baseSpawnProbability = isPlaying ? clamp(0.05 + (energyIntensity * 0.22), 0.04, 0.4) : 0.012;
      const densityInfluence = 0.35 + (0.65 * clamp(densityValue / 1.2, 0.25, 2.2));
      const spawnProbability = clamp(baseSpawnProbability * densityInfluence, 0.01, 0.78);
      const spawnCount = Math.max(1, Math.round(1 + ((densityValue - 1) * 1.8) + (climaxLevelRef.current * 1.6)));

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

            const baseSize = Math.random() * 3 + (energyIntensity * 4);
            const scaledSize = baseSize * particleSize;
            const mainSpeed = (Math.random() * 2 + 1) + (energyIntensity * 3);
            const driftSpeed = (Math.random() - 0.5) * 2;
            const driftX = Math.cos(rad + Math.PI / 2);
            const driftY = Math.sin(rad + Math.PI / 2);
            const vX = (dirX * mainSpeed) + (driftX * driftSpeed);
            const vY = (dirY * mainSpeed) + (driftY * driftSpeed);
            
            const w = canvas.width; const h = canvas.height;
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
            const effectiveSpeed = Math.max(velocityMag * Math.max(particleBaseSpeed, MIN_SPEED_MULTIPLIER), 0.01);
            const travelLife = travelTarget / effectiveSpeed;
            const legacyLife = BASE_PARTICLE_LIFETIME + Math.random() * PARTICLE_LIFETIME_VARIANCE;
            const resolvedLife = clamp(Math.max(legacyLife, travelLife), MIN_PARTICLE_LIFETIME, MAX_PARTICLE_LIFETIME);

            particlesRef.current.push({
                x: startX, y: startY, vx: vX, vy: vY, size: scaledSize, alpha: 0.1 + Math.random() * 0.4,
                life: 0, maxLife: resolvedLife, rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1, palette: chosenPalette,
                flowPhase: Math.random() * Math.PI * 2,
                flowFrequency: 0.35 + Math.random() * 0.55,
                flowAmplitude: 0.25 + Math.random() * 1.2
            });
        }
      }

      const time = performance.now() * 0.001;
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life++; p.x += p.vx * finalSpeedMultiplier; p.y += p.vy * finalSpeedMultiplier;
        p.rotation += p.rotationSpeed * finalSpeedMultiplier;

        // Multi-layer flow field for natural drifting.
        const crossX = -dirY;
        const crossY = dirX;
        const localFlow = Math.sin((p.y * 0.008) + (time * p.flowFrequency) + p.flowPhase);
        const globalFlow = Math.sin((time * 0.32) + (p.flowPhase * 0.7));
        const flutter = Math.sin((time * 1.9) + (p.life * 0.01) + (p.flowPhase * 1.5));
        const flowOffset = (localFlow * 0.7 + globalFlow * 0.5 + flutter * 0.15) * p.flowAmplitude * finalSpeedMultiplier;
        p.x += crossX * flowOffset;
        p.y += crossY * flowOffset;

        const fadeOutRange = Math.min(240, Math.max(60, p.maxLife * 0.35));
        let currentRenderAlpha = p.alpha;
        if (p.life > p.maxLife - fadeOutRange) {
            const fadeFactor = (p.maxLife - p.life) / fadeOutRange;
            currentRenderAlpha = p.alpha * Math.max(0, fadeFactor);
        }
        
        const buffer = 100;
        const outOfBounds = p.x < -buffer || p.x > canvas.width + buffer || p.y < -buffer || p.y > canvas.height + buffer;
        if (outOfBounds || p.life >= p.maxLife) { particlesRef.current.splice(i, 1); continue; }

        if (particleType === 'circle') drawCircle(ctx, p, currentRenderAlpha);
        else if (particleType === 'sakura') drawSakura(ctx, p, currentRenderAlpha);
        else if (particleType === 'lily') drawLily(ctx, p, currentRenderAlpha);
        else if (particleType === 'rose') drawRose(ctx, p, currentRenderAlpha);
        else if (particleType === 'snowflake') drawSnowflake(ctx, p, currentRenderAlpha);
        else if (particleType === 'star') drawStar(ctx, p, currentRenderAlpha);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isPlaying, themeColor, colorfulColors, enabled, enableClimaxDensityBoost, climaxDensitySensitivity, particleSize, particleBaseSpeed, baseParticleDensity, particleType, themeMode, particleDirection, particlePalettes, useThemeColor, singerOverrideColors]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-[1] pointer-events-none" style={{ mixBlendMode: isDarkBase ? 'screen' : 'multiply' }} />;
};

export default GlobalParticles;
