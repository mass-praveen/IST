import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bot, Lock, Mail, User, Briefcase, ArrowRight, 
  Sparkles, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      let res;
      if (isSignUp) {
        res = await signup({ name, email, password, role });
      } else {
        res = await login(email, password);
      }

      if (res.success) {
        navigate('/dashboard');
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('candidate@ist.ai');
    setPassword('password123');
    setLoading(true);
    setErrorMsg(null);
    const res = await login('candidate@ist.ai', 'password123');
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error || 'Demo login failed.');
    }
    setLoading(false);
  };

  return (
    <div className="login-viewport-wrapper flex-center animate-fade-in">
      <div className="login-card glass-panel-premium animate-scale-up">
        {/* Brand Header */}
        <div className="login-header-block text-center">
          <div className="brand-badge-icon text-gradient">IST</div>
          <h2>{isSignUp ? 'Create your Account' : 'Welcome to IST'}</h2>
          <p className="text-secondary text-sm">
            {isSignUp 
              ? 'Join the AI-powered interview preparation platform' 
              : 'Sign in to access your mock interviews & analytics'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tab-pill-group">
          <button 
            type="button"
            className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(true); setErrorMsg(null); }}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="auth-error-banner flex-center animate-shake">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form-fields">
          {isSignUp && (
            <>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div className="input-icon-wrap">
                  <User size={18} className="field-icon" />
                  <input 
                    type="text" 
                    className="input-field with-icon" 
                    placeholder="e.g. Alex Morgan"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Target Role</label>
                <div className="input-icon-wrap">
                  <Briefcase size={18} className="field-icon" />
                  <select 
                    className="input-field with-icon" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option>Full Stack Developer</option>
                    <option>Frontend Engineer</option>
                    <option>Backend Developer</option>
                    <option>AI / Data Science Engineer</option>
                    <option>DevOps / Cloud Architect</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-icon-wrap">
              <Mail size={18} className="field-icon" />
              <input 
                type="email" 
                className="input-field with-icon" 
                placeholder="name@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-icon-wrap">
              <Lock size={18} className="field-icon" />
              <input 
                type="password" 
                className="input-field with-icon" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary premium-btn auth-submit-btn flex-center"
            disabled={loading}
          >
            {loading ? (
              <> <RefreshCw size={18} className="spin" /> Authenticating... </>
            ) : (
              <> {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={18} /> </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Option */}
        <div className="demo-login-divider">
          <span>OR QUICK ACCESS</span>
        </div>

        <button 
          type="button" 
          className="btn btn-secondary demo-quick-btn flex-center"
          onClick={handleDemoLogin}
          disabled={loading}
        >
          <Sparkles size={16} className="text-accent" /> 1-Click Demo Login (Candidate)
        </button>
      </div>
    </div>
  );
}
