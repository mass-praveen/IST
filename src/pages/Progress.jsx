import { useState, useEffect } from 'react';
import { 
  TrendingUp, Award, Target, BookOpen, AlertCircle, 
  Sparkles, CheckCircle2, ShieldAlert, Trophy, Flame
} from 'lucide-react';
import { endpoints } from '../utils/api';
import './Progress.css';

export default function Progress() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(endpoints.dashboardStats);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const overallScore = stats?.overallScore || 82;
  const technicalScore = stats?.technicalScore || 85;
  const commScore = stats?.communicationScore || 78;

  return (
    <div className="progress-container animate-fade-in">
      <div className="progress-header">
        <div className="setup-badge">
          <Sparkles size={16} /> Performance Tracking
        </div>
        <h1>Candidate Readiness & Skill Progress</h1>
        <p>Track your interview competencies, consistency streaks, and personalized skill improvement areas.</p>
      </div>

      <div className="metrics-overview mt-4">
        <div className="metric-box glass-panel-premium">
          <div className="metric-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
            <TrendingUp size={26} />
          </div>
          <div className="metric-info">
            <h4>Overall Readiness</h4>
            <span className="metric-big text-gradient">{overallScore}%</span>
            <span className="text-success">+6% this week</span>
          </div>
        </div>

        <div className="metric-box glass-panel-premium">
          <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <Award size={26} />
          </div>
          <div className="metric-info">
            <h4>Technical Mastery</h4>
            <span className="metric-big" style={{ color: '#34d399' }}>{technicalScore}%</span>
            <span className="text-success">{stats?.totalInterviews || 2} Mock Sessions</span>
          </div>
        </div>

        <div className="metric-box glass-panel-premium">
          <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Target size={26} />
          </div>
          <div className="metric-info">
            <h4>Communication & Clarity</h4>
            <span className="metric-big" style={{ color: '#fbbf24' }}>{commScore}%</span>
            <span className="text-warning">STAR Focus Needed</span>
          </div>
        </div>
      </div>

      <div className="progress-content-grid mt-4">
        {/* 7-Day Plan */}
        <div className="learning-plan glass-panel-premium">
          <div className="plan-header space-between">
            <h3>7-Day Personalized Improvement Plan</h3>
            <span className="badge">Week 1 Active</span>
          </div>
          
          <div className="plan-days">
            <div className="plan-day completed">
              <div className="day-number">Day 1</div>
              <div className="day-content">
                <h5>React & System Scalability</h5>
                <p>Completed 10 MCQs & Video Screen</p>
              </div>
            </div>
            
            <div className="plan-day completed">
              <div className="day-number">Day 2</div>
              <div className="day-content">
                <h5>Quantitative Aptitude & Time-Speed</h5>
                <p>Scored 90% accuracy</p>
              </div>
            </div>
            
            <div className="plan-day current">
              <div className="day-number">Day 3</div>
              <div className="day-content">
                <h5>Two Sum & Algorithms</h5>
                <p>HackerRank coding practice</p>
              </div>
            </div>
            
            <div className="plan-day locked">
              <div className="day-number">Day 4</div>
              <div className="day-content">
                <h5>Behavioral STAR Methodology</h5>
                <p>Mock HR interview with Coach AI</p>
              </div>
            </div>

            <div className="plan-day locked">
              <div className="day-number">Day 5</div>
              <div className="day-content">
                <h5>Full Mock Placement Test</h5>
                <p>TCS / Infosys Assessment Mode</p>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Analysis Breakdown */}
        <div className="analysis-section glass-panel-premium">
          <h3>Domain Competency Index</h3>
          
          <div className="skill-bars mt-3">
            {stats?.skillsRadar?.map((skill, idx) => (
              <div key={idx} className="skill-bar-item mb-3">
                <div className="space-between mb-1">
                  <span>{skill.subject}</span>
                  <strong>{skill.score}%</strong>
                </div>
                <div className="bar-bg">
                  <div 
                    className="bar-fill" 
                    style={{
                      width: `${skill.score}%`,
                      background: skill.score >= 80 ? 'var(--success)' : skill.score >= 65 ? 'var(--accent-primary)' : 'var(--warning)'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="communication-issues mt-4">
            <h4 className="flex-center" style={{justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '0.8rem'}}>
              <AlertCircle size={18} className="text-warning"/> Coach AI Recommendations
            </h4>
            <ul className="issue-list">
              <li><strong>Quantifiable Metrics:</strong> Include percentage improvements (e.g., "reduced latency by 35%") in behavioral answers.</li>
              <li><strong>Pacing:</strong> Maintain steady speech rate (130-150 words per minute).</li>
              <li><strong>Missing Keywords:</strong> Review System Design, Docker, and CI/CD pipelines.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
