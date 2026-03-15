import React, { useState, useEffect } from 'react';
import './Game.css'; // Reuse some basic styles or create custom

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/scores/leaderboard');
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error("Error fetching leaderboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="app-container" style={{ paddingTop: '10px' }}>
      <div className="game-card" style={{ padding: '0px' }}>
        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto', padding: '20px' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '12px 0' }}>Rank</th>
                  <th style={{ padding: '12px 0' }}>Username</th>
                  <th style={{ padding: '12px 0', textAlign: 'right' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={player._id} style={{ borderBottom: '1px solid #eee', color: index < 3 ? '#ffcc00' : 'inherit' }}>
                    <td style={{ padding: '12px 0', fontWeight: 'bold' }}>#{index + 1}</td>
                    <td style={{ padding: '12px 0', fontWeight: 'bold' }}>{player.username}</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold' }}>{player.totalScore}</td>
                  </tr>
                ))}
                {players.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No scores yet!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
