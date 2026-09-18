import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Briefcase, Award, Sparkles, CheckCircle2, 
  ShieldCheck, Flame, Code2, FileText, Target, Save, Palette, Check, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { endpoints } from '../utils/api';
import { appThemes } from '../components/common/ThemeSelector';
import './Profile.css';

export default function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('ist_app_theme') || 'indigo';
  });

  const handleSelectTheme = (themeId) => {
    setActiveTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('ist_app_theme', themeId);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(endpoints.profile(1));
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data);
        setName(data.name || '');
        setRole(data.role || '');
        setExperienceLevel(data.experience_level || '');
        setTargetCompany(data.target_company || '');
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(endpoints.profile(1), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, experienceLevel, targetCompany })
      });

      if (!res.ok) throw new Error('Failed to save');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  if (!profile) {
    return <div className="glass-panel-premium" style={{padding: '3rem', textAlign: 'center'}}>Loading User Profile...</div>;
  }

  const stats = profile.stats || {};
  const unlockedBadges = [];
  
  if (stats.interviews >= 1) {
    unlockedBadges.push({ title: 'Interview Pioneer', desc: 'Completed first AI Mock Interview', icon: Award, color: '#6366f1' });
  }
  if (stats.interviews >= 10) {
    unlockedBadges.push({ title: 'Interview Master', desc: 'Completed 10 AI Mock Interviews', icon: ShieldCheck, color: '#f43f5e' });
  }
  if (stats.codingProblems >= 1) {
    unlockedBadges.push({ title: 'Code Solver', desc: 'Solved your first algorithm test case', icon: Code2, color: '#10b981' });
  }
  if (stats.codingProblems >= 10) {
    unlockedBadges.push({ title: 'Algo Expert', desc: 'Solved 10 algorithm problems', icon: Target, color: '#10b981' });
  }
  if (stats.mcqs >= 5) {
    unlockedBadges.push({ title: 'Quiz Whiz', desc: 'Completed 5 MCQ assessments', icon: Target, color: '#f59e0b' });
  }
  if (stats.resumeScore >= 75) {
    unlockedBadges.push({ title: 'ATS Verified', desc: 'Resume score above 75', icon: ShieldCheck, color: '#a78bfa' });
  }

  // Calculate XP based on activity
  const totalXp = (stats.interviews || 0) * 150 + (stats.codingProblems || 0) * 50 + (stats.mcqs || 0) * 20;
  const level = Math.floor(totalXp / 500) + 1;

  return (
    <div className="profile-container animate-fade-in">
      {/* Profile Header Hero */}
      <div className="profile-hero glass-panel-premium space-between">
        <div className="flex-center" style={{gap: '1.5rem'}}>
          <div className="profile-large-avatar text-gradient">
            {name.charAt(0)}
          </div>
          <div>
            <h1>{name}</h1>
            <p className="text-secondary">{role} • {experienceLevel}</p>
            <span className="badge mt-2">Targeting: {targetCompany}</span>
          </div>
        </div>

        <div className="profile-xp-pill">
          <Sparkles size={20} className="text-accent" />
          <div>
            <span className="xp-val">{totalXp.toLocaleString()} XP</span>
            <span className="xp-sub">Level {level} Candidate</span>
          </div>
        </div>
      </div>

      {/* Lifetime Stats Banner */}
      <div className="lifetime-stats-grid mt-4">
        <div className="life-stat-box glass-panel-premium">
          <span className="life-stat-num text-gradient">{profile.stats?.interviews || 2}</span>
          <span className="life-stat-label">Interviews Done</span>
        </div>
        <div className="life-stat-box glass-panel-premium">
          <span className="life-stat-num text-accent">{profile.stats?.mcqs || 3}</span>
          <span className="life-stat-label">MCQ Quizzes</span>
        </div>
        <div className="life-stat-box glass-panel-premium">
          <span className="life-stat-num text-success">{profile.stats?.codingProblems || 4}</span>
          <span className="life-stat-label">Problems Solved</span>
        </div>
        <div className="life-stat-box glass-panel-premium">
          <span className="life-stat-num text-warning">{profile.stats?.resumeScore || 82}%</span>
          <span className="life-stat-label">Resume Grade</span>
        </div>
      </div>

      {/* Theme Color Customizer */}
      <div className="theme-customizer-panel glass-panel-premium mt-4">
        <div className="space-between mb-3">
          <h3 className="flex-center" style={{gap: '0.5rem'}}>
            <Palette size={20} className="text-accent" /> App Theme Color Palette (5 Curated Themes)
          </h3>
          <span className="text-secondary text-sm">Instant live preview</span>
        </div>

        <div className="theme-swatches-grid">
          {appThemes.map((theme) => {
            const isSelected = theme.id === activeTheme;
            return (
              <button
                key={theme.id}
                className={`theme-card-button glass-panel flex-center ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectTheme(theme.id)}
              >
                <div className="theme-card-gradient" style={{ background: theme.preview }} />
                <div className="theme-card-info">
                  <span className="theme-card-name">{theme.name}</span>
                  {isSelected && <span className="theme-active-tag text-accent flex-center"><Check size={14} /> Active</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Edit Form & Badges Grid */}
      <div className="profile-split-grid mt-4">
        {/* Edit Form */}
        <div className="profile-edit-card glass-panel-premium">
          <div className="space-between mb-3">
            <h3>Edit Candidate Profile</h3>
            {saveSuccess && <span className="text-success text-sm flex-center"><CheckCircle2 size={14} /> Saved!</span>}
          </div>

          <form onSubmit={handleSave} className="profile-form">
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>

            <div className="input-group">
              <label className="input-label">Target Job Role</label>
              <input 
                type="text" 
                className="input-field" 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                required 
              />
            </div>

            <div className="input-group">
              <label className="input-label">Experience Level</label>
              <select className="input-field" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
                <option>Entry Level (0-2 Yrs)</option>
                <option>Intermediate (3-5 Yrs)</option>
                <option>Senior (5+ Yrs)</option>
                <option>Lead / Architect</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Target Companies</label>
              <input 
                type="text" 
                className="input-field" 
                value={targetCompany} 
                onChange={(e) => setTargetCompany(e.target.value)} 
              />
            </div>

            <button className="btn btn-primary premium-btn flex-center mt-2" type="submit" disabled={isSaving}>
              <Save size={16} /> {isSaving ? 'Saving Changes...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Badges & Skills */}
        <div className="profile-extras-card">
          <h2 className="mb-3 flex-center" style={{justifyContent: 'flex-start', gap: '0.5rem'}}>
            <Award size={22} className="text-gradient" /> My Achievements ({unlockedBadges.length})
          </h2>
        
          {unlockedBadges.length > 0 ? (
            <div className="achievements-grid">
              {unlockedBadges.map((badge, idx) => (
                <div key={idx} className="badge-card glass-panel-premium flex-center" style={{flexDirection: 'column', textAlign: 'center', gap: '0.8rem'}}>
                  <div className="badge-icon flex-center" style={{background: `${badge.color}20`, color: badge.color}}>
                    <badge.icon size={28} />
                  </div>
                  <div>
                    <h4 style={{fontSize: '1rem', marginBottom: '0.2rem'}}>{badge.title}</h4>
                    <p className="text-secondary" style={{fontSize: '0.8rem'}}>{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>
              Complete interviews and coding challenges to unlock achievements!
            </div>
          )}

          <div className="skills-tag-panel glass-panel-premium mt-3">
            <h3 className="mb-2">Verified Skill Matrix</h3>
            <div className="skills-flex-tags">
              {(profile.stats?.skills || ['React', 'JavaScript', 'Node.js', 'Python', 'SQL', 'Docker']).map((s, i) => (
                <span key={i} className="tag tag-success">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4" style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          className="btn btn-ghost flex-center"
          onClick={handleLogout}
          title="Logout"
          style={{ color: 'var(--text-secondary)', borderColor: 'rgba(255,255,255,0.2)', minWidth: '180px' }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}
