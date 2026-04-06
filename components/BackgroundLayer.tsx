
import React from 'react';
import { AppState } from '../types';

interface BackgroundLayerProps {
    appState: AppState;
}

const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ appState }) => {
    const isColorfulLight = appState.themeMode === 'colorful' && appState.colorfulThemeBase === 'light';
    const isLightMode = appState.themeMode === 'light' || isColorfulLight;

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {appState.backgroundImageUrl ? (
                <>
                    <div 
                        className="absolute inset-0 bg-cover bg-center will-change-transform"
                        style={{ 
                            backgroundImage: `url(${appState.backgroundImageUrl})`,
                            transition: 'transform 0.1s linear, filter 1s ease-in-out',
                            transform: `scale(${appState.backgroundImageScale}) translate(${appState.backgroundImageX}%, ${appState.backgroundImageY}%)`,
                            filter: isLightMode 
                                ? 'grayscale(10%) brightness(1.05) contrast(0.95)' 
                                : 'grayscale(30%) brightness(0.5) contrast(1.1)' 
                        }}
                    />
                    <div className={`absolute inset-0 transition-colors duration-1000 ${isLightMode ? 'bg-white/60' : 'bg-black/60'}`} />
                </>
            ) : (
            <>
                {appState.themeMode === 'colorful' ? (
                    <div className="absolute inset-0 animate-fade-in transition-all duration-[2000ms]">
                        {appState.colorfulColors.map((color, index) => {
                            const posX = 20 + ((index * 35) % 80); 
                            const posY = 20 + ((index * 25) % 80);
                            return (
                                <div key={index} 
                                    className={`absolute inset-0 opacity-40 ${isColorfulLight ? 'mix-blend-multiply' : 'mix-blend-screen'}`} 
                                    style={{
                                        background: `radial-gradient(circle at ${posX}% ${posY}%, ${color}, transparent 60%)`,
                                        transform: 'scale(1.2)',
                                    }}
                                />
                            );
                        })}
                        <div className="absolute inset-0 backdrop-blur-[100px]" />
                    </div>
                ) : appState.coverUrl ? (
                    <>
                        <div 
                            key={`bg-layer-1-${appState.coverUrl}`}
                            className="absolute inset-[-50%] bg-cover bg-center transition-all duration-[2000ms] ease-in-out"
                            style={{ 
                                backgroundImage: `url(${appState.coverUrl})`,
                                filter: appState.themeMode === 'light'
                                    ? 'blur(90px) brightness(1.1) saturate(1.2) opacity(0.6)'
                                    : 'blur(80px) brightness(0.35) saturate(1.1)',
                            }}
                        />
                        <div 
                            key={`bg-layer-2-${appState.coverUrl}`}
                            className={`absolute inset-0 bg-cover bg-center mix-blend-screen transition-all duration-[2000ms] ${appState.themeMode === 'dark' ? 'opacity-20' : 'opacity-40'}`}
                            style={{ 
                                backgroundImage: `url(${appState.coverUrl})`,
                                filter: 'blur(150px)',
                            }}
                        />
                    </>
                ) : (
                    <div 
                        className="absolute inset-0 transition-all duration-1000"
                        style={{ 
                            background: appState.themeMode === 'dark' 
                                ? `radial-gradient(circle at 30% 30%, ${appState.themeColor}15 0%, #000000 70%)`
                                : `radial-gradient(circle at 30% 30%, ${appState.themeColor}10 0%, #f2f2f2 80%)`
                        }}
                    />
                )}
            </>
            )}
            
            <div className={`absolute inset-0 bg-gradient-to-b transition-colors duration-1000 ${isLightMode ? 'from-white/40 via-transparent to-white/0' : 'from-black/30 via-transparent to-black/90'}`}></div>
            <div className={`absolute inset-0 bg-radial-gradient transition-colors duration-1000 ${isLightMode ? 'from-transparent via-white/0 to-white/0' : 'from-transparent via-black/10 to-black/90'}`}></div>
            
            <div className={`absolute inset-0 pointer-events-none mix-blend-overlay ${isLightMode ? 'opacity-[0.03]' : 'opacity-[0.04]'}`} 
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>
        </div>
    );
};

export default BackgroundLayer;
