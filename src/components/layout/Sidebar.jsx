import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Video, ListTodo, Code2, FileText, 
  Flame, Bot, LineChart, User, ChevronLeft, ChevronRight
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/interview', label: 'AI Video Interview', icon: Video, badge: 'AI Voice' },
  { path: '/mcq', label: 'MCQ Practice', icon: ListTodo, badge: '10 Qs' },
  { path: '/coding', label: 'Coding Arena', icon: Code2 },
  { path: '/resume', label: 'Resume Analyzer', icon: FileText },
  { path: '/daily', label: 'Daily Practice', icon: Flame, badge: 'Streak' },
  { path: '/coach', label: 'AI Career Coach', icon: Bot },
  { path: '/progress', label: 'Progress & Reports', icon: LineChart },
  { path: '/reports', label: 'Detailed Reports', icon: FileText },
  { path: '/profile', label: 'My Profile', icon: User },
];

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside className={`sidebar glass-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="logo-icon text-gradient">IST</div>
        {isExpanded && (
          <div className="header-text-wrap">
            <h2 className="logo-text">Interview Skill Trainer</h2>
            <span className="logo-subtext">AI Career Accelerator</span>
          </div>
        )}
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${item.path === '/interview' ? 'premium-nav-item' : ''} ${isActive ? 'active' : ''}`
              }
              title={!isExpanded ? item.label : undefined}
            >
              <Icon className="nav-icon" size={20} />
              {isExpanded && (
                <>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {isExpanded ? (
          <div className="xp-badge flex-center">
            <span className="text-gradient">⭐ 1,450 XP (Level 4)</span>
          </div>
        ) : (
          <div className="xp-badge-mini flex-center" title="1,450 XP (Level 4)">
            ⭐
          </div>
        )}
        
        <button 
          className="sidebar-toggle-btn" 
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  );
}
