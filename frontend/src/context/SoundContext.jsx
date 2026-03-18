import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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
    click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    correct: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    wrong: 'https://assets.mixkit.co/active_storage/sfx/2959/2959-preview.mp3',
    timer: 'https://assets.mixkit.co/active_storage/sfx/2501/2501-preview.mp3',
    start: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    levelUp: 'https://assets.mixkit.co/active_storage/sfx/1362/1362-preview.mp3',
    bgMusic: 'https://assets.mixkit.co/active_storage/sfx/2900/2900-preview.mp3',
    tick: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  };

  // Persist settings
  useEffect(() => { localStorage.setItem('gameMasterVolume', masterVolume); }, [masterVolume]);
  useEffect(() => { localStorage.setItem('gameSfxVolume', sfxVolume); }, [sfxVolume]);
  useEffect(() => { localStorage.setItem('gameMusicVolume', musicVolume); }, [musicVolume]);
  useEffect(() => { localStorage.setItem('gameMuted', isMuted); }, [isMuted]);
  useEffect(() => { localStorage.setItem('gameMusicEnabled', isMusicEnabled); }, [isMusicEnabled]);

  // Background music control
  useEffect(() => {
    if (isMusicEnabled && !isMuted && !isMusicTemporarilyDisabled) {
      if (!bgMusicRef.current) {
        bgMusicRef.current = new Audio(sounds.bgMusic);
        bgMusicRef.current.loop = true;
      }
      bgMusicRef.current.volume = musicVolume * masterVolume;
      bgMusicRef.current.play().catch(() => {});
    } else {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }
    }
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
