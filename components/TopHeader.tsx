
import React from 'react';
import { MdLightMode, MdDarkMode, MdAutoAwesome, MdSettings } from 'react-icons/md';
import { AppState } from '../types';

interface TopHeaderProps {
    appState: AppState;
    toggleTheme: () => void;
    setIsConfigOpen: (isOpen: boolean) => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ appState, toggleTheme, setIsConfigOpen }) => {
    const isDarkBase = appState.themeMode !== 'light';
    const textColor = isDarkBase ? 'text-white' : 'text-gray-900';

    return (
        <div className="flex justify-between items-start p-4 landscape:p-6 lg:p-10 shrink-0 z-20">
            <div className="flex flex-col gap-1 opacity-70 hover:opacity-100 transition-opacity cursor-default group">
                <h1 className={`font-display text-xl md:text-2xl tracking-[0.2em] border-b pb-1 transition-colors w-full text-justify [text-align-last:justify] ${textColor} ${isDarkBase ? 'border-white/10 group-hover:border-white/30' : 'border-black/10 group-hover:border-black/30'}`}>
                    {appState.metadata.playerTitle || "Stardust"}
                </h1>
                <span className={`text-[9px] md:text-[10px] font-sans tracking-[0.4em] w-full text-justify [text-align-last:justify] opacity-60 ${textColor}`}>
                    {appState.metadata.playerSubtitle || "Audio Player"}
                </span>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={toggleTheme} 
                    className={`group p-3 rounded-full transition-all duration-300 border-none active:scale-95 backdrop-blur-md border ${isDarkBase ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}`}
                >
                    {appState.themeMode === 'light' ? (
                        <MdLightMode className="text-black/60 group-hover:text-orange-500 transition-colors" size={20} />
                    ) : appState.themeMode === 'colorful' ? (
                        <MdAutoAwesome className="text-white/60 group-hover:text-pink-400 transition-colors" size={20} />
                    ) : (
                        <MdDarkMode className="text-white/60 group-hover:text-purple-300 transition-colors" size={20} />
                    )}
                </button>

                <button 
                    onClick={() => setIsConfigOpen(true)} 
                    className={`group p-3 rounded-full transition-all duration-300 border-none active:scale-95 backdrop-blur-md border ${isDarkBase ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}`}
                >
                    <MdSettings className={`${isDarkBase ? 'text-white/60 group-hover:text-white' : 'text-black/60 group-hover:text-black'} group-hover:rotate-90 transition-all duration-700 ease-out`} size={20} />
                </button>
            </div>
        </div>
    );
};

export default TopHeader;
