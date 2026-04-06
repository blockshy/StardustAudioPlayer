
import React, { useEffect, useRef } from 'react';
import { hexToRgb } from '../utils/colorUtils';
import { ThemeMode } from '../types';

interface VisualizerBarProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  themeColor: string;
  enableWaves: boolean;
  enableParticles: boolean; 
  themeMode: ThemeMode;
  colorfulThemeBase?: 'light' | 'dark';
  sensitivity: number;
  waveHeight: number; 
  blur: number;
  singerOverrideColors?: string[] | null;
}

const VisualizerBar: React.FC<VisualizerBarProps> = ({ 
  analyser, isPlaying, themeColor, enableWaves, themeMode, colorfulThemeBase = 'light',
  sensitivity, waveHeight, blur, singerOverrideColors
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  let isDarkBase = true;
  if (themeMode === 'light') isDarkBase = false;
  else if (themeMode === 'colorful') isDarkBase = colorfulThemeBase === 'dark';

  const smoothedVolumeRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    let dataArray: Uint8Array;
    if (analyser) dataArray = new Uint8Array(analyser.fftSize);

    const render = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.width / (window.devicePixelRatio || 1);
      const height = canvasRef.current.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, width, height);
      if (!enableWaves) {
          animationRef.current = requestAnimationFrame(render);
          return;
      }

      let rms = 0;
      if (analyser && isPlaying) {
         analyser.getByteTimeDomainData(dataArray);
         let sum = 0;
         for(let i = 0; i < dataArray.length; i++) {
             const amplitude = (dataArray[i] - 128) / 128.0;
             sum += amplitude * amplitude;
         }
         rms = Math.sqrt(sum / dataArray.length);
      } else rms = 0.005;

      const targetVolume = Math.max(rms * sensitivity, 0.02);
      smoothedVolumeRef.current += (targetVolume - smoothedVolumeRef.current) * 0.1;
      const volume = smoothedVolumeRef.current;
      phaseRef.current += 0.02 + (volume * 0.05);
      const phase = phaseRef.current;

      const layers = 3;
      const baseWaterLevel = height - (height * (Math.max(waveHeight, 1) / 100));

      for (let l = 0; l < layers; l++) {
        ctx.beginPath();
        const layerPhaseOffset = l * 2;
        const frequency = 2 + l * 0.5;
        const amplitude = Math.min(height * 0.1, 30) * volume * (1 + l * 0.2); 
        const alpha = isDarkBase ? (0.4 - l * 0.1) : (0.3 - l * 0.08);
        
        // Multi-color support
        let gradient: CanvasGradient;
        if (singerOverrideColors && singerOverrideColors.length > 1) {
            gradient = ctx.createLinearGradient(0, baseWaterLevel - amplitude, width, height);
            singerOverrideColors.forEach((color, idx) => {
                const rgb = hexToRgb(color) || {r:255,g:255,b:255};
                gradient.addColorStop(idx / (singerOverrideColors.length - 1), `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`);
            });
        } else {
            const activeColor = singerOverrideColors && singerOverrideColors[0] ? singerOverrideColors[0] : themeColor;
            const rgb = hexToRgb(activeColor) || { r: 255, g: 255, b: 255 };
            gradient = ctx.createLinearGradient(0, baseWaterLevel - amplitude, 0, height);
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 1.5})`);
        }
        
        ctx.fillStyle = gradient;
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 5) {
            const nx = x / width;
            const sine = Math.sin(nx * Math.PI * frequency + phase + layerPhaseOffset);
            const detail = Math.sin(nx * Math.PI * (frequency * 2) - phase) * 0.2;
            const y = baseWaterLevel + (sine + detail) * amplitude;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
      }
      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      resizeObserver.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isPlaying, themeColor, enableWaves, themeMode, sensitivity, isDarkBase, waveHeight, singerOverrideColors]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300" style={{ filter: `blur(${blur}px)` }} />;
};

export default VisualizerBar;
