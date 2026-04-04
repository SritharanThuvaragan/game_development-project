import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

import clickSound from '../assets/sounds/click.mp3';
import wrongSound from '../assets/sounds/wrong.mp3';
import timerSound from '../assets/sounds/timer.mp3';
import levelUpSound from '../assets/sounds/levelUp.mp3';
import bgMusicSound from '../assets/sounds/bgMusic.mp3';
import tickSound from '../assets/sounds/tick.mp3';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [masterVolume, setMasterVolume] = useState(parseFloat(localStorage.getItem('gameMasterVolume') ?? '0.7'));
  const [sfxVolume, setSfxVolume] = useState(parseFloat(localStorage.getItem('gameSfxVolume') ?? '0.8'));
  const [musicVolume, setMusicVolume] = useState(parseFloat(localStorage.getItem('gameMusicVolume') ?? '0.3'));
  const [isMuted, setIsMuted] = useState(localStorage.getItem('gameMuted') === 'true');
  const [isMusicEnabled, setIsMusicEnabled] = useState(localStorage.getItem('gameMusicEnabled') !== 'false');
  const [isMusicTemporarilyDisabled, setIsMusicTemporarilyDisabled] = useState(false);
  const bgMusicRef = useRef(null);

  const sounds = {
    click: clickSound,
    correct: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    wrong: wrongSound,
    timer: timerSound,
    start: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    levelUp: levelUpSound,
    bgMusic: bgMusicSound,
    tick: tickSound,
  };

  // Persist settings
  useEffect(() => { localStorage.setItem('gameMasterVolume', masterVolume); }, [masterVolume]);
  useEffect(() => { localStorage.setItem('gameSfxVolume', sfxVolume); }, [sfxVolume]);
  useEffect(() => { localStorage.setItem('gameMusicVolume', musicVolume); }, [musicVolume]);
  useEffect(() => { localStorage.setItem('gameMuted', isMuted); }, [isMuted]);
  useEffect(() => { localStorage.setItem('gameMusicEnabled', isMusicEnabled); }, [isMusicEnabled]);

  // Background music control
  useEffect(() => {
    let interactionProcessed = false;

    const playAudio = () => {
      if (isMusicEnabled && !isMuted && !isMusicTemporarilyDisabled) {
        if (!bgMusicRef.current) {
          bgMusicRef.current = new Audio(sounds.bgMusic);
          bgMusicRef.current.loop = true;
        }
        bgMusicRef.current.volume = musicVolume * masterVolume;
        bgMusicRef.current.play().catch(() => {
          // Autoplay might be blocked by browser
        });
      } else {
        if (bgMusicRef.current) {
          bgMusicRef.current.pause();
        }
      }
    };

    playAudio();

    // Event listener to resume audio upon first user interaction if blocked
    const handleInteraction = () => {
      if (!interactionProcessed && isMusicEnabled && !isMuted && !isMusicTemporarilyDisabled && bgMusicRef.current && bgMusicRef.current.paused) {
        bgMusicRef.current.play().catch(() => {});
        interactionProcessed = true;
      }
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [isMusicEnabled, isMuted, musicVolume, masterVolume, isMusicTemporarilyDisabled]);

  // Update bg music volume live
  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = musicVolume * masterVolume;
    }
  }, [musicVolume, masterVolume]);

  const playSound = (soundUrl) => {
    if (isMuted) return;
    const audio = new Audio(soundUrl);
    audio.volume = sfxVolume * masterVolume;
    audio.play().catch(() => {});
  };

  return (
    <SoundContext.Provider value={{
      masterVolume, setMasterVolume,
      sfxVolume, setSfxVolume,
      musicVolume, setMusicVolume,
      isMuted, setIsMuted,
      isMusicEnabled, setIsMusicEnabled,
      isMusicTemporarilyDisabled, setIsMusicTemporarilyDisabled,
      playSound, sounds
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
