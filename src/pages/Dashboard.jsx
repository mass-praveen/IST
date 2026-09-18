import { useState, useEffect } from 'react';
import { 
  Target, Trophy, Clock, BrainCircuit, Play, AlertCircle, 
  Flame, Award, Code2, FileText, CheckCircle2, ArrowRight,
  TrendingUp, Sparkles, MessageSquare, ShieldAlert, RefreshCw,
  Video, ListTodo, Bot, Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { endpoints } from '../utils/api';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchStats = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const response = await fetch(endpoints.dashboardStats);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load dashboard data. Ensure the backend is running.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="glass-panel-premium" style={{padding: '3rem', textAlign: 'center'}}>
          <Sparkles className="spin text-accent" size={32} />
          <p className="mt-2 text-secondary">Loading your interview readiness analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="glass-panel-premium" style={{padding: '2.5rem', display: 'flex', gap: '1rem', color: 'var(--error)'}}>
          <AlertCircle size={28} /> 
          <div>
            <h3>Connection Error</h3>
            <p>{error}</p>
            <button className="btn btn-secondary mt-3" onClick={() => fetchStats(true)}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Welcome Hero Banner with Streak & Refresh Button */}
      <div className="dashboard-welcome-banner glass-panel-premium-premium space-between">
        <div>
          <div className="welcome-tag">
            <Sparkles size={16} /> AI Interview Readiness
          </div>
          <h1 className="welcome-title">Welcome back, <span className="text-gradient">{user?.name || 'Guest'}</span></h1>
          <p className="welcome-subtitle">
            Your overall interview readiness index is <strong className="text-gradient">{stats.overallScore}%</strong>. You are on track for top tech company placements!
          </p>
        </div>

        <div className="flex-center" style={{gap: '1rem'}}>
          <button 
            className="btn btn-ghost icon-btn" 
            onClick={() => fetchStats(true)} 
            title="Refresh Live Metrics"
          >
            <RefreshCw size={18} className={isRefreshing ? 'spin' : ''} />
          </button>

          <div className="streak-badge-pill flex-center">
            <Flame size={26} className="text-warning pulse" />
            <div>
              <span className="streak-count-val">{stats.dailyStreak} Days</span>
              <span className="streak-sub">Daily Streak 🔥</span>
            </div>
          </div>
        </div>
      </div>



      {/* Primary KPI Metrics Grid */}
      <div className="stats-kpi-grid mt-4">
        {/* Overall Score */}
        <div className="kpi-card glass-panel-premium-premium hover-lift premium-border">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
            <Award size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Overall Readiness</span>
            <h3 className="kpi-value">{stats.overallScore}%</h3>
            <span className="kpi-trend text-success">+6% this week</span>
          </div>
        </div>

        {/* Technical Score */}
        <div className="kpi-card glass-panel-premium-premium hover-lift premium-border">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <Target size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Technical Mastery</span>
            <h3 className="kpi-value">{stats.technicalScore}%</h3>
            <span className="kpi-trend text-secondary">{stats.totalInterviews} Mock Sessions</span>
          </div>
        </div>

        {/* MCQ Accuracy */}
        <div className="kpi-card glass-panel-premium-premium hover-lift premium-border">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Trophy size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">MCQ Accuracy</span>
            <h3 className="kpi-value">{stats.mcqAccuracy}%</h3>
            <span className="kpi-trend text-secondary">{stats.totalMcqs} Tests Taken</span>
          </div>
        </div>

        {/* Coding Score */}
        <div className="kpi-card glass-panel-premium-premium hover-lift premium-border">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
            <Code2 size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Coding Problems</span>
            <h3 className="kpi-value">{stats.codingSolved} Solved</h3>
            <span className="kpi-trend text-success">88% Acceptance</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Chart & Radar + Weak Areas */}
      <div className="dashboard-double-grid mt-4">
        {/* Weekly Trend Bar Chart */}
        <div className="analytics-box glass-panel-premium-premium">
          <div className="space-between mb-3">
            <h3><TrendingUp size={20} className="text-accent" /> Weekly Performance Trend</h3>
            <span className="badge">Last 7 Days</span>
          </div>

          <div className="weekly-chart-bars" style={{ height: '250px', width: '100%', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.weeklyTrend || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} 
                  itemStyle={{ fontSize: '13px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="interview" name="AI Interview" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="mcq" name="MCQ Practice" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="coding" name="Coding Arena" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Breakdown Radar / Bars */}
        <div className="analytics-box glass-panel-premium-premium">
          <div className="space-between mb-3">
            <h3><BrainCircuit size={20} className="text-success" /> Domain Competency</h3>
            <span className="text-secondary text-sm">Target: Senior Level</span>
          </div>

          <div className="domain-bars-list" style={{ height: '250px', width: '100%', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.skillsRadar || []}>
                <PolarGrid stroke="var(--border-subtle)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Competency" dataKey="score" stroke="var(--accent-primary)" fill="var(--accent-glow)" fillOpacity={0.6} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} 
                  itemStyle={{ fontSize: '13px', color: 'var(--accent-primary)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Weak Skills Alert */}
          <div className="weak-skills-chip-box mt-3">
            <span className="text-warning flex-center mb-1" style={{justifyContent: 'flex-start', gap: '0.4rem', fontSize: '0.85rem'}}>
              <ShieldAlert size={14} /> Recommended Focus Areas:
            </span>
            <div className="flex-center" style={{justifyContent: 'flex-start', gap: '0.4rem', flexWrap: 'wrap'}}>
              {stats.weakSkills?.map((ws, i) => (
                <span key={i} className="tag tag-warning">{ws}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch & Recent Activity */}
      <div className="dashboard-bottom-grid mt-4">
        {/* Recommended Daily Action */}
        <div className="action-cta-card glass-panel-premium-premium">
          <div className="space-between mb-2">
            <span className="badge">Recommended Sprint</span>
            <span className="text-secondary text-sm">Est. 20 mins</span>
          </div>
          <h2>AI Video Mock Interview</h2>
          <p className="text-secondary mb-3">
            Practice behavioral and technical questions customized with your recent resume keywords.
          </p>
          <div className="cta-buttons-row mt-4">
            <button className="btn btn-primary premium-btn flex-center" onClick={() => navigate('/interview')}>
              <Play size={16} /> Launch Interview
            </button>
            <button className="btn btn-secondary premium-btn-outline flex-center" onClick={() => navigate('/coding')}>
              <Code2 size={16} /> Solve Code
            </button>
          </div>
        </div>

        {/* Recent Performance Activity */}
        <div className="recent-activity-panel glass-panel-premium-premium">
          <div className="space-between mb-3">
            <h3>Recent Activity</h3>
            <button className="btn btn-ghost btn-xs" onClick={() => navigate('/progress')}>View All</button>
          </div>

          <div className="activity-timeline-list">
            {stats.recentActivity?.map((act, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-info">
                  <h4>{act.title}</h4>
                  <p>{new Date(act.created_at).toLocaleDateString()}</p>
                </div>
                <div className={`timeline-score ${act.score >= 80 ? 'score-good' : 'score-warning'}`}>
                  {Math.round(act.score)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
