import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Sparkles, UserCircle, Search, LogIn, Menu,
  LayoutDashboard, FileText, ListTodo, Video, Code2, Flame, Bot, LineChart, User, X, Check, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { endpoints } from '../../utils/api';
import HealthCheck from './HealthCheck';
import ThemeSelector from '../common/ThemeSelector';
import Profile from '../../pages/Profile';
import './Navbar.css';

const navItems = [
  { path: '/resume', label: 'Resume Analyzer', icon: FileText },
  { path: '/mcq', label: 'MCQ Practice', icon: ListTodo },
  { path: '/interview', label: 'AI Video Interview', icon: Video },
  { path: '/coding', label: 'Coding Area', icon: Code2 },
  { path: '/daily', label: 'Daily Practice', icon: Flame },
  { path: '/coach', label: 'AI Coach', icon: Bot },
  { path: '/progress', label: 'Progress & Report', icon: LineChart },
  { path: '/history', label: 'Activity History', icon: FileText },
  { path: '/profile', label: 'My Profile', icon: User },
];

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Notification State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const notifRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingNotifs(true);
      const res = await fetch(endpoints.notifications, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ist_token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingNotifs(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };

    fetchNotifications();
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id, link) => {
    try {
      await fetch(endpoints.notificationRead(id), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ist_token')}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      setIsNotifOpen(false);
      if (link) navigate(link);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await fetch(endpoints.notificationsReadAll, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ist_token')}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const allSearchItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...navItems
  ];

  const filteredSearch = allSearchItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSelect = (path) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  return (
    <>
      <header className="site-header glass-panel-premium">
        {/* Top Bar: Brand, Search, Health, Theme Switcher & User Info */}
        <div className="header-top-row space-between">
          
          {/* Brand Logo */}
          <Link to="/dashboard" className="brand-logo-link">
            <div className="brand-logo-icon text-gradient">IST</div>
            <div className="brand-text-block">
              <h1 className="brand-title">Interview Skill Trainer</h1>
              <span className="brand-subtitle">AI Career Accelerator</span>
            </div>
          </Link>

          {/* Global Search Bar */}
          <div className="header-search-bar" ref={searchRef}>
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search questions or topics..." 
              className="search-input-field" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
            />
            
            {/* Search Dropdown */}
            <AnimatePresence>
              {isSearchOpen && searchQuery.trim().length > 0 && (
                <motion.div 
                  className="search-dropdown-menu glass-panel-premium"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                >
                  {filteredSearch.length > 0 ? (
                    filteredSearch.map((item, idx) => (
                      <button 
                        key={idx} 
                        className="search-dropdown-item"
                        onClick={() => handleSearchSelect(item.path)}
                      >
                        <item.icon size={15} className="text-accent" /> {item.label}
                      </button>
                    ))
                  ) : (
                    <div className="search-empty text-muted">No matching pages found.</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Header Right Actions */}
          <div className="header-actions-group flex-center">
            <Link to="/interview" className="btn btn-primary premium-btn" style={{marginRight: '0.5rem', padding: '0.4rem 1rem', fontSize: '0.85rem'}}>
              Start Interview
            </Link>
            <ThemeSelector />
            <HealthCheck />
            
            <div className="notif-container" ref={notifRef}>
              <button 
                className={`btn btn-ghost icon-btn nav-notification-btn ${isNotifOpen ? 'active' : ''}`}
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (!isNotifOpen) fetchNotifications();
                }}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div 
                    className="notif-dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <div className="notif-dropdown-header space-between">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && (
                        <button className="btn-ghost-text" onClick={handleMarkAllRead}>
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="notif-dropdown-body">
                      {isLoadingNotifs ? (
                        <div className="notif-loading">
                          <div className="skel-item"></div>
                          <div className="skel-item"></div>
                          <div className="skel-item"></div>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="notif-empty">
                          <Bell size={28} />
                          <p>You're all caught up!</p>
                          <span>No new notifications.</span>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <div 
                            key={n.id} 
                            className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                            onClick={() => handleMarkAsRead(n.id, n.link)}
                          >
                            <div className="notif-content">
                              <h4>{n.title}</h4>
                              <p>{n.message}</p>
                              <span className="notif-time">{new Date(n.created_at).toLocaleString()}</span>
                            </div>
                            {!n.is_read && <div className="unread-dot" />}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="notif-dropdown-footer">
                      <Link 
                        to="/notifications" 
                        className="btn-ghost-text w-full flex-center"
                        onClick={() => setIsNotifOpen(false)}
                      >
                        View All Notifications <ChevronRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="xp-pill flex-center">
              <Sparkles size={14} className="text-accent" />
              <span>⭐ 1,450 XP</span>
            </div>

            {user ? (
              <button onClick={() => setIsProfileOpen(true)} className="user-profile-chip flex-center btn-ghost" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <div className="user-avatar-circle text-gradient">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="user-info-text" style={{ textAlign: 'left' }}>
                  <span className="user-full-name">{user.name || 'Guest'}</span>
                  <span className="user-role-title">{user.role || 'Full Stack Dev'}</span>
                </div>
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary premium-btn login-nav-btn flex-center">
                <LogIn size={16} /> Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Navigation Pills Bar */}
        <nav className="header-nav-bar">
          <div className="nav-pills-scroll-container">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path === '/profile' ? '#' : item.path}
                  onClick={(e) => {
                    if (item.path === '/profile') {
                      e.preventDefault();
                      setIsProfileOpen(true);
                    }
                  }}
                  className={({ isActive }) => 
                    `nav-pill-item ${isActive || (item.path === '/profile' && isProfileOpen) ? 'active' : ''}`
                  }
                >
                  <Icon className="pill-icon" size={17} />
                  <span>{item.label}</span>
                  {item.badge && <span className="pill-badge">{item.badge}</span>}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Profile Side Drawer */}
      <div className={`profile-side-drawer ${isProfileOpen ? 'open' : ''}`}>
        <div className="drawer-close-bar space-between">
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Candidate Profile</h2>
          <button className="btn btn-ghost icon-btn" onClick={() => setIsProfileOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="drawer-scroll-content">
          <Profile />
        </div>
      </div>
      
      {isProfileOpen && (
        <div 
          className="drawer-backdrop" 
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
}
