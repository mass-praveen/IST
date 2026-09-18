import { useState, useEffect } from 'react';
import { 
  Flame, CheckCircle2, Circle, ArrowRight, Sparkles, 
  Calendar, Trophy, Award, Target, Zap, Check, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../utils/api';
import './DailyPractice.css';

export default function DailyPractice() {
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDaily = async () => {
    try {
      const res = await fetch(endpoints.dailyToday(1));
      if (!res.ok) throw new Error('Failed to load daily practice');
      const data = await res.json();
      setDailyData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaily();
  }, []);

  const handleToggleTask = async (task) => {
    try {
      await fetch(endpoints.dailyCompleteTask, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, taskId: task.id })
      });
      fetchDaily();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartTask = (task) => {
    navigate(task.link);
  };

  if (loading || !dailyData) {
    return <div className="glass-panel-premium" style={{padding: '3rem', textAlign: 'center'}}>Loading Daily Practice...</div>;
  }

  const allComplete = dailyData.completedCount === dailyData.totalCount;

  return (
    <div className="daily-practice-container animate-fade-in">
      {/* Hero Header with Streak */}
      <div className="daily-hero-banner glass-panel-premium space-between">
        <div>
          <div className="setup-badge">
            <Calendar size={16} /> Daily Training Routine
          </div>
          <h1>Today's Interview Prep Plan</h1>
          <p className="text-secondary">Consistent daily practice is the #1 predictor of tech placement success.</p>
          
          <div className="progress-summary-row">
            <span>Progress: <strong>{dailyData.completedCount}/{dailyData.totalCount} Tasks Finished</strong></span>
            <div className="bar-bg" style={{width: '200px', height: '10px'}}>
              <div className="bar-fill" style={{width: `${dailyData.completionPercentage}%`, background: 'var(--success)'}}></div>
            </div>
            <span className="text-success">{dailyData.completionPercentage}%</span>
          </div>
        </div>

        <div className="streak-badge-card">
          <div className="flame-icon-wrap">
            <Flame size={48} className="flame-icon text-warning pulse" />
          </div>
          <div className="streak-info">
            <span className="streak-num">{dailyData.streak}</span>
            <span className="streak-label">Day Streak 🔥</span>
          </div>
        </div>
      </div>

      {allComplete && (
        <div className="all-tasks-celebration glass-panel-premium mt-3 space-between animate-scale-up">
          <div className="flex-center" style={{gap: '1rem'}}>
            <Trophy size={32} className="text-warning" />
            <div>
              <h3>All Daily Goals Complete! 🎉</h3>
              <p className="text-secondary">You earned +350 XP and leveled up your readiness index for today.</p>
            </div>
          </div>
          <span className="badge">100% Prepared</span>
        </div>
      )}

      {/* Daily Tasks List */}
      <div className="daily-tasks-list mt-4">
        <h2>Today's Checklist</h2>
        
        <div className="tasks-cards-grid">
          {dailyData.tasks.map((task) => (
            <div key={task.id} className={`daily-task-item glass-panel ${task.done ? 'task-completed' : ''}`}>
              <div className="task-left flex-center" style={{gap: '1.2rem', cursor: 'pointer'}} onClick={() => handleToggleTask(task)}>
                <div className={`check-indicator ${task.done ? 'done' : ''}`}>
                  {task.done ? <CheckCircle2 size={26} className="text-success" /> : <Circle size={26} className="text-tertiary" />}
                </div>
                <div>
                  <h3>{task.title}</h3>
                  <p className="text-secondary text-sm">{task.count} • <span className="text-accent">+{task.xp} XP</span></p>
                </div>
              </div>

              <div className="flex-center" style={{gap: '0.8rem'}}>
                {task.done ? (
                  <span className="tag tag-success" onClick={() => handleToggleTask(task)} style={{cursor: 'pointer'}}>
                    Completed ✓
                  </span>
                ) : (
                  <button className="btn btn-primary premium-btn btn-sm flex-center" onClick={() => handleStartTask(task)}>
                    Start Now <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Roadmap Preview */}
      <div className="roadmap-preview-card glass-panel-premium mt-4">
        <div className="space-between mb-3">
          <h3><Target size={20} className="text-accent" /> 7-Day Personalized Sprint</h3>
          <span className="badge">Week 1 Active</span>
        </div>

        <div className="sprint-days-row">
          <div className="sprint-day-chip done" onClick={() => navigate('/interview')}>Day 1: Behavioral STAR (Done)</div>
          <div className="sprint-day-chip done" onClick={() => navigate('/mcq')}>Day 2: Quantitative Aptitude (Done)</div>
          <div className="sprint-day-chip current" onClick={() => navigate('/coding')}>Day 3: Two Sum & Algorithms (Today)</div>
          <div className="sprint-day-chip locked" onClick={() => navigate('/interview')}>Day 4: System Design Architecture</div>
          <div className="sprint-day-chip locked" onClick={() => navigate('/interview')}>Day 5: Full Mock Interview (Coach AI)</div>
          <div className="sprint-day-chip locked" onClick={() => navigate('/mcq')}>Day 6: Speed Mock Test</div>
          <div className="sprint-day-chip locked" onClick={() => navigate('/profile')}>Day 7: Performance Review</div>
        </div>
      </div>
    </div>
  );
}
