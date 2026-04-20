import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioContextState } from '../types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const useAudioPlayer = (audioUrl: string | null) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeRef = useRef(1);
  const lastNonZeroVolumeRef = useRef(1);

  const [state, setState] = useState<AudioContextState>({
    isPlaying: false,
    isReady: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    error: null,
    analyser: null,
  });

  const ensureAudioGraph = useCallback(async () => {
    if (audioContextRef.current) return audioContextRef.current;
    if (!audioRef.current) return null;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;

    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;

    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);

    audioContextRef.current = ctx;
    sourceRef.current = source;
    analyserRef.current = analyser;

    setState(prev => ({ ...prev, analyser }));
    return ctx;
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'metadata';
    audio.setAttribute('playsinline', 'true');
    audio.volume = volumeRef.current;
    audioRef.current = audio;

    const updateDuration = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setState(prev => ({ ...prev, duration, isReady: duration > 0 || audio.readyState >= 1 }));
    };

    const updateTime = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const updateVolume = () => {
      const nextVolume = clamp(audio.volume, 0, 1);
      volumeRef.current = nextVolume;
      if (nextVolume > 0.001) lastNonZeroVolumeRef.current = nextVolume;
      setState(prev => ({
        ...prev,
        volume: nextVolume,
        muted: nextVolume <= 0.001 || audio.muted,
      }));
    };

    const onPlay = () => {
      setState(prev => ({ ...prev, isPlaying: true, isBuffering: false, error: null }));
    };

    const onPause = () => {
      setState(prev => ({ ...prev, isPlaying: false, isBuffering: false }));
    };

    const onEnded = () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isBuffering: false,
        currentTime: Number.isFinite(audio.duration) ? audio.duration : prev.currentTime,
      }));
    };

    const onCanPlay = () => {
      setState(prev => ({ ...prev, isReady: true, isBuffering: false, error: null }));
    };

    const onWaiting = () => {
      if (!audio.paused) {
        setState(prev => ({ ...prev, isBuffering: true }));
      }
    };

    const onSeeking = () => {
      if (!audio.paused) {
        setState(prev => ({ ...prev, isBuffering: true }));
      }
    };

    const onSeeked = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime, isBuffering: false }));
    };

    const onError = () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isBuffering: false,
        isReady: false,
        error: 'audio_error',
      }));
    };

    const onEmptied = () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isReady: false,
        isBuffering: false,
        currentTime: 0,
        duration: 0,
      }));
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('playing', onCanPlay);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('seeking', onSeeking);
    audio.addEventListener('seeked', onSeeked);
    audio.addEventListener('volumechange', updateVolume);
    audio.addEventListener('error', onError);
    audio.addEventListener('emptied', onEmptied);

    updateVolume();

    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('playing', onCanPlay);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('seeking', onSeeking);
      audio.removeEventListener('seeked', onSeeked);
      audio.removeEventListener('volumechange', updateVolume);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('emptied', onEmptied);
      audioRef.current = null;

      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
      sourceRef.current = null;
      analyserRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audioUrl) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isReady: false,
        isBuffering: false,
        currentTime: 0,
        duration: 0,
        error: null,
      }));
      return;
    }

    audio.pause();
    audio.src = audioUrl;
    audio.currentTime = 0;
    audio.volume = volumeRef.current;
    audio.load();

    setState(prev => ({
      ...prev,
      isPlaying: false,
      isReady: false,
      isBuffering: false,
      currentTime: 0,
      duration: 0,
      error: null,
    }));
  }, [audioUrl]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audio.currentSrc) return;

    try {
      const context = await ensureAudioGraph();
      if (context?.state === 'suspended') {
        await context.resume();
      }

      if (audio.paused || audio.ended) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isBuffering: false,
        error: error instanceof Error ? error.message : 'audio_error',
      }));
    }
  }, [ensureAudioGraph]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const safeTime = clamp(time, 0, duration || 0);
    audio.currentTime = safeTime;
    setState(prev => ({ ...prev, currentTime: safeTime }));
  }, []);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = clamp(vol, 0, 1);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.volume > 0.001) {
      lastNonZeroVolumeRef.current = audio.volume;
      audio.volume = 0;
      return;
    }

    audio.volume = clamp(lastNonZeroVolumeRef.current || 1, 0.05, 1);
  }, []);

  return {
    ...state,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
  };
};
