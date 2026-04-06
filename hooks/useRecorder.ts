
import { useState, useRef, useCallback } from 'react';
import { RecordingFormat } from '../types';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    // Note: We don't cleanupStream here immediately if we want to allow 
    // multiple takes, but for this player, cleaning up on stop is safer.
    cleanupStream();
  }, [cleanupStream]);

  const prepareStream = useCallback(async (
    fps: number,
    captureCursor: boolean
  ): Promise<boolean> => {
    try {
      cleanupStream(); // Ensure old streams are gone
      
      const constraints = {
        video: {
          frameRate: { ideal: fps },
          // Hint during initial request
          cursor: captureCursor ? 'always' : 'never'
        },
        audio: false, // We use internal clean audio from the app's destination
        // By removing preferCurrentTab and displaySurface: 'browser', 
        // the browser will show the full selection dialog (Tab, Window, Screen).
        selfBrowserSurface: 'include',
        monitorTypeSurfaces: 'include',
        surfaceSwitching: 'include'
      } as any;

      const displayStream = await navigator.mediaDevices.getDisplayMedia(constraints);

      // Force apply constraints to the track as Chrome sometimes ignores the initial hint
      const videoTrack = displayStream.getVideoTracks()[0];
      if (videoTrack) {
        try {
          await videoTrack.applyConstraints({
            // @ts-ignore
            cursor: captureCursor ? 'always' : 'never'
          });
        } catch (e) {
          console.warn("Browser rejected post-capture cursor constraint:", e);
        }
      }

      streamRef.current = displayStream;
      
      // Handle user stopping the share via browser UI
      displayStream.getVideoTracks()[0].onended = () => {
        if (isRecording) {
          stopRecording();
        } else {
          cleanupStream();
        }
      };

      return true;
    } catch (err) {
      console.error("Failed to capture stream:", err);
      return false;
    }
  }, [isRecording, stopRecording, cleanupStream]);

  const startRecording = useCallback(async (
    audioDestination: MediaStreamAudioDestinationNode | null,
    format: RecordingFormat,
    bitrate: number
  ) => {
    try {
      if (!streamRef.current) throw new Error("Stream not prepared");
      if (!audioDestination) throw new Error("Audio destination not ready");

      const combinedStream = new MediaStream([
        ...streamRef.current.getVideoTracks(),
        ...audioDestination.stream.getAudioTracks()
      ]);

      const mimeType = format === 'mp4' ? 'video/x-matroska;codecs=avc1' : 'video/webm;codecs=vp9';
      
      const recorder = new MediaRecorder(combinedStream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'video/webm',
        videoBitsPerSecond: bitrate * 1000000,
        audioBitsPerSecond: 320000 
      });

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `VibePlayer_Recording_${Date.now()}.${format === 'mp4' ? 'mp4' : 'webm'}`;
        a.click();
      };

      recorder.start();
      setIsRecording(true);
      return true;
    } catch (err) {
      console.error("Recording failed to start", err);
      return false;
    }
  }, []);

  return {
    isRecording,
    prepareStream,
    startRecording,
    stopRecording,
    cleanupStream
  };
};
