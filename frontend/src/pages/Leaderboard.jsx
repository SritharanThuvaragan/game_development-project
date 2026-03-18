import React, { useState, useEffect } from 'react';
import { useSound } from '../context/SoundContext';

const MEDALS  = ['🥇', '🥈', '🥉'];
const R_COLOR = ['var(--primary)', '#d1d1d1', '#cd7f32'];

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSound, sounds } = useSound();

  useEffect(() => {
    fetch('http://localhost:5000/api/scores/leaderboard')
      .then(r => r.json())
      .then(d => setPlayers(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-content scrollable" style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
      <div className="app-container">

        {/* Header */}
        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '4px' }}>
            ◆ BLAST Rankings ◆
          </div>
          <h1 className="title" style={{ fontSize: '2rem' }}>Agent Rankings</h1>
        </div>

        {/* Table */}
        <div className="game-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="loading-spinner" />
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              {/* Head */}
              <div style={{
                display: 'grid', gridTemplateColumns: '52px 1fr auto',
                padding: '10px 22px', borderBottom: '1px solid var(--glass-border)',
                fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px',
              }}>
                <span>Rank</span><span>Agent</span><span>XP</span>
              </div>

              {/* Rows */}
              {players.map((p, i) => (
                <div key={p._id} style={{
                  display: 'grid', gridTemplateColumns: '52px 1fr auto',
                  padding: '12px 22px', alignItems: 'center',
                  background: i === 0 ? 'rgba(247,185,36,0.05)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  animation: `fadeIn 0.35s ease ${i * 0.04}s both`,
                }}>
                  <div style={{ fontWeight: '900', color: i < 3 ? R_COLOR[i] : 'var(--text-muted)', fontSize: i < 3 ? '1.25rem' : '0.9rem' }}>
                    {i < 3 ? MEDALS[i] : `#${i + 1}`}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                      background: `linear-gradient(135deg,${i < 3 ? R_COLOR[i] : 'rgba(255,255,255,0.1)'},rgba(0,0,0,0.3))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '900', fontSize: '0.75rem', color: '#000',
                    }}>
                      {p.username?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{p.username}</span>
                  </div>
                  <div style={{ fontWeight: '900', fontSize: '1rem', color: i < 3 ? R_COLOR[i] : 'var(--primary)', textAlign: 'right' }}>
                    {p.totalScore.toLocaleString()} <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>XP</span>
                  </div>
                </div>
              ))}

              {players.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>🕵️</div>
                  No data blast yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
