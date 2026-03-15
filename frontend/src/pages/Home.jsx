import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/Game.css'; // Reusing base styles

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="game-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Welcome to Banana Math!</h2>
      <p style={{ marginBottom: '40px', fontSize: '1.1rem', textAlign: 'center' }}>
        Test your math skills! The faster you solve the puzzle, the more points you earn.
      </p>
      <button 
        onClick={() => navigate('/game')} 
        style={{
          padding: '20px 40px',
          fontSize: '1.5rem',
          backgroundColor: '#ffcc00',
          color: '#333',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Play Game
      </button>
    </div>
  );
};

export default Home;
