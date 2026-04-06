
import React from 'react';
import { MdGraphicEq } from 'react-icons/md';
import { AppState, ParticleType, ParticleDirection } from '../../types';
import { getThemeClasses } from '../../utils/themeStyles';
import WaveControls from './WaveControls';
import ParticleControls from './ParticleControls';

interface ConfigVisualsProps {
    appState: AppState;
    onSensitivityChange: (target: 'vinyl' | 'bar' | 'particle', value: number) => void;
    onWaveBarConfigChange?: (key: 'scale' | 'x' | 'y' | 'blur' | 'opacity' | 'height', value: number) => void;
    onVisualizerChange: (key: 'enableWaves' | 'enableParticles' | 'enableParticleBeatSync', value: boolean) => void;
    onParticleSizeChange: (size: number) => void;
    onParticleBaseSpeedChange: (speed: number) => void;
    onParticleTypeChange: (type: ParticleType) => void;
    onParticleDirectionChange: (direction: ParticleDirection) => void;
    onParticleColorChange: (color: string, useTheme: boolean) => void;
    onParticlePalettesChange: (palettes: string[][], useTheme: boolean) => void;
    translations: any;
}

const ConfigVisuals: React.FC<ConfigVisualsProps> = (props) => {
    const { appState, translations: t } = props;
    const themeClasses = getThemeClasses(appState);

    return (
        <div id="section-visuals" className="space-y-4 scroll-mt-4">
            <h3 className={`text-xs font-sans font-bold ${themeClasses.textMuted} uppercase tracking-widest flex items-center gap-2`}>
                <MdGraphicEq className="text-lg" /> {t.visualEffects}
            </h3>
            <div className={`${themeClasses.itemBg} rounded-xl p-4 space-y-4 border ${themeClasses.border}`}>
                <WaveControls 
                    appState={appState} 
                    onSensitivityChange={props.onSensitivityChange} 
                    onWaveBarConfigChange={props.onWaveBarConfigChange} 
                    onVisualizerChange={props.onVisualizerChange} 
                    translations={t} 
                />

                <hr className={themeClasses.border} />
                
                <ParticleControls 
                    appState={appState}
                    onSensitivityChange={props.onSensitivityChange}
                    onVisualizerChange={props.onVisualizerChange}
                    onParticleSizeChange={props.onParticleSizeChange}
                    onParticleBaseSpeedChange={props.onParticleBaseSpeedChange}
                    onParticleTypeChange={props.onParticleTypeChange}
                    onParticleDirectionChange={props.onParticleDirectionChange}
                    onParticleColorChange={props.onParticleColorChange}
                    onParticlePalettesChange={props.onParticlePalettesChange}
                    translations={t}
                />
            </div>
        </div>
    );
};

export default ConfigVisuals;
