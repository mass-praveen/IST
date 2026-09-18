import { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, User, RefreshCw, MessageSquare, 
  HelpCircle, Zap, Compass, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { endpoints } from '../utils/api';
import './AICareerCoach.css';

export default function AICareerCoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'coach',
      message: `Hello ${user?.name || 'there'}! I am Coach AI, your dedicated AI Interview Mentor and Career Guide. I have analyzed your resume, past interview ratings, and MCQ accuracy. How can I assist you with your preparation today?`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Load chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(endpoints.coachHistory(1));
        if (res.ok) {
          const history = await res.json();
          if (history.length > 0) {
            setMessages(history);
          }
        }
      } catch (err) {
        console.warn('Could not load chat history:', err);
      }
    };
    fetchHistory();
  }, []);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', message: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await fetch(endpoints.coachChat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: 1, 
          message: textToSend,
          pageContext: 'AI Career Coach Dedicated Screen'
        })
      });

      if (!res.ok) throw new Error('Coach AI is temporarily offline');
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'coach', message: data.message }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        sender: 'coach', 
        message: 'I am temporarily having trouble connecting to the AI model. Please ensure the backend and Gemini API key are active.' 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    "Give me a 7-day technical interview preparation plan.",
    "Which missing skills should I focus on improving first?",
    "Why did I lose points on the STAR method in my mock interview?",
    "Am I ready for a Senior Full Stack Developer interview?"
  ];

  return (
    <div className="career-coach-container animate-fade-in">
      {/* Coach Header */}
      <div className="coach-header-card glass-panel-premium space-between">
        <div className="flex-center" style={{gap: '1rem'}}>
          <div className="coach-avatar-badge">
            <Bot size={28} className="text-gradient" />
          </div>
          <div>
            <h2>Coach AI <span className="coach-role-pill">Dedicated Mentor</span></h2>
            <p className="text-secondary text-sm">Personalized advice based on your verified resume, weak areas, and interview performance</p>
          </div>
        </div>

        <div className="context-indicator flex-center" style={{gap: '0.4rem'}}>
          <Compass size={16} className="text-success" />
          <span className="text-success text-sm">Candidate Context Synced</span>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="coach-chat-window glass-panel-premium">
        <div className="messages-stream">
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-bubble-row ${m.sender === 'user' ? 'user-row' : 'coach-row'}`}>
              <div className="bubble-avatar">
                {m.sender === 'user' ? <User size={18} /> : <Bot size={18} className="text-gradient" />}
              </div>
              <div className="bubble-content glass-panel-premium">
                <div className="bubble-sender">{m.sender === 'user' ? 'You' : 'Coach AI'}</div>
                <div className="bubble-text" style={{whiteSpace: 'pre-line'}}>{m.message}</div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="chat-bubble-row coach-row animate-fade-in">
              <div className="bubble-avatar">
                <Bot size={18} className="text-gradient" />
              </div>
              <div className="bubble-content glass-panel-premium" style={{fontStyle: 'italic', color: 'var(--text-secondary)'}}>
                <RefreshCw size={14} className="spin" style={{marginRight: '0.5rem'}} /> Coach AI is analyzing your performance...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="quick-prompts-bar">
          {quickPrompts.map((qp, i) => (
            <button key={i} className="quick-prompt-chip" onClick={() => handleSendMessage(qp)}>
              <Zap size={12} className="text-accent" /> {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="chat-input-row">
          <input 
            type="text"
            className="chat-text-input"
            placeholder="Ask Coach AI about your interview readiness, weaknesses, or prep strategy..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            className="btn btn-primary premium-btn send-msg-btn flex-center"
            onClick={() => handleSendMessage()}
            disabled={isSending || !inputMessage.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
