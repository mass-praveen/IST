import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  Bot, ShieldCheck, Zap, BrainCircuit, Code2, 
  FileText, ListTodo, LineChart, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="landing-root">
      {/* LANDING NAVBAR */}
      <nav className="landing-nav glass-panel-premium">
        <div className="landing-brand">
          <div className="brand-logo-icon text-gradient">IST</div>
          <span className="brand-text">AI Interview Trainer</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
        </div>
        <div className="landing-nav-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary premium-btn">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/login" className="btn btn-primary premium-btn">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg-glow"></div>
        <div className="hero-bg-grid"></div>
        
        <motion.div 
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="hero-badge">
            <SparkleIcon /> Next-Gen AI Platform
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="hero-title">
            Your Personal AI<br/>
            <span className="text-gradient">Video Interviewer.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="hero-subtitle">
            Face realistic AI interviewers, practice face-to-face, and get deep technical and behavioral feedback tailored to your exact resume.
          </motion.p>
          
          <motion.div variants={itemVariants} className="hero-ctas">
            <Link to={isAuthenticated ? "/dashboard" : "/login"} className="btn btn-primary premium-btn hero-btn" style={{ boxShadow: '0 0 20px var(--accent-glow)' }}>
              {isAuthenticated ? 'Launch Interview Now' : 'Start Video Interview'} <ChevronRight size={18} />
            </Link>
            <a href="#features" className="btn btn-secondary premium-btn-outline hero-btn">
              Explore Features
            </a>
          </motion.div>
        </motion.div>

        {/* Floating UI Elements */}
        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="mock-video-ui glass-panel-premium premium-border" style={{
            position: 'relative', width: '100%', height: '320px', borderRadius: '24px', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', padding: '1rem', background: '#0b0f19', border: '1px solid var(--accent-primary)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            {/* Split Screen Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', flex: 1 }}>
              {/* AI Avatar Pane */}
              <div style={{ background: '#111827', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: '10px', left: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>Sarah (AI Hiring Manager)</span>
                </div>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, #312e81 0%, #0f172a 100%)', border: '2px solid var(--accent-primary)', boxShadow: '0 0 30px var(--accent-glow)' }}></div>
              </div>
              {/* User Camera Pane */}
              <div style={{ background: '#1e293b', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: '10px', left: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#f43f5e', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>You</span>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <h2>50K+</h2>
            <p>Interviews Simulated</p>
          </div>
          <div className="stat-item">
            <h2>98%</h2>
            <p>Candidate Confidence</p>
          </div>
          <div className="stat-item">
            <h2>200+</h2>
            <p>Coding Challenges</p>
          </div>
          <div className="stat-item">
            <h2>24/7</h2>
            <p>AI Availability</p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="features-section">
        <div className="section-header text-center">
          <h2 className="section-title">Everything you need to <span className="text-gradient">succeed</span></h2>
          <p className="section-subtitle">A complete suite of tools designed to accelerate your career.</p>
        </div>

        <div className="features-grid">
          <FeatureCard 
            icon={<Bot size={24} />} 
            title="AI Mock Interviews" 
            desc="Face realistic AI interviewers that adapt to your resume and desired role in real-time."
          />
          <FeatureCard 
            icon={<Zap size={24} />} 
            title="Instant Evaluation" 
            desc="Get comprehensive feedback on communication, technical accuracy, and body language."
          />
          <FeatureCard 
            icon={<Code2 size={24} />} 
            title="Coding Arena" 
            desc="Solve algorithmic problems in our fully equipped editor with AI hints and test case validation."
          />
          <FeatureCard 
            icon={<ListTodo size={24} />} 
            title="MCQ Assessments" 
            desc="Test your core knowledge with adaptive multiple-choice quizzes across various tech stacks."
          />
          <FeatureCard 
            icon={<FileText size={24} />} 
            title="Smart Resume Analysis" 
            desc="Upload your ATS resume for instant scoring and tailored improvement suggestions."
          />
          <FeatureCard 
            icon={<LineChart size={24} />} 
            title="Performance Dashboard" 
            desc="Track your daily streak, skills matrix, and overall readiness over time."
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="hiw-container glass-panel-premium premium-border">
          <div className="hiw-text">
            <h2>How It Works</h2>
            <p>Four simple steps to land your dream job.</p>
            
            <ul className="hiw-steps">
              <li>
                <div className="step-num text-gradient">01</div>
                <div>
                  <h4>Upload Resume & Role</h4>
                  <p>Tell our AI what you're aiming for.</p>
                </div>
              </li>
              <li>
                <div className="step-num text-gradient">02</div>
                <div>
                  <h4>Take a Mock Interview</h4>
                  <p>Engage in a realistic video or technical session.</p>
                </div>
              </li>
              <li>
                <div className="step-num text-gradient">03</div>
                <div>
                  <h4>Receive Deep Analysis</h4>
                  <p>Review your scores, strengths, and weak points.</p>
                </div>
              </li>
              <li>
                <div className="step-num text-gradient">04</div>
                <div>
                  <h4>Iterate & Improve</h4>
                  <p>Practice daily with tailored questions to boost readiness.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="hiw-visual">
            <div className="mock-ui-card">
              <div className="mock-ui-header">
                <div className="mock-dot red"></div><div className="mock-dot yellow"></div><div className="mock-dot green"></div>
              </div>
              <div className="mock-ui-body">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
                <div className="skeleton-chart"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-box">
          <h2>Ready to ace your next interview?</h2>
          <p>Join thousands of candidates who practice smarter.</p>
          <Link to="/login" className="btn btn-primary premium-btn hero-btn mt-4">
            Get Started for Free <ChevronRight size={18} />
          </Link>
        </div>
      </section>
      
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="brand-logo-icon text-gradient">IST</div>
          <p>© 2026 AI Interview Trainer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div 
      className="feature-card glass-panel-premium premium-border"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="fc-icon-wrapper">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </motion.div>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
      <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z"></path>
    </svg>
  );
}
