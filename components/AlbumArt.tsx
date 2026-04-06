
import React, { useEffect, useRef, useState } from 'react';
import { MdAlbum } from 'react-icons/md';
import VinylDisk from './VinylDisk';
import { AppState } from '../types';

interface AlbumArtProps {
  appState: AppState;
  isPlaying: boolean;
  analyser: AnalyserNode | null;
  currentTime: number;
  duration: number;
  singerOverrideColors?: string[] | null;
}

const AlbumArt: React.FC<AlbumArtProps> = ({ appState, isPlaying, analyser, currentTime, duration, singerOverrideColors }) => {
  const { 
      coverUrl, 
      themeColor, 
      coverArtStyle, 
      vinylScale, 
      vinylSensitivity,
      enableAlbumProgress,
      albumProgressWidth,
      albumProgressOpacity
  } = appState;

  const containerRef = useRef<HTMLDivElement>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioRef = useRef(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const progress = duration > 0 ? currentTime / duration : 0;

  useEffect(() => {
    if (!analyser || !isPlaying) {
      setAudioLevel(0);
      return;
    }
    let animationFrameId: number;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      const bass = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
      const normalized = bass / 255;
      audioRef.current += (normalized - audioRef.current) * 0.2;
      setAudioLevel(audioRef.current);
      animationFrameId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(animationFrameId);
  }, [analyser, isPlaying]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || coverArtStyle !== '3d-card') return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -20;
    const rotateY = ((x - centerX) / centerX) * 20;
    setTilt({ x: rotateX, y: rotateY });
    setIsHovering(true);
  };

  const handleMouseLeave = () => { setTilt({ x: 0, y: 0 }); setIsHovering(false); };

  if (coverArtStyle === 'vinyl') {
    return (
      <VinylDisk 
        coverUrl={appState.coverUrl} 
        isPlaying={isPlaying} 
        analyser={analyser} 
        themeColor={singerOverrideColors && singerOverrideColors.length > 0 ? singerOverrideColors[0] : appState.themeColor}
        colorfulColors={singerOverrideColors || appState.colorfulColors}
        themeMode={appState.themeMode}
        sensitivity={appState.vinylSensitivity}
        styleType={appState.vinylStyle}
        labelSize={appState.vinylLabelSize}
        showCenterDot={appState.showVinylCenterDot}
        scale={appState.vinylScale}
        rotationSpeed={appState.vinylRotationSpeed}
        enableProgress={enableAlbumProgress}
        progress={progress}
        progressWidth={albumProgressWidth}
        progressOpacity={albumProgressOpacity}
      />
    );
  }

  const commonSizeClass = `relative flex items-center justify-center aspect-square shrink-0 w-[calc(min(65vw,35vh)*var(--vs))] h-[calc(min(65vw,35vh)*var(--vs))] max-w-[calc(400px*var(--vs))] max-h-[calc(400px*var(--vs))] landscape:w-[calc(min(40vh,40vw)*var(--vs))] landscape:h-[calc(min(40vh,40vw)*var(--vs))] landscape:max-h-[calc(400px*var(--vs))] landscape:max-w-[calc(400px*var(--vs))] lg:w-[calc(min(30vw,50vh)*var(--vs))] lg:h-[calc(min(30vw,50vh)*var(--vs))] lg:max-w-[calc(450px*var(--vs))] lg:max-h-[calc(450px*var(--vs))]`;
  
  const RectProgressOverlay = ({ borderRadius }: { borderRadius: number }) => {
      const activeColor = singerOverrideColors && singerOverrideColors.length > 0 ? singerOverrideColors[0] : themeColor;
      return (
          <div className="absolute inset-0 z-50 pointer-events-none">
             <svg className="w-full h-full overflow-visible">
                 {singerOverrideColors && singerOverrideColors.length > 1 && (
                     <defs>
                         <linearGradient id="rect-prog-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                             {singerOverrideColors.map((c, i) => (
                                 <stop key={i} offset={`${(i/(singerOverrideColors.length-1))*100}%`} stopColor={c} />
                             ))}
                         </linearGradient>
                     </defs>
                 )}
                 <rect 
                    x="0" y="0" width="100%" height="100%" rx={borderRadius} ry={borderRadius}
                    fill="none"
                    stroke={singerOverrideColors && singerOverrideColors.length > 1 ? "url(#rect-prog-grad)" : activeColor}
                    strokeWidth={albumProgressWidth} strokeLinecap="round" pathLength="1"
                    style={{
                        opacity: albumProgressOpacity,
                        strokeDasharray: '1', strokeDashoffset: 1 - progress,
                        transition: 'stroke-dashoffset 0.1s linear, stroke 0.8s ease'
                    }}
                 />
             </svg>
          </div>
      )
  };

  if (coverArtStyle === '3d-card') {
    return (
        <div ref={containerRef} className={commonSizeClass} style={{ '--vs': vinylScale } as React.CSSProperties} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <div className="relative w-full h-full transition-transform duration-100 ease-out" style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}>
                <div className="w-full h-full rounded-2xl shadow-2xl relative" style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${1 + (audioLevel * 0.05 * vinylSensitivity)})`, transition: isHovering ? 'none' : 'transform 0.5s ease', boxShadow: `${-tilt.y * 1.5}px ${tilt.x * 1.5}px 30px rgba(0,0,0,0.5)` }}>
                    {coverUrl ? <img src={coverUrl} alt="Album Art" className="w-full h-full object-cover rounded-2xl" /> : <div className="w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center"><MdAlbum size={50} className="text-white/20" /></div>}
                    <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: `linear-gradient(135deg, rgba(255,255,255,${0.1 + (audioLevel * 0.2)}) 0%, transparent 50%)`, mixBlendMode: 'overlay' }} />
                    <div className="absolute inset-0 rounded-2xl bg-black/50 -z-10 blur-md transform translate-z-[-20px]" style={{ transform: 'translateZ(-20px) scale(0.95)' }} />
                    {enableAlbumProgress && <RectProgressOverlay borderRadius={16} />}
                </div>
            </div>
        </div>
    );
  }
  return null;
};

export default AlbumArt;
