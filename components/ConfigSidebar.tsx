
import React from 'react';
import { MdCloudUpload, MdColorLens, MdAlbum, MdGraphicEq, MdSpaceDashboard, MdEdit, MdTextFields, MdLibraryMusic, MdVideocam } from 'react-icons/md';
import { getThemeClasses } from '../utils/themeStyles';
import { AppState } from '../types';

interface ConfigSidebarProps {
    activeSection: string;
    scrollToSection: (id: string) => void;
    appState: AppState;
    translations: any;
}

const ConfigSidebar: React.FC<ConfigSidebarProps> = ({ activeSection, scrollToSection, appState, translations: t }) => {
    const themeClasses = getThemeClasses(appState);

    const sections = [
        { id: 'presets', label: t.presets, icon: MdCloudUpload },
        { id: 'appearance', label: t.appearance, icon: MdColorLens },
        { id: 'cover', label: t.albumArtStyle, icon: MdAlbum },
        { id: 'visuals', label: t.visualEffects, icon: MdGraphicEq },
        { id: 'layout', label: t.lyricsLayout, icon: MdSpaceDashboard },
        { id: 'details', label: t.trackDetails, icon: MdEdit },
        { id: 'typography', label: t.typography, icon: MdTextFields },
        { id: 'assets', label: t.assets, icon: MdLibraryMusic },
        { id: 'recording', label: t.recording, icon: MdVideocam },
    ];

    return (
        <div className={`flex-none w-[60px] md:w-[160px] border-r ${themeClasses.border} flex flex-col overflow-y-auto hide-scrollbar py-4 gap-1`}>
            {sections.map(section => (
                <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`
                        group relative flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-300
                        ${activeSection === section.id ? themeClasses.navActive : themeClasses.navInactive}
                        border
                    `}
                    title={section.label}
                >
                    <section.icon className={`text-lg flex-shrink-0 transition-transform duration-300 ${activeSection === section.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className={`hidden md:block text-xs font-medium truncate tracking-wide`}>{section.label}</span>
                </button>
            ))}
        </div>
    );
};

export default ConfigSidebar;
