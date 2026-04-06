
import React from 'react';

interface RecordingIndicatorProps {
  isRecording: boolean;
  isArmed: boolean;
}

const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({ isRecording, isArmed }) => {
  if (!isRecording && !isArmed) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-2xl pointer-events-none animate-fade-in">
      <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/90">
        {isRecording ? 'Recording Live' : 'Recording Armed - Play to Start'}
      </span>
    </div>
  );
};

export default RecordingIndicator;
