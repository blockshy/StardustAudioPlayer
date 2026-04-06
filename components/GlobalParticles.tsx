
import React, { useEffect, useRef } from 'react';
import { hexToRgb } from '../utils/colorUtils';
import { ParticleType, ParticleDirection, ThemeMode } from '../types';

interface GlobalParticlesProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  themeColor: string;
  colorfulColors?: string[];
  enabled: boolean;
  beatSync: boolean; 
  sensitivity: number;
  particleSize?: number; 
  particleBaseSpeed?: number; 
  particleType: ParticleType;
  particleDirection?: ParticleDirection; 
  particlePalettes?: string[][];
  useThemeColor?: boolean;
  themeMode: ThemeMode;
  customParticleUrl?: string | null;
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
}

const GlobalParticles: React.FC<GlobalParticlesProps> = ({
  analyser, isPlaying, themeColor, colorfulColors = [], enabled, beatSync, sensitivity,
  particleSize = 1.0, particleBaseSpeed = 1.0, particleType, particleDirection = 270,
  particlePalettes = [['#ffffff']], useThemeColor = true, themeMode, customParticleUrl,
  singerOverrideColors
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const customImgRef = useRef<HTMLImageElement | null>(null);

  const isDarkBase = themeMode !== 'light';

  useEffect(() => {
    if (particleType === 'custom' && customParticleUrl) {
      const img = new Image();
      img.src = customParticleUrl;
      img.onload = () => { customImgRef.current = img; };
    } else customImgRef.current = null;
  }, [particleType, customParticleUrl]);

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

  const drawCircle = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
      ctx.save(); ctx.translate(p.x, p.y); setCtxStyle(ctx, p, renderAlpha);
      ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  };

  const drawCustom = (ctx: CanvasRenderingContext2D, p: Particle, renderAlpha: number) => {
      if (!customImgRef.current) { drawCircle(ctx, p, renderAlpha); return; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.globalAlpha = renderAlpha;
      const s = p.size * 2; ctx.drawImage(customImgRef.current, -s/2, -s/2, s, s); ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    let dataArray: Uint8Array;
    if (analyser) dataArray = new Uint8Array(analyser.frequencyBinCount);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!enabled) { particlesRef.current = []; animationRef.current = requestAnimationFrame(render); return; }

      let bassIntensity = 0;
      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(new Uint8Array(dataArray));
        const bassBins = dataArray.slice(0, 16);
        const avgBass = bassBins.reduce((a, b) => a + b, 0) / bassBins.length;
        bassIntensity = (avgBass / 255) * sensitivity;
      }
      
      const dynamicAcceleration = beatSync && isPlaying ? (1 + (bassIntensity * 3.5)) : 1;
      const finalSpeedMultiplier = dynamicAcceleration * particleBaseSpeed;
      const rad = (particleDirection || 0) * (Math.PI / 180);
      const dirX = Math.cos(rad); const dirY = Math.sin(rad);
      const spawnThreshold = isPlaying ? 0.9 - (bassIntensity * 0.5) : 0.99; 
      const spawnCount = bassIntensity > 0.6 ? Math.floor(bassIntensity * 3) : 1;

      if (Math.random() > spawnThreshold) {
        for(let i=0; i<spawnCount; i++) {
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

            const baseSize = Math.random() * 3 + (bassIntensity * 4);
            const scaledSize = baseSize * particleSize;
            const mainSpeed = (Math.random() * 2 + 1) + (bassIntensity * 3);
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

            particlesRef.current.push({
                x: startX, y: startY, vx: vX, vy: vY, size: scaledSize, alpha: 0.1 + Math.random() * 0.4,
                life: 0, maxLife: 100 + Math.random() * 200, rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1, palette: chosenPalette
            });
        }
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life++; p.x += p.vx * finalSpeedMultiplier; p.y += p.vy * finalSpeedMultiplier;
        p.rotation += p.rotationSpeed * finalSpeedMultiplier;
        const oscVal = Math.sin(p.life * 0.02) * 0.5;
        p.x += (-dirY) * oscVal; p.y += dirX * oscVal;

        const fadeOutRange = 100;
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
        else if (particleType === 'snowflake') drawSnowflake(ctx, p, currentRenderAlpha);
        else if (particleType === 'star') drawStar(ctx, p, currentRenderAlpha);
        else if (particleType === 'custom') drawCustom(ctx, p, currentRenderAlpha);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isPlaying, themeColor, colorfulColors, enabled, beatSync, sensitivity, particleSize, particleBaseSpeed, particleType, themeMode, customParticleUrl, particleDirection, particlePalettes, useThemeColor, singerOverrideColors]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-[1] pointer-events-none" style={{ mixBlendMode: isDarkBase ? 'screen' : 'multiply' }} />;
};

export default GlobalParticles;
