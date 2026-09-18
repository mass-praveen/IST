import { Bell, Search, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import HealthCheck from './HealthCheck';
import './Topbar.css';

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="topbar glass-panel-premium">
      <div className="search-bar">
        <Search className="search-icon" size={18} />
        <input type="text" placeholder="Search questions, skills, or history..." className="search-input" />
      </div>
      
      <div className="topbar-actions">
        <HealthCheck />
        <button className="btn-ghost icon-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <div className="user-profile-trigger">
          <UserCircle size={32} className="text-gradient" />
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role || 'Software Engineer'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
