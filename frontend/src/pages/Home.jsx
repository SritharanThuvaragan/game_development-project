import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/Game.css'; // Reusing base styles

const Home = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('medium');

  const difficulties = [
    { id: 'easy', label: 'Easy', color: '#4caf50' },
    { id: 'medium', label: 'Medium', color: '#ffcc00' },
    { id: 'hard', label: 'Hard', color: '#f44336' }
  ];

  return (
    <div className="game-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '40px' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#ffcc00', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Banana Math!</h2>
      <p style={{ marginBottom: '30px', fontSize: '1.2rem', textAlign: 'center', color: '#fff' }}>
        Test your math skills! Choose your difficulty and solve puzzles to earn points.
      </p>

      <div className="difficulty-container">
        <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#eee' }}>Select Difficulty:</h3>
        <div className="difficulty-options">
          {difficulties.map((diff) => (
            <button
              key={diff.id}
              onClick={() => setDifficulty(diff.id)}
              className={`difficulty-btn ${diff.id} ${difficulty === diff.id ? 'active' : ''}`}
            >
              {diff.label}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={() => navigate('/game', { state: { difficulty } })} 
        style={{
          padding: '20px 60px',
          fontSize: '1.5rem',
          backgroundColor: '#ffcc00',
          color: '#333',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
        }}
      >
        Play Game
      </button>
    </div>
  );
};

export default Home;
