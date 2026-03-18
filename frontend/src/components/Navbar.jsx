import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSound } from '../context/SoundContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [score, setScore] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);
  const {
    masterVolume, setMasterVolume,
    sfxVolume, setSfxVolume,
    musicVolume, setMusicVolume,
    isMuted, setIsMuted,
    isMusicEnabled, setIsMusicEnabled,
    playSound, sounds
  } = useSound();
  const username = localStorage.getItem('banana_username');

  useEffect(() => {
    const fetchUserScore = async () => {
      if (!username) return;
      try {
        const res = await fetch(`http://localhost:5000/api/scores/user/${username}`);
        if (res.ok) {
          const data = await res.json();
          setScore(data.totalScore);
        }
      } catch (error) {
        console.error("Failed to fetch score for navbar", error);
      }
    };
    fetchUserScore();
  }, [location.pathname, username]);

  // Close settings on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    playSound(sounds.click);
    localStorage.removeItem('banana_auth_token');
    localStorage.removeItem('banana_username');
    navigate('/login');
  };

  const VolumeRow = ({ label, value, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>{label}</span>
        <span style={{ color: '#fff', fontWeight: '700' }}>{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range" min="0" max="1" step="0.05" value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)', height: '4px' }}
      />
    </div>
  );

  const Toggle = ({ label, value, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          background: value ? 'var(--secondary)' : 'var(--error)',
          border: 'none', width: '42px', height: '22px', borderRadius: '11px',
          cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0
        }}
      >
        <div style={{
          width: '16px', height: '16px', background: '#fff', borderRadius: '50%',
          position: 'absolute', left: value ? '23px' : '3px', top: '3px', transition: 'left 0.3s'
        }} />
      </button>
    </div>
  );

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 36px', backgroundColor: 'rgba(10, 10, 12, 0.9)',
      backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--glass-border)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.6)'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <Link to="/" onClick={() => playSound(sounds.click)} style={{ textDecoration: 'none' }}>
          <span style={{ fontWeight: '900', fontSize: '1rem', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            <i className="fa-solid fa-banana" style={{ marginRight: '6px' }} />Blast
          </span>
        </Link>
        <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }} />
        <Link to="/" onClick={() => playSound(sounds.click)} style={linkStyle(location.pathname === '/')}>
          <i className="fa-solid fa-house" style={{ marginRight: '5px' }} />Home
        </Link>
        <Link to="/leaderboard" onClick={() => playSound(sounds.click)} style={linkStyle(location.pathname === '/leaderboard')}>
          <i className="fa-solid fa-trophy" style={{ marginRight: '5px' }} />Rankings
        </Link>
        <Link to="/help" onClick={() => playSound(sounds.click)} style={linkStyle(location.pathname === '/help')}>
          <i className="fa-solid fa-book-skull" style={{ marginRight: '5px' }} />Manual
        </Link>
        <Link to="/profile" onClick={() => playSound(sounds.click)} style={linkStyle(location.pathname === '/profile')}>
          <i className="fa-solid fa-user-secret" style={{ marginRight: '5px' }} />Profile
        </Link>
      </div>

      {/* Right Side */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', color: '#fff' }}>
        <div style={{
          fontWeight: '700', fontSize: '0.8rem', background: 'rgba(255,255,255,0.04)',
          padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)',
          letterSpacing: '1px'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>AGENT </span>
          <span style={{ color: 'var(--primary)' }}>{username}</span>
          <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>|</span>
          <span style={{ color: 'var(--secondary)' }}>{score.toLocaleString()} XP</span>
        </div>

        {/* Settings gear */}
        <div ref={settingsRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowSettings(s => !s); playSound(sounds.click); }}
            style={{
              background: showSettings ? 'rgba(247,185,36,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${showSettings ? 'var(--primary)' : 'var(--glass-border)'}`,
              color: '#fff', cursor: 'pointer', fontSize: '1rem',
              width: '36px', height: '36px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title="Audio Settings"
          >
            ⚙️
          </button>

          {showSettings && (
            <div style={{
              position: 'absolute', top: '46px', right: 0, width: '280px',
              background: 'rgba(14, 14, 18, 0.98)', backdropFilter: 'blur(30px)',
              padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)',
              boxShadow: '0 16px 60px rgba(0,0,0,0.9)', animation: 'popIn 0.25s ease',
              zIndex: 2001
            }}>
              {/* Panel Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '3px' }}>⚙ Settings</div>
                  <div style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '0.95rem', textTransform: 'uppercase' }}>Audio Control</div>
                </div>
                <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Toggles */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Toggle label="🔇 Mute All Audio" value={!isMuted} onChange={(v) => { setIsMuted(!v); }} />
                  <Toggle label="🎵 Background Music" value={isMusicEnabled} onChange={setIsMusicEnabled} />
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'var(--glass-border)' }} />

                {/* Volume Sliders */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <VolumeRow label="🔊 Master Volume" value={masterVolume} onChange={setMasterVolume} />
                  <VolumeRow label="💥 SFX Volume" value={sfxVolume} onChange={setSfxVolume} />
                  <VolumeRow label="🎵 Music Volume" value={musicVolume} onChange={setMusicVolume} />
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'var(--glass-border)' }} />

                {/* Sound Test */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { label: '✅ Correct', sound: sounds.correct },
                    { label: '❌ Wrong', sound: sounds.wrong },
                    { label: '⏱ Timer', sound: sounds.timer },
                  ].map(({ label, sound }) => (
                    <button
                      key={label}
                      onClick={() => playSound(sound)}
                      style={{
                        flex: 1, padding: '7px 4px', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--glass-border)', borderRadius: '8px',
                        color: '#fff', fontSize: '0.65rem', cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Click buttons above to preview sounds
                </div>
              </div>
            </div>
          )}
        </div>

        <button onClick={handleLogout} className="logout-btn" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const linkStyle = (isActive) => ({
  color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.7)',
  textDecoration: 'none',
  fontWeight: '700',
  fontSize: '0.85rem',
  transition: 'all 0.2s',
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  textShadow: isActive ? '0 0 12px rgba(247, 185, 36, 0.5)' : 'none'
});

export default Navbar;
