import React, { useState, useEffect } from 'react';
import { X, Trophy, Award, Flame, Star, Play, Pause, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { COLLEGE_DEPARTMENTS, COLLEGE_BATCHES } from '../data/sampleData';

export function TvModeSlideshow({ students, onCloseTvMode, soundEnabled }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 9000;

  // Top overall performers based on rating, contest attendance, solved total & rank
  const sortedOverall = [...students].sort((a, b) => {
    const scoreA = ((a.leetcode?.contestRating || 0) * 2) + ((a.leetcode?.contestAttended || 0) * 25) + ((a.leetcode?.solvedTotal || 0) * 1.5);
    const scoreB = ((b.leetcode?.contestRating || 0) * 2) + ((b.leetcode?.contestAttended || 0) * 25) + ((b.leetcode?.solvedTotal || 0) * 1.5);
    return scoreB - scoreA;
  });
  const top10 = sortedOverall.slice(0, 10);

  // All Department Champions (AIDS, AIML, CCE, CSBS, CSE, CYS, ECE, EEE, IT, MECH)
  const allDepts = COLLEGE_DEPARTMENTS.filter(d => d !== 'All');
  const deptChampions = allDepts.map(d => {
    const top = students.filter(s => s.department === d).sort((a, b) => (b.leetcode?.solvedTotal || 0) - (a.leetcode?.solvedTotal || 0))[0];
    return { dept: d, student: top };
  }).filter(item => item.student);

  // Batch-wise Toppers (2023-2027, 2024-2028, 2025-2029)
  const allBatches = COLLEGE_BATCHES.filter(b => b !== 'All');
  const batchToppers = allBatches.map(batchName => {
    const top = students.filter(s => s.batch === batchName).sort((a, b) => (b.leetcode?.solvedTotal || 0) - (a.leetcode?.solvedTotal || 0))[0];
    return { batch: batchName, student: top };
  }).filter(item => item.student);

  // LeetCode Contest Titans (Highest Rating & Max Contests)
  const sortedRating = [...students].sort((a, b) => (b.leetcode?.contestRating || 0) - (a.leetcode?.contestRating || 0)).slice(0, 5);

  // Slide timer step
  useEffect(() => {
    if (!isPlaying) return;

    const intervalStep = 100;
    const increment = (intervalStep / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setActiveSlide(s => (s + 1) % 4);
          return 0;
        }
        return prev + increment;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isPlaying, activeSlide]);

  useEffect(() => {
    if (activeSlide === 0) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    }
  }, [activeSlide]);

  return (
    <div className="tv-broadcast-overlay tv-light-theme">
      {/* TV Header Bar - Light Eshwar Theme */}
      <div className="tv-header tv-header-light">
        <div className="tv-logo-group">
          <div className="tv-logo-badge">SE</div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF' }}>
              Sri Eshwar College of Engineering
            </h1>
            <p style={{ color: '#FFC72C', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.05em' }}>
              LEETCODE CODING LEADERBOARD • SMART TV BROADCAST MODE
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.18)', padding: '0.4rem 0.9rem', borderRadius: '30px' }}>
            {[0, 1, 2, 3].map(idx => (
              <button
                key={idx}
                onClick={() => { setActiveSlide(idx); setProgress(0); }}
                style={{
                  width: idx === activeSlide ? '30px' : '12px',
                  height: '12px',
                  borderRadius: '6px',
                  background: idx === activeSlide ? '#FFB800' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFF', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer' }}
            title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={onCloseTvMode}
            style={{ background: '#EF4444', border: 'none', color: '#FFF', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
          >
            <X size={20} />
            <span>Exit Broadcast</span>
          </button>
        </div>
      </div>

      {/* TV Main Content */}
      <div className="tv-main-slide">
        {/* SLIDE 0: Overall Hall of Fame */}
        {activeSlide === 0 && (
          <div style={{ width: '100%', maxWidth: '1200px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.4rem', color: '#003366', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontWeight: 900 }}>
              <Trophy size={38} color="#FFB800" />
              <span>COLLEGE LEETCODE CHAMPIONS • HALL OF FAME</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginTop: '2rem', alignItems: 'center' }}>
              {top10.slice(0, 3).map((st, idx) => (
                <div key={st.id} style={{
                  background: idx === 0 ? 'linear-gradient(180deg, #FFF9E6 0%, #FFFFFF 100%)' : '#FFFFFF',
                  border: idx === 0 ? '3px solid #FFB800' : '1px solid #E2E8F0',
                  borderRadius: '24px',
                  padding: '2rem 1.5rem',
                  boxShadow: idx === 0 ? '0 12px 35px rgba(255, 184, 0, 0.4)' : '0 8px 25px rgba(0, 51, 102, 0.08)',
                  transform: idx === 0 ? 'scale(1.08)' : 'scale(1)'
                }}>
                  <div style={{
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    color: idx === 0 ? '#D99B00' : idx === 1 ? '#475569' : '#D97706',
                    marginBottom: '0.5rem'
                  }}>
                    {idx === 0 ? '👑 RANK #1' : idx === 1 ? '🥈 RANK #2' : '🥉 RANK #3'}
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>{st.name}</h3>
                  <div style={{ background: '#E6F0FA', color: '#003366', display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 800, margin: '0.5rem 0 1rem 0' }}>
                    {st.department} • {st.batch}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'center', marginTop: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid #EEF2F6' }}>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D99B00' }}>{st.leetcode?.solvedTotal || 0}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>LeetCode Solved</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0056B3' }}>{st.leetcode?.contestRating || 1500}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Contest Rating</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 1: ALL Department Champions (AIDS, AIML, CCE, CSBS, CSE, CYS, ECE, EEE, IT, MECH) */}
        {activeSlide === 1 && (
          <div style={{ width: '100%', maxWidth: '1250px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.2rem', color: '#003366', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontWeight: 900 }}>
              <Award size={36} color="#0056B3" />
              <span>ALL DEPARTMENT TOPPERS (AIDS, AIML, CCE, CSBS, CSE, CYS, ECE, EEE, IT, MECH)</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
              {deptChampions.map(item => (
                <div key={item.dept} style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '1.25rem 0.85rem',
                  textAlign: 'center',
                  boxShadow: '0 6px 20px rgba(0, 51, 102, 0.06)'
                }}>
                  <div style={{ background: '#FFB800', color: '#002855', fontWeight: 900, fontSize: '1rem', borderRadius: '8px', padding: '0.25rem', marginBottom: '0.75rem' }}>
                    {item.dept}
                  </div>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#E6F0FA', color: '#003366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem', margin: '0 auto 0.5rem auto', border: '2px solid #FFB800' }}>
                    {item.student.name.charAt(0)}
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', minHeight: '2.4rem' }}>{item.student.name}</h4>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0056B3', marginTop: '0.25rem' }}>
                    {item.student.leetcode?.solvedTotal || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Solved • {item.student.leetcode?.contestRating} Rating</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 2: Batch-wise Toppers (2023-2027, 2024-2028, 2025-2029) */}
        {activeSlide === 2 && (
          <div style={{ width: '100%', maxWidth: '1150px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.4rem', color: '#003366', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontWeight: 900 }}>
              <Star size={38} color="#FFB800" />
              <span>BATCH-WISE LEETCODE TOPPERS</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
              {batchToppers.map(item => (
                <div key={item.batch} style={{
                  background: '#FFFFFF',
                  border: '2px solid #0056B3',
                  borderRadius: '24px',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  boxShadow: '0 10px 30px rgba(0, 51, 102, 0.1)'
                }}>
                  <div style={{ background: '#003366', color: '#FFC72C', fontWeight: 900, fontSize: '1.25rem', borderRadius: '12px', padding: '0.5rem', marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
                    BATCH {item.batch}
                  </div>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#FFB800', color: '#002855', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '2rem', margin: '0 auto 1rem auto', boxShadow: '0 4px 15px rgba(255,184,0,0.4)' }}>
                    {item.student.name.charAt(0)}
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>{item.student.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 700, marginBottom: '1.25rem' }}>
                    {item.student.department} Dept • Roll: {item.student.rollNo}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#D99B00' }}>{item.student.leetcode?.solvedTotal}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>LeetCode Solved</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0056B3' }}>{item.student.leetcode?.contestRating}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Contest Rating</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 3: LeetCode Contest Titans & Rating Leaders */}
        {activeSlide === 3 && (
          <div style={{ width: '100%', maxWidth: '1100px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.4rem', color: '#003366', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontWeight: 900 }}>
              <Flame size={38} color="#F59E0B" />
              <span>LEETCODE CONTEST TITANS & MAX CONTESTS ATTENDED</span>
            </h2>

            <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0, 51, 102, 0.08)' }}>
              {sortedRating.map((st, idx) => (
                <div key={st.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.5rem',
                  borderBottom: idx < sortedRating.length - 1 ? '1px solid #F1F5F9' : 'none',
                  background: idx === 0 ? '#FFF9E6' : 'transparent',
                  borderRadius: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: idx === 0 ? '#D99B00' : '#64748B', width: '40px' }}>
                      #{idx + 1}
                    </span>
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>{st.name}</h4>
                      <span style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>{st.department} • Roll: {st.rollNo}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0056B3' }}>{st.leetcode?.contestRating || 1500}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Contest Rating</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669' }}>{st.leetcode?.contestAttended || 0}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Contests Attended</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Marquee Live Ticker */}
      <div className="tv-ticker-bar tv-ticker-light">
        <div className="ticker-track">
          <span className="ticker-item">
            🎓 <span className="ticker-highlight">SRI ESHWAR COLLEGE OF ENGINEERING</span> - Department of Technical Training.
          </span>
          <span className="ticker-item">
            🏆 Top LeetCode Coder: <span className="ticker-highlight">{top10[0]?.name} ({top10[0]?.department})</span> with {top10[0]?.leetcode?.solvedTotal} Solved!
          </span>
          <span className="ticker-item">
            🔥 Highest Contest Rating: <span className="ticker-highlight">{sortedRating[0]?.name} ({sortedRating[0]?.leetcode?.contestRating} Rating)</span>
          </span>
          <span className="ticker-item">
            ⚡ All Departments (AIDS, AIML, CCE, CSBS, CSE, CYS, ECE, EEE, IT, MECH) & Batch Toppers Active!
          </span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="tv-progress-line" style={{ width: `${progress}%` }} />
    </div>
  );
}
