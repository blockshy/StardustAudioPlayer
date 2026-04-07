
import React from 'react';
import { MdAlbum } from 'react-icons/md';
import { VinylStyle, ThemeMode } from '../types';

interface VinylDiskProps {
  coverUrl: string | null;
  isPlaying: boolean;
  analyser: AnalyserNode | null;
  themeColor: string;
  colorfulColors?: string[];
  themeMode: ThemeMode;
  sensitivity: number;
  styleType: VinylStyle;
  labelSize: number; // Percentage
  showCenterDot: boolean;
  scale: number;
  rotationSpeed: number;
  coverImageScale?: number;
  coverImageX?: number;
  coverImageY?: number;
  
  // Progress Ring Props
  enableProgress?: boolean;
  progress?: number; // 0 to 1
  progressWidth?: number;
  progressOpacity?: number;
}

const VinylDisk: React.FC<VinylDiskProps> = ({ 
  coverUrl, 
  isPlaying, 
  analyser, 
  themeColor, 
  colorfulColors = [],
  themeMode,
  sensitivity,
  styleType,
  labelSize,
  showCenterDot,
  scale = 1.0,
  rotationSpeed = 1.0,
  coverImageScale = 1.05,
  coverImageX = 0,
  coverImageY = 0,
  enableProgress = false,
  progress = 0,
  progressWidth = 4,
  progressOpacity = 0.8
}) => {
  const isDarkBase = themeMode !== 'light';
  const isColorful = themeMode === 'colorful';
  
  const animationDuration = rotationSpeed > 0 ? `${6 / rotationSpeed}s` : '0s';

  const styles = {
    classic: {
      grooveColor: '#111',
      grooveGradient: `repeating-radial-gradient(#111 0, #111 2px, #1a1a1a 3px, #050505 4px)`,
      sheenOpacity: 0.15,
      sheenBlend: 'screen',
      labelBorder: 'border-[4px] border-[#151515]',
      texture: 'none',
      baseColor: '#0a0a0a'
    },
    vintage: {
      grooveColor: '#221f1b',
      grooveGradient: `repeating-radial-gradient(#2a2621 0, #2a2621 2px, #3d3630 3px, #1f1c18 4px)`,
      sheenOpacity: 0.08,
      sheenBlend: 'soft-light',
      labelBorder: 'border-[2px] border-[#3e352f]',
      texture: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.15\'/%3E%3C/svg%3E")',
      baseColor: '#1f1c18'
    },
    modern: {
      grooveColor: '#1a1a1a',
      grooveGradient: `repeating-radial-gradient(#1a1a1a 0, #1a1a1a 1px, #222 2px)`,
      sheenOpacity: 0.05,
      sheenBlend: 'overlay',
      labelBorder: 'border-none',
      texture: 'none',
      baseColor: '#1a1a1a'
    },
    neon: {
      grooveColor: '#000',
      grooveGradient: `repeating-radial-gradient(#000 0, #000 2px, #111 3px, #000 4px)`,
      sheenOpacity: 0.2,
      sheenBlend: 'screen',
      labelBorder: `border-[2px] border-[${themeColor}]`,
      texture: 'none',
      baseColor: '#000'
    }
  };

  const activeStyle = styles[styleType];
  const isMultiColor = colorfulColors && colorfulColors.length > 1;

  return (
    <div 
        className={`
            relative flex items-center justify-center aspect-square shrink-0
            w-[calc(min(65vw,35vh)*var(--vs))] h-[calc(min(65vw,35vh)*var(--vs))] max-w-[calc(400px*var(--vs))] max-h-[calc(400px*var(--vs))]
            landscape:w-[calc(min(40vh,40vw)*var(--vs))] landscape:h-[calc(min(40vh,40vw)*var(--vs))] landscape:max-h-[calc(400px*var(--vs))] landscape:max-w-[calc(400px*var(--vs))]
            lg:w-[calc(min(30vw,50vh)*var(--vs))] lg:h-[calc(min(30vw,50vh)*var(--vs))] lg:max-w-[calc(450px*var(--vs))] lg:max-h-[calc(450px*var(--vs))]
        `}
        style={{ '--vs': scale } as React.CSSProperties}
    >
      
      {styleType === 'neon' && (
          <div className="absolute inset-[-2px] rounded-full opacity-60 blur-sm" style={{border: `2px solid ${themeColor}`}}></div>
      )}

      <div 
        className={`relative z-10 w-full h-full rounded-full shadow-2xl flex items-center justify-center animate-spin will-change-transform`}
        style={{ 
            animationDuration: animationDuration,
            animationPlayState: isPlaying ? 'running' : 'paused',
            backgroundColor: activeStyle.baseColor,
            boxShadow: isDarkBase 
                ? '0 10px 30px -10px rgba(0,0,0,0.8)' 
                : '0 20px 40px -10px rgba(0,0,0,0.3)'
        }}
      >
        <div className="absolute inset-1 rounded-full opacity-90"
            style={{
                background: activeStyle.grooveGradient
            }}
        ></div>

        {isColorful && (
             <div className="absolute inset-0 rounded-full opacity-30 pointer-events-none mix-blend-overlay" 
                  style={{
                      background: `conic-gradient(from 180deg, ${colorfulColors.length > 0 ? colorfulColors.join(', ') + ', ' + colorfulColors[0] : themeColor + ', transparent, ' + themeColor})`
                  }}></div>
        )}
        
        {activeStyle.texture !== 'none' && (
            <div className="absolute inset-0 rounded-full mix-blend-overlay opacity-50"
                 style={{ backgroundImage: activeStyle.texture }}></div>
        )}

        <div 
            className={`absolute rounded-full overflow-hidden shadow-inner bg-[#222] flex items-center justify-center z-20 ${activeStyle.labelBorder}`}
            style={{ 
                width: `${labelSize}%`,
                height: `${labelSize}%`,
                borderColor: styleType === 'neon' ? themeColor : undefined,
                transition: 'all 0.3s ease'
             }}
        >
          {coverUrl ? (
            <div className="w-full h-full relative">
                <img src={coverUrl} alt="Album Cover" className="w-full h-full object-cover opacity-95" style={{ objectPosition: `${50 + coverImageX}% ${50 + coverImageY}%` }} />
                <div className="absolute inset-0 bg-white/10 mix-blend-overlay pointer-events-none" 
                     style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '4px 4px'}}></div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-white/20">
               <MdAlbum size="50%" />
            </div>
          )}
        </div>
        
        {showCenterDot && (
             <div className="absolute w-[3%] h-[3%] bg-[#050505] border border-[#333] rounded-full z-30 shadow-inner"></div>
        )}
      </div>

      <div className="absolute inset-0 rounded-full z-20 pointer-events-none">
          <div 
            className="absolute inset-0 rounded-full"
            style={{
                background: `linear-gradient(135deg, rgba(255,255,255,${activeStyle.sheenOpacity}) 0%, transparent 40%, transparent 60%, rgba(255,255,255,${activeStyle.sheenOpacity/2}) 100%)`,
                mixBlendMode: activeStyle.sheenBlend as any
            }}
          />
          <div 
            className="absolute inset-0 rounded-full"
            style={{
                background: `radial-gradient(circle at 30% 30%, transparent 50%, rgba(255,255,255,${activeStyle.sheenOpacity}) 55%, transparent 70%)`,
                mixBlendMode: activeStyle.sheenBlend as any,
                filter: 'blur(1px)'
            }}
          />
           {styleType !== 'modern' && (
               <div 
                className="absolute inset-0 rounded-full opacity-30"
                style={{
                    background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.1) 30deg, transparent 60deg, transparent 120deg, transparent 180deg, transparent 210deg, rgba(255,255,255,0.1) 240deg, transparent 270deg)',
                    mixBlendMode: 'overlay',
                    transform: 'rotate(-45deg)'
                }}
               />
           )}
      </div>
      
      {enableProgress && (
          <div className="absolute inset-0 z-30 pointer-events-none">
             <svg className="w-full h-full rotate-[-90deg] overflow-visible">
                 {isMultiColor && (
                     <defs>
                         <linearGradient id="vinyl-prog-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                             {colorfulColors.map((c, i) => (
                                 <stop key={i} offset={`${(i/(colorfulColors.length-1))*100}%`} stopColor={c} />
                             ))}
                         </linearGradient>
                     </defs>
                 )}
                 <circle
                    cx="50%"
                    cy="50%"
                    r="49%" 
                    fill="none"
                    stroke={isMultiColor ? "url(#vinyl-prog-grad)" : themeColor}
                    strokeWidth={progressWidth}
                    strokeLinecap="round"
                    pathLength="1"
                    style={{
                        opacity: progressOpacity,
                        strokeDasharray: '1',
                        strokeDashoffset: 1 - progress,
                        transition: 'stroke-dashoffset 0.1s linear, stroke 0.8s ease'
                    }}
                 />
             </svg>
          </div>
      )}

    </div>
  );
};

export default VinylDisk;
