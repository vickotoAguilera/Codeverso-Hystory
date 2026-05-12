
"use client";

import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { R2_URL_BASE, AUDIO_MAPPING, AudioTrackKey } from '@/config/assets';

interface AudioContextType {
  playBGM: (track: AudioTrackKey) => void;
  playSFX: (track: AudioTrackKey) => void;
  stopBGM: () => void;
  currentTrack: AudioTrackKey | null;
  volume: number;
  setVolume: (v: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrackKey | null>(null);
  const [volume, setVolume] = useState(0.5);
  
  const audio1Ref = useRef<HTMLAudioElement | null>(null);
  const audio2Ref = useRef<HTMLAudioElement | null>(null);
  const activeAudioRef = useRef<1 | 2>(1);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audio1Ref.current = new Audio();
    audio2Ref.current = new Audio();
    audio1Ref.current.crossOrigin = "anonymous";
    audio2Ref.current.crossOrigin = "anonymous";
    audio1Ref.current.loop = true;
    audio2Ref.current.loop = true;

    // Preload SFX esenciales
    const diceRoll = new Audio(`${R2_URL_BASE}/${AUDIO_MAPPING.dice_roll}`);
    diceRoll.preload = "auto";
    diceRoll.crossOrigin = "anonymous";

    return () => {
      audio1Ref.current?.pause();
      audio2Ref.current?.pause();
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, []);

  const playBGM = (trackKey: AudioTrackKey) => {
    if (currentTrack === trackKey) return;

    const url = `${R2_URL_BASE}/${AUDIO_MAPPING[trackKey]}`;
    const nextAudio = activeAudioRef.current === 1 ? audio2Ref.current : audio1Ref.current;
    const currentAudio = activeAudioRef.current === 1 ? audio1Ref.current : audio2Ref.current;

    if (!nextAudio || !currentAudio) return;

    // Detener cualquier fade previo
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    nextAudio.src = url;
    nextAudio.volume = 0;
    nextAudio.play().catch(e => console.error("Error playing BGM:", e));

    // Crossfade Logic (1.5s)
    const step = 0.05;
    const interval = 75; // 1.5s / (1 / 0.05)

    fadeIntervalRef.current = setInterval(() => {
      let currentVol = currentAudio.volume;
      let nextVol = nextAudio.volume;

      if (currentVol > 0) currentAudio.volume = Math.max(0, currentVol - step);
      if (nextVol < volume) nextAudio.volume = Math.min(volume, nextVol + step);

      if (currentAudio.volume === 0 && nextAudio.volume === volume) {
        currentAudio.pause();
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      }
    }, interval);

    activeAudioRef.current = activeAudioRef.current === 1 ? 2 : 1;
    setCurrentTrack(trackKey);
  };

  const playSFX = (trackKey: AudioTrackKey) => {
    const sfx = new Audio(`${R2_URL_BASE}/${AUDIO_MAPPING[trackKey]}`);
    sfx.crossOrigin = "anonymous";
    sfx.volume = volume;
    sfx.play().catch(e => console.error("Error playing SFX:", e));
  };

  const stopBGM = () => {
    const currentAudio = activeAudioRef.current === 1 ? audio1Ref.current : audio2Ref.current;
    if (currentAudio) {
      currentAudio.pause();
      setCurrentTrack(null);
    }
  };

  return (
    <AudioContext.Provider value={{ playBGM, playSFX, stopBGM, currentTrack, volume, setVolume }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within an AudioProvider");
  return context;
};
