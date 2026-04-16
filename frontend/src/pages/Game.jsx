import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSound } from '../context/SoundContext';
import './Game.css';

const DIFFICULTY_CONFIG = {
  easy:   { time: 60, baseXP: 50,  color: 'var(--secondary)', icon: 'fa-shield-halved', label: 'EASY'   },
  medium: { time: 45, baseXP: 75,  color: 'var(--primary)',   icon: 'fa-crosshairs',    label: 'MEDIUM' },
  hard:   { time: 30, baseXP: 100, color: 'var(--error)',     icon: 'fa-skull-crossbones', label: 'HARD' },
};

const calcPoints = (difficulty, seconds) => {
  const breakpoints = {
    easy:   [[15, 100], [25, 80], [35, 70], [45, 60]],
    medium: [[10, 100], [20, 80], [30, 70], [40, 60]],
    hard:   [[7,  100], [15, 80], [25, 70], [35, 60]],
  };
  const tiers = breakpoints[difficulty] || breakpoints.medium;
  for (const [limit, pts] of tiers) {
    if (seconds <= limit) return pts;
  }
  return 50;
};

const Game = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const difficulty = location.state?.difficulty || 'medium';
  const config     = DIFFICULTY_CONFIG[difficulty];
  const { playSound, sounds, setIsMusicTemporarilyDisabled } = useSound();

  const [questionUrl,  setQuestionUrl]  = useState('');
  const [solution,     setSolution]     = useState(null);
  const [totalScore,   setTotalScore]   = useState(0);
  const [feedback,     setFeedback]     = useState(null);   // 'correct' | 'wrong' | null
  const [loading,      setLoading]      = useState(true);
  const [inputValue,   setInputValue]   = useState('');
  const [seconds,      setSeconds]      = useState(0);
  const [isActive,     setIsActive]     = useState(false);
  const [isTimeOver,   setIsTimeOver]   = useState(false);
  const [pointsEarned, setPointsEarned] = useState(null);
  const [questionNum,  setQuestionNum]  = useState(1);
  const [streak,       setStreak]       = useState(0);
  const [history,      setHistory]      = useState([]);    // [{pts, time, result}]
  const [showQuitModal, setShowQuitModal] = useState(false);

  const inputRef = useRef(null);
  const timeLimit = config.time;
  const timeLeft  = timeLimit - seconds;
  const timerPct  = (timeLeft / timeLimit) * 100;
  const timerColor = timerPct > 50 ? 'var(--secondary)' : timerPct > 25 ? 'var(--primary)' : 'var(--error)';
  const isWarning  = timerPct <= 25 && isActive;

  /* ─── Music Control ─── */
  useEffect(() => {
    setIsMusicTemporarilyDisabled(true);
    return () => setIsMusicTemporarilyDisabled(false);
  }, [setIsMusicTemporarilyDisabled]);

  /* ─── Timer ─── */
  useEffect(() => {
    let id = null;
    if (isActive && !showQuitModal) {
      id = setInterval(() => {
        setSeconds(s => {
          if (s + 1 >= timeLimit) {
            setIsActive(false);
            setIsTimeOver(true);
            setStreak(0);
            playSound(sounds.wrong);
            setHistory(h => [...h, { pts: 0, time: timeLimit, result: 'fail' }]);
            
            // Log timeout to mission history
            const username = localStorage.getItem('banana_username');
            if (username) {
              fetch('http://localhost:5000/api/profile/history/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username,
                  result: 'fail',
                  points: 0,
                  timeTaken: timeLimit,
                  difficulty: localStorage.getItem('last_difficulty') || 'medium' 
                })
              }).catch(err => console.error('History log error:', err));
            }
            return timeLimit;
          }
          // Play tick sound every second
          playSound(sounds.tick);
          if (s === timeLimit - 6) playSound(sounds.timer);
          return s + 1;
        });
      }, 1000);
    }
    return () => clearInterval(id);
  }, [isActive, timeLimit, playSound, sounds, showQuitModal]);

  /* ─── Fetch question ─── */
  const fetchQuestion = async () => {
    setLoading(true);
    setFeedback(null);
    setInputValue('');
    setPointsEarned(null);
    setSeconds(0);
    setIsActive(false);
    setIsTimeOver(false);
    try {
      const res  = await fetch('https://marcconrad.com/uob/banana/api.php');
      const data = await res.json();
      setQuestionUrl(data.question);
      setSolution(data.solution);
      setIsActive(true);
      playSound(sounds.click);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => { fetchQuestion(); }, []);

  /* ─── Submit ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue) return;
    const numVal = parseInt(inputValue, 10);

    if (numVal === solution) {
      setIsActive(false);
      setFeedback('correct');
      playSound(sounds.correct);
      const pts = calcPoints(difficulty, seconds);
      setPointsEarned(pts);
      setStreak(s => s + 1);
      setHistory(h => [...h, { pts, time: seconds, result: 'correct' }]);

      // persist score
      const username = localStorage.getItem('banana_username');
      if (username) {
        try {
          // Update total score
          await fetch('http://localhost:5000/api/scores/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, pointsToAdd: pts }),
          });

          // Log to mission history
          await fetch('http://localhost:5000/api/profile/history/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username,
              result: 'correct',
              points: pts,
              timeTaken: seconds,
              difficulty
            })
          });
          
          setTotalScore(s => s + pts);
        } catch (err) {
          console.error('History/Score sync error:', err);
          setTotalScore(s => s + pts);
        }
      } else {
        setTotalScore(s => s + pts);
      }
    } else {
      setFeedback('wrong');
      playSound(sounds.wrong);
      setStreak(0);
      setInputValue('');
      setTimeout(() => setFeedback(null), 1200);

      // Log failure to mission history
      const username = localStorage.getItem('banana_username');
      if (username) {
        fetch('http://localhost:5000/api/profile/history/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            result: 'fail',
            points: 0,
            timeTaken: seconds,
            difficulty
          })
        }).catch(err => console.error('History log error:', err));
      }
    }
  };

  const handleNext = () => {
    setQuestionNum(n => n + 1);
    fetchQuestion();
  };

  const handleQuit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowQuitModal(true);
  };

  /* ─── Render ─── */
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 380px',
      height: 'calc(100vh - var(--nav-h, 64px))',
      overflow: 'hidden',
    }}>
      {/* ══════════════════════════════════════════
          LEFT PANEL — Puzzle Image + Timer
      ══════════════════════════════════════════ */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        background: 'rgba(0,0,0,0.4)', position: 'relative',
        borderRight: '1px solid var(--glass-border)',
      }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 28px', borderBottom: '1px solid var(--glass-border)',
          background: 'rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fa-solid fa-terminal" style={{ color: 'var(--secondary)', fontSize: '1rem' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>
              BANANA BLAST
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className={`fa-solid ${config.icon}`} style={{ color: config.color, fontSize: '0.9rem' }} />
            <span style={{ fontSize: '0.75rem', color: config.color, fontWeight: '800', textTransform: 'uppercase' }}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Timer Bar (Relocated to top) */}
        <div style={{ padding: '12px 28px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className={`fa-solid fa-clock ${isWarning ? 'fa-bounce' : ''}`}
                 style={{ color: timerColor, fontSize: '0.8rem' }} />
              <span style={{ color: timerColor, fontWeight: '900', fontSize: '1rem' }}>
                {timeLeft}s
              </span>
            </div>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Time Remaining
            </span>
          </div>
          <div style={{
            height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '3px',
              width: `${timerPct}%`,
              background: `linear-gradient(90deg, ${timerColor}, ${timerColor}88)`,
              transition: 'width 1s linear, background 0.5s',
              boxShadow: `0 0 10px ${timerColor}66`,
            }} />
          </div>
        </div>

        {/* Puzzle area */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '28px', position: 'relative',
        }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div className="loading-spinner" />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '2px' }}>
                LOADING BLAST...
              </span>
            </div>
          ) : (
            <div className={`puzzle-image-container ${feedback === 'wrong' ? 'screen-shake' : ''}`} style={{
              width: '100%', maxWidth: '600px',
              border: feedback === 'correct'
                ? '3px solid var(--secondary)'
                : feedback === 'wrong'
                ? '3px solid var(--error)'
                : '2px solid var(--glass-border)',
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: feedback === 'correct'
                ? '0 0 30px rgba(0,255,136,0.3)'
                : feedback === 'wrong'
                ? '0 0 30px rgba(255,71,87,0.3)'
                : '0 8px 40px rgba(0,0,0,0.6)',
              transition: 'border 0.3s, box-shadow 0.3s',
              filter: isTimeOver ? 'blur(6px) grayscale(80%)' : 'none',
              opacity: isTimeOver ? 0.4 : 1,
              transition: 'all 0.4s ease',
            }}>
              <img src={questionUrl} alt="Math Puzzle" className="puzzle-image" style={{ width: '100%', display: 'block' }} />
            </div>
          )}

          {/* Time-over overlay on image */}
          {isTimeOver && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(10,10,12,0.7)',
            }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: 'var(--error)', marginBottom: '12px' }} />
              <span style={{ color: 'var(--error)', fontWeight: '900', fontSize: '1.5rem', letterSpacing: '4px' }}>
                MISSION FAILED
              </span>
            </div>
          )}
        </div>

      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — Controls & Stats
      ══════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10,10,18,0.97)',
        height: '100%',
        overflow: 'hidden',
        borderLeft: '1px solid var(--glass-border)',
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(247,185,36,0.2) transparent',
        }}>

        {/* Score & Meta */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px', padding: '18px',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-ranking-star" style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>Total XP</span>
            </div>
            <span style={{ fontWeight: '900', fontSize: '1.4rem', color: 'var(--primary)' }}>
              {totalScore.toLocaleString()}
            </span>
          </div>
          <div style={{ height: '1px', background: 'var(--glass-border)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--secondary)' }}>
                <i className="fa-solid fa-hashtag" style={{ fontSize: '0.75rem' }} />{questionNum}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Question</div>
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: streak > 2 ? 'var(--error)' : 'var(--accent)' }}>
                <i className="fa-solid fa-fire" style={{ marginRight: '2px' }} />{streak}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Streak</div>
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: config.color }}>
                <i className={`fa-solid ${config.icon}`} style={{ marginRight: '2px', fontSize: '0.85rem' }} />
                {config.label}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Level</div>
            </div>
          </div>
        </div>

        {/* Input section */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <i className="fa-solid fa-key" style={{ color: 'var(--primary)', fontSize: '0.9rem' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Decryption Key
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              ref={inputRef}
              type="number"
              min="0" max="9"
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || (val.length === 1 && val >= '0' && val <= '9')) {
                  setInputValue(val);
                }
              }}
              className="digit-input"
              placeholder="?"
              disabled={feedback === 'correct' || loading || isTimeOver}
              autoFocus
            />
            {(!feedback || feedback === 'wrong') && !isTimeOver && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={inputValue === '' || loading}
                  style={{ flex: 1 }}
                >
                  <i className="fa-solid fa-bolt" />
                  ENGAGE
                </button>
                <button
                  type="button"
                  onClick={handleQuit}
                  className="cancel-btn"
                  style={{ flex: 1 }}
                >
                  <i className="fa-solid fa-times" />
                  CANCEL
                </button>
              </div>
            )}
          </form>

          {/* Feedback */}
          {feedback && (
            <div className={`feedback ${feedback}`} style={{ textAlign: 'center', padding: '14px', borderRadius: '12px' }}>
              {feedback === 'correct' ? (
                <>
                  <div><i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }} />MISSION SUCCESS!</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '6px' }}>
                    Solved in {seconds}s · <i className="fa-solid fa-star" style={{ color: 'var(--primary)', marginRight: '3px' }} />+{pointsEarned} XP
                  </div>
                </>
              ) : (
                <div><i className="fa-solid fa-circle-xmark" style={{ marginRight: '8px' }} />ACCESS DENIED — Try again</div>
              )}
            </div>
          )}

          {/* Next Mission */}
          {feedback === 'correct' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handleNext} className="next-btn" style={{ width: '100%' }}>
                <i className="fa-solid fa-arrow-right" />
                NEXT MISSION
              </button>
              <button onClick={handleQuit} className="cancel-btn" style={{ width: '100%' }}>
                <i className="fa-solid fa-times" />
                CANCEL
              </button>
            </div>
          )}

          {/* Time Over */}
          {isTimeOver && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={fetchQuestion} className="next-btn" style={{ flex: 1, background: 'rgba(255,165,0,0.15)', borderColor: 'var(--warning)', color: 'var(--warning)' }}>
                <i className="fa-solid fa-rotate-right" />
                RETRY
              </button>
              <button onClick={handleQuit} className="cancel-btn" style={{ flex: 1 }}>
                <i className="fa-solid fa-times" />
                CANCEL
              </button>
            </div>
          )}
        </div>

        {/* Streak Bonus info */}
        {streak >= 2 && (
          <div style={{
            background: 'rgba(255,0,255,0.06)', border: '1px solid rgba(255,0,255,0.2)',
            borderRadius: '12px', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <i className="fa-solid fa-fire-flame-curved" style={{ color: 'var(--accent)', fontSize: '1.2rem' }} />
            <div>
              <div style={{ color: 'var(--accent)', fontWeight: '900', fontSize: '0.85rem' }}>
                {streak}× STREAK ACTIVE
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Keep it going for bonus XP!</div>
            </div>
          </div>
        )}

        {/* Recent activity */}
        {history.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--glass-border)',
            borderRadius: '14px', padding: '16px',
            flex: 1, minHeight: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <i className="fa-solid fa-chart-line" style={{ color: 'var(--secondary)', fontSize: '0.85rem' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Recent Activity
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[...history].reverse().slice(0, 5).map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: '0.78rem', padding: '6px 10px', borderRadius: '8px',
                  background: item.result === 'correct' ? 'rgba(0,255,136,0.05)' : 'rgba(255,71,87,0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className={`fa-solid ${item.result === 'correct' ? 'fa-check' : 'fa-times'}`}
                       style={{ color: item.result === 'correct' ? 'var(--secondary)' : 'var(--error)', width: '12px' }} />
                    <span style={{ color: 'var(--text-muted)' }}>
                      {item.result === 'correct' ? `${item.time}s` : 'Failed'}
                    </span>
                  </div>
                  <span style={{ color: item.result === 'correct' ? 'var(--primary)' : 'var(--error)', fontWeight: '800' }}>
                    {item.result === 'correct' ? `+${item.pts} XP` : '±0 XP'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        </div>

      </div>{/* end right panel */}

      {/* Time-over modal */}
      {isTimeOver && !showQuitModal && (
        <div className="modal-overlay" style={{ zIndex: 999 }}>
          <div className="time-over-modal">
            <i className="fa-solid fa-skull-crossbones" style={{ fontSize: '3rem', color: 'var(--error)', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '2rem', color: 'var(--error)', fontWeight: '900', marginBottom: '8px' }}>
              OUT OF TIME
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Mission compromised. The encryption has reset.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
              <button onClick={fetchQuestion} className="next-btn">
                <i className="fa-solid fa-rotate-right" />RETRY MISSION
              </button>
              <button onClick={handleQuit} className="cancel-btn">
                <i className="fa-solid fa-times" />CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quit confirmation modal */}
      {showQuitModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="time-over-modal">
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: '#ffaa00', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '2rem', color: '#fff', fontWeight: '900', marginBottom: '8px' }}>
              ABORT MISSION?
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Are you sure you want to quit? Your current progress will be lost.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
              <button onClick={(e) => { e.preventDefault(); setShowQuitModal(false); setTimeout(() => inputRef.current?.focus(), 100); }} className="next-btn">
                <i className="fa-solid fa-play" />RESUME
              </button>
              <button onClick={(e) => { e.preventDefault(); navigate('/'); }} className="cancel-btn">
                <i className="fa-solid fa-power-off" />QUIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
