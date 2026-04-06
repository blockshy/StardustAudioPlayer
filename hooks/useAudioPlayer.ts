
import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioContextState } from '../types';

export const useAudioPlayer = (audioUrl: string | null) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const [state, setState] = useState<AudioContextState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    analyser: null,
  });

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const updateTime = () => setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    const updateDuration = () => setState(prev => ({ ...prev, duration: audio.duration }));
    const onEnded = () => setState(prev => ({ ...prev, isPlaying: false }));

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
      audioRef.current = null;
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!audioRef.current || audioContextRef.current) return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;

    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);

    audioContextRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;

    setState(prev => ({ ...prev, analyser }));

    return () => {
      ctx.close();
      audioContextRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (state.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, [state.isPlaying]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setState(prev => ({ ...prev, volume: vol }));
    }
  }, []);

  return {
    ...state,
    togglePlay,
    seek,
    setVolume,
  };
};
