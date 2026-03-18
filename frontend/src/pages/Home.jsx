import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '../context/SoundContext';

const Home = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('medium');
  const { playSound, sounds } = useSound();

  const difficulties = [
    { id: 'easy', label: 'EASY', icon: 'fa-shield-halved', color: 'var(--secondary)', desc: 'Novice' },
    { id: 'medium', label: 'MEDIUM', icon: 'fa-crosshairs', color: 'var(--primary)', desc: 'Agent' },
    { id: 'hard', label: 'HARD', icon: 'fa-skull-crossbones', color: 'var(--error)', desc: 'Elite' },
  ];

  const start = () => { playSound(sounds.start); navigate('/game', { state: { difficulty } }); };

  return (
    <div className="page-content">
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '18px', width: '100%', maxWidth: '480px',
        animation: 'fadeIn 0.45s ease',
      }}>

        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '4px' }}>
            ◆ Banana Blast HQ ◆
          </div>
          <h1 style={{
            fontSize: '2.4rem', fontWeight: '900', lineHeight: 1.1,
            background: 'linear-gradient(135deg, var(--primary), #fff 50%, var(--secondary))',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundSize: '200% auto', animation: 'shine 3s linear infinite',
          }}>
            BANANA BLAST
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '5px', lineHeight: '1.5' }}>
            Elite decryption system online. Select clearance level.
          </p>
        </div>

        {/* Difficulty */}
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {difficulties.map(d => (
            <button
              key={d.id}
              onClick={() => { setDifficulty(d.id); playSound(sounds.click); }}
              className={`difficulty-btn ${d.id} ${difficulty === d.id ? 'active' : ''}`}
              style={{ padding: '12px 6px' }}
            >
              <i className={`fa-solid ${d.icon}`} style={{ fontSize: '1.1rem' }} />
              <span style={{ fontWeight: '900', fontSize: '0.75rem', letterSpacing: '1px' }}>{d.label}</span>
              <span style={{ fontSize: '0.58rem', opacity: 0.7, textTransform: 'uppercase' }}>{d.desc}</span>
            </button>
          ))}
        </div>

        {/* Start */}
        <button
          onClick={start}
          className="submit-btn"
          style={{ width: '100%', height: '54px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <i className="fa-solid fa-rocket" />
          INITIATE MISSION
        </button>

        {/* Footer icons */}
        <div style={{ display: 'flex', gap: '2rem', opacity: 0.5 }}>
          {[
            { icon: 'fa-chess-knight', label: 'Infiltration', color: 'var(--primary)' },
            { icon: 'fa-microchip', label: 'Decryption', color: 'var(--secondary)' },
            { icon: 'fa-star', label: 'XP Rewards', color: 'var(--accent)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ color: s.color }}><i className={`fa-solid ${s.icon}`} /></div>
              <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
