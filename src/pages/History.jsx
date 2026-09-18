import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { endpoints } from '../utils/api';
import { Calendar, Video, FileText, Code, Clock, Award, Activity } from 'lucide-react';
import './History.css';

export default function History() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('interviews');
  const [historyData, setHistoryData] = useState({ interviews: [], mcqs: [], coding: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(endpoints.historyAll(user.id));
      const json = await res.json();
      if (json.success) {
        setHistoryData(json.data);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getScoreClass = (score, outOf = 100) => {
    const percentage = (score / outOf) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="history-page-container animate-fade-in">
      <div className="history-hero glass-panel-premium">
        <Activity size={48} className="text-accent mb-3 mx-auto" />
        <h1 className="text-gradient">Your Performance History</h1>
        <p className="text-secondary mt-2">Review your past interviews, assessments, and coding submissions.</p>
      </div>

      <div className="history-tabs">
        <button 
          className={`history-tab ${activeTab === 'interviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('interviews')}
        >
          <Video size={18} /> Mock Interviews
        </button>
        <button 
          className={`history-tab ${activeTab === 'mcqs' ? 'active' : ''}`}
          onClick={() => setActiveTab('mcqs')}
        >
          <FileText size={18} /> MCQ Assessments
        </button>
        <button 
          className={`history-tab ${activeTab === 'coding' ? 'active' : ''}`}
          onClick={() => setActiveTab('coding')}
        >
          <Code size={18} /> Coding Practice
        </button>
      </div>

      {loading ? (
        <div className="flex-center py-5"><div className="spin"><Activity size={24} /></div></div>
      ) : (
        <div className="history-grid">
          {activeTab === 'interviews' && (
            historyData.interviews.length > 0 ? historyData.interviews.map(item => (
              <div key={item.id} className="history-card glass-panel-premium animate-slide-up">
                <div className="history-card-header">
                  <div>
                    <h3 className="history-title">{item.type} Interview</h3>
                    <p className="history-subtitle">{item.role} • {item.difficulty}</p>
                  </div>
                  <div className={`history-score-circle ${getScoreClass(item.overall_score)}`}>
                    {item.overall_score}
                  </div>
                </div>
                <div className="history-date">
                  <Calendar size={14} /> {formatDate(item.created_at)}
                </div>
                <div className="mt-2 text-secondary" style={{fontSize: '0.85rem'}}>
                  Tech: {item.technical_score}% | Comm: {item.communication_score}%
                </div>
              </div>
            )) : <div className="empty-state glass-panel">No interviews found yet.</div>
          )}

          {activeTab === 'mcqs' && (
            historyData.mcqs.length > 0 ? historyData.mcqs.map(item => (
              <div key={item.id} className="history-card glass-panel-premium animate-slide-up">
                <div className="history-card-header">
                  <div>
                    <h3 className="history-title">{item.topic.split('-')[0]}</h3>
                    <p className="history-subtitle">{item.topic}</p>
                  </div>
                  <div className={`history-score-circle ${getScoreClass(item.score, item.total)}`}>
                    {Math.round((item.score / item.total) * 100)}%
                  </div>
                </div>
                <div className="history-date">
                  <Calendar size={14} /> {formatDate(item.created_at)}
                </div>
                <div className="mt-2 text-secondary" style={{fontSize: '0.85rem'}}>
                  Correct: {item.score} / {item.total}
                </div>
              </div>
            )) : <div className="empty-state glass-panel">No assessments completed yet.</div>
          )}

          {activeTab === 'coding' && (
            historyData.coding.length > 0 ? historyData.coding.map(item => (
              <div key={item.id} className="history-card glass-panel-premium animate-slide-up">
                <div className="history-card-header">
                  <div>
                    <h3 className="history-title">{item.problem_title}</h3>
                    <p className="history-subtitle">{item.language} • {item.status}</p>
                  </div>
                  <div className={`history-score-circle ${item.status === 'Accepted' ? 'success' : 'danger'}`}>
                    {item.status === 'Accepted' ? <Award size={20} /> : <Clock size={20} />}
                  </div>
                </div>
                <div className="history-date">
                  <Calendar size={14} /> {formatDate(item.created_at)}
                </div>
                <div className="mt-2 text-secondary" style={{fontSize: '0.85rem'}}>
                  Tests Passed: {item.tests_passed} / {item.total_tests}
                </div>
              </div>
            )) : <div className="empty-state glass-panel">No coding submissions found yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
