import React, { useState, useEffect } from 'react';
import { useSound } from '../context/SoundContext';
import './Game.css';

const Profile = () => {
  const username = localStorage.getItem('banana_username');
  const { playSound, sounds } = useSound();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Settings state
  const [bio, setBio] = useState('');
  const [avatarColor, setAvatarColor] = useState('#f7b924');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const colors = ['#f7b924', '#00ff88', '#ff00ff', '#4776ff', '#ff4757', '#ffffff'];

  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/profile/${username}`);
      const json = await res.json();
      setData(json);
      setBio(json.bio);
      setAvatarColor(json.avatarColor);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) fetchProfile();
  }, [username]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`http://localhost:5000/api/profile/${username}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, avatarColor, currentPassword, newPassword })
      });
      const json = await res.json();
      if (res.ok) {
        setMessage('Profile updated successfully!');
        fetchProfile();
        setTimeout(() => setIsModalOpen(false), 1500);
      } else {
        setMessage(json.message || 'Update failed');
      }
    } catch (err) {
      setMessage('Server error');
    }
  };

  if (loading) return <div className="page-content"><div className="loading-spinner" /></div>;
  if (!data) return <div className="page-content">User not found</div>;

  return (
    <div className="page-content scrollable">
      <div className="app-container" style={{ maxWidth: '900px' }}>
        
        {/* Profile Header */}
        <div className="game-card" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '30px', width: '100%' }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${data.avatarColor}, #000)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', fontWeight: '900', color: '#000',
            boxShadow: `0 0 20px ${data.avatarColor}44`,
            border: `2px solid ${data.avatarColor}`
          }}>
            {data.username[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 className="title" style={{ fontSize: '2.2rem', marginBottom: '4px' }}>{data.username}</h1>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  Joined {new Date(data.joinedAt).toLocaleDateString()}
                </div>
              </div>
              <button 
                onClick={() => { setIsModalOpen(true); playSound(sounds.click); }}
                className="logout-btn" style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                <i className="fa-solid fa-gear" style={{ marginRight: '6px' }} />Settings
              </button>
            </div>
            <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: data.bio ? 'normal' : 'italic' }}>
              {data.bio || "No tactical biography provided yet."}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', width: '100%' }}>
          <StatCard title="Total XP" value={data.totalScore.toLocaleString()} icon="fa-crown" color="var(--primary)" />
          <StatCard title="Accuracy" value={`${data.stats.total > 0 ? Math.round((data.stats.wins / data.stats.total) * 100) : 0}%`} icon="fa-target-shot" color="var(--secondary)" />
          <StatCard title="Best XP" value={data.stats.bestXP} icon="fa-bolt" color="var(--accent)" />
          <StatCard title="Max Streak" value={data.stats.maxStreak} icon="fa-fire" color="#ff4757" />
        </div>

        {/* Mission Log */}
        <div className="game-card" style={{ padding: '0', width: '100%', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '8px' }} />Mission Log
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last 20 operations</span>
          </div>
          <div style={{ width: '100%' }}>
            {data.history.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No missions recorded yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                  <tr>
                    <th style={thStyle}>Result</th>
                    <th style={thStyle}>Difficulty</th>
                    <th style={thStyle}>Time</th>
                    <th style={thStyle}>Reward</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.history.map((h, i) => (
                    <tr key={h._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}>
                      <td style={tdStyle}>
                        <span style={{ 
                          color: h.result === 'correct' ? 'var(--secondary)' : 'var(--error)',
                          fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem',
                          display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                          <i className={`fa-solid ${h.result === 'correct' ? 'fa-circle-check' : 'fa-circle-xmark'}`} />
                          {h.result === 'correct' ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td style={tdStyle}><span style={{ opacity: 0.8, textTransform: 'capitalize' }}>{h.difficulty}</span></td>
                      <td style={tdStyle}>{h.timeTaken}s</td>
                      <td style={tdStyle}><span style={{ color: 'var(--primary)', fontWeight: '800' }}>+{h.points} XP</span></td>
                      <td style={tdStyle}><span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{new Date(h.createdAt).toLocaleDateString()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Support features placeholder */}
        <div style={{ width: '100%', display: 'flex', gap: '2rem', justifyContent: 'center', opacity: 0.5, marginTop: '10px' }}>
          <div style={{ textAlign: 'center' }}>
            <i className="fa-solid fa-shield-halved" style={{ fontSize: '1.2rem', color: 'var(--secondary)' }} />
            <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', marginTop: '4px' }}>Secure Storage</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <i className="fa-solid fa-network-wired" style={{ fontSize: '1.2rem', color: 'var(--primary)' }} />
            <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', marginTop: '4px' }}>Sync Active</div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="game-card auth-card" style={{ maxWidth: '450px', background: 'rgba(10,10,20,0.98)', position: 'relative' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-times" />
            </button>
            <h2 className="title" style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Profile Settings</h2>
            
            <form onSubmit={handleUpdate} className="auth-form">
              <div className="input-group">
                <label>Biography</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="auth-input"
                  placeholder="Enter your tactical biography..."
                  style={{ height: '80px', resize: 'none' }}
                />
              </div>

              <div className="input-group">
                <label>Avatar Color</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  {colors.map(c => (
                    <div 
                      key={c}
                      onClick={() => setAvatarColor(c)}
                      style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: c, cursor: 'pointer',
                        border: avatarColor === c ? '3px solid #fff' : 'none',
                        boxShadow: avatarColor === c ? `0 0 10px ${c}` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--glass-border)', margin: '10px 0' }} />

              <div className="input-group">
                <label>Change Password (Optional)</label>
                <input 
                  type="password" 
                  placeholder="Current Password" 
                  className="auth-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ marginBottom: '10px' }}
                />
                <input 
                  type="password" 
                  placeholder="New Password" 
                  className="auth-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              {message && (
                <div className={message.includes('success') ? 'auth-success' : 'auth-error'}>
                  {message}
                </div>
              )}

              <button type="submit" className="submit-btn" style={{ height: '50px', fontSize: '1rem', marginTop: '10px' }}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="game-card" style={{ padding: '20px', textAlign: 'center', borderBottom: `3px solid ${color}` }}>
    <i className={`fa-solid ${icon}`} style={{ color, fontSize: '1.5rem', marginBottom: '10px' }} />
    <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>{value}</div>
    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{title}</div>
  </div>
);

const thStyle = { padding: '12px 20px', textAlign: 'left', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' };
const tdStyle = { padding: '14px 20px', fontSize: '0.85rem' };

export default Profile;
