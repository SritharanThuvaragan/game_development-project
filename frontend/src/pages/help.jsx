import React from 'react';
import { useSound } from '../context/SoundContext';

const Phase = ({ n, title, color, children }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: '12px',
    border: `1px solid ${color}22`, position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: color }} />
    <div style={{ paddingLeft: '10px' }}>
      <div style={{ fontSize: '0.6rem', color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '2px' }}>Phase {n}</div>
      <h3 style={{ color, fontSize: '0.9rem', marginBottom: '4px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: '1.5' }}>{children}</p>
    </div>
  </div>
);

const Tip = ({ icon, title, children }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '12px',
    border: '1px solid var(--glass-border)', display: 'flex', gap: '10px',
  }}>
    <div style={{ fontSize: '1.1rem', flexShrink: 0 }}>{icon}</div>
    <div>
      <h4 style={{ color: '#fff', fontSize: '0.82rem', marginBottom: '3px' }}>{title}</h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: '1.5' }}>{children}</p>
    </div>
  </div>
);

const Help = () => {
  return (
    <div className="page-content scrollable" style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
      <div className="app-container">

        {/* Header */}
        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '4px' }}>
            ◆ Classified Document ◆
          </div>
          <h1 className="title" style={{ fontSize: '2rem' }}>Operational Manual</h1>
        </div>

        {/* Phases */}
        <section>
          <h2 style={{ color: 'var(--primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-clipboard-list" /> Mission Scenario
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Phase n="1" title="Infiltration" color="var(--secondary)">
              You are an elite analyst tasked with decrypting secure fruit-based transmissions. Get in undetected.
            </Phase>
            <Phase n="2" title="Decryption" color="var(--primary)">
              Each visual shows a mathematical puzzle. Identify the hidden value of each fruit by solving the equations.
            </Phase>
            <Phase n="3" title="Extraction" color="var(--error)">
              Enter the final decrypted value (0–9) before the countdown expires. Speed earns maximum XP.
            </Phase>
          </div>
        </section>

        {/* XP Table */}
        <section>
          <h2 style={{ color: 'var(--accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-bolt" /> XP Breakdown
          </h2>
          <div className="game-card" style={{ padding: '14px 18px' }}>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left', color: '#fff', fontWeight: '800' }}>Speed</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', color: '#fff', fontWeight: '800' }}>Window</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--primary)', fontWeight: '800' }}>XP</th>
                </tr>
              </thead>
              <tbody>
                {[['⚡ Lightning','< 10s','100'],['🚀 Rapid','11–20s','80'],['📡 Standard','21–30s','70'],['🐢 Delayed','> 30s','60']].map(([sp,wn,xp]) => (
                  <tr key={sp} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{sp}</td>
                    <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{wn}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: 'var(--primary)', fontWeight: '900' }}>{xp} XP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tips */}
        <section>
          <h2 style={{ color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-user-secret" /> Agent Tactics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Tip icon="⚡" title="Speed is Key">Timer stops the moment you submit correctly. Every second matters.</Tip>
            <Tip icon="🔍" title="Spot Patterns">Line 1 gives a base value. Map each fruit value systematically.</Tip>
            <Tip icon="🎯" title="Difficulty Bonus">Hard = tighter time limit for same XP. Challenge yourself.</Tip>
            <Tip icon="🔊" title="Audio Alerts">The timer beeps 5s before expiry. Enable audio in ⚙️ Settings.</Tip>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Help;
