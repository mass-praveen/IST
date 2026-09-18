import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { endpoints } from '../../utils/api';
import './HealthCheck.css';

export default function HealthCheck() {
  const [status, setStatus] = useState('checking'); // 'checking', 'connected', 'offline'

  const checkHealth = async () => {
    setStatus('checking');
    try {
      const res = await fetch(endpoints.health);
      if (res.ok) {
        setStatus('connected');
      } else {
        setStatus('offline');
      }
    } catch (err) {
      setStatus('offline');
    }
  };

  useEffect(() => {
    checkHealth();
    // Optional: set up interval to check periodically
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'checking') {
    return (
      <div className="health-badge checking">
        <RefreshCw size={14} className="spin" />
        Checking...
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="health-badge connected">
        <CheckCircle2 size={14} />
        Backend Connected
      </div>
    );
  }

  return (
    <div className="health-badge offline">
      <XCircle size={14} />
      Backend Offline
      <button className="health-retry-btn" onClick={checkHealth}>
        Retry
      </button>
    </div>
  );
}
