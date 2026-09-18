import { useState, useEffect } from 'react';
import { endpoints } from '../utils/api';
import { Bell, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import './Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All'); // All, Unread, INTERVIEW, CODING, MCQ

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(endpoints.notifications, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ist_token')}` }
      });
      if (!res.ok) throw new Error('Unable to load notifications.');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await fetch(endpoints.notificationRead(id), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ist_token')}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.is_read;
    return n.type === filter;
  });

  return (
    <div className="notifications-page">
      <div className="page-header space-between">
        <h2>Notifications</h2>
      </div>

      <div className="notif-filters">
        {['All', 'Unread', 'INTERVIEW', 'CODING', 'RESUME', 'MCQ'].map(f => (
          <button 
            key={f} 
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'INTERVIEW' ? 'Interviews' : f === 'CODING' ? 'Coding' : f === 'RESUME' ? 'Resume' : f}
          </button>
        ))}
      </div>

      <div className="notif-list glass-panel-premium">
        {isLoading ? (
          <div className="notif-state-message">Loading notifications...</div>
        ) : error ? (
          <div className="notif-state-message error">
            <p>{error}</p>
            <button className="btn btn-primary premium-btn" onClick={fetchNotifications}>Try Again</button>
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="notif-state-message empty">
            <Bell size={40} className="text-muted" />
            <p>You're all caught up!</p>
            <span>No notifications found for this filter.</span>
          </div>
        ) : (
          filteredNotifs.map(n => (
            <div 
              key={n.id} 
              className={`notif-list-item ${!n.is_read ? 'unread' : ''}`}
              onClick={() => handleMarkAsRead(n.id)}
            >
              <div className="notif-icon">
                {n.type === 'INTERVIEW' ? <CheckCircle2 size={20} className="text-success" /> :
                 n.type === 'CODING' ? <CheckCircle2 size={20} className="text-accent" /> :
                 <Bell size={20} className="text-muted" />}
              </div>
              <div className="notif-content-full">
                <h4>{n.title}</h4>
                <p>{n.message}</p>
                <span className="time">{new Date(n.created_at).toLocaleString()}</span>
              </div>
              {!n.is_read && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
