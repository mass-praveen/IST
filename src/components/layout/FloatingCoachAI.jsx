import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Bot, X, Send, Sparkles, User, RefreshCw, MessageSquare, 
  Zap, HelpCircle, ChevronDown, Minimize2
} from 'lucide-react';
import { endpoints } from '../../utils/api';
import './FloatingCoachAI.css';

export default function FloatingCoachAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'coach',
      message: "Hi there! I'm Coach AI. I'm here across the entire platform to help you with interview answers, coding logic, resume tips, and strategy. How can I help you right now?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isSending, isOpen]);

  // Contextual quick prompts based on active page
  const getContextualPrompts = () => {
    const path = location.pathname;
    if (path.includes('interview')) {
      return [
        "Give me a formula for answering behavioral questions",
        "How do I explain technical architectural trade-offs?",
        "What are common filler words to avoid?"
      ];
    }
    if (path.includes('coding')) {
      return [
        "How do I choose between Map vs Set for O(1) lookups?",
        "Explain the Sliding Window technique",
        "How to optimize O(N^2) to O(N) complexity?"
      ];
    }
    if (path.includes('resume')) {
      return [
        "What are top ATS action verbs for software engineering?",
        "How should I format my project achievements?",
        "Which skills are currently most in-demand?"
      ];
    }
    if (path.includes('mcq')) {
      return [
        "Tips for eliminating wrong MCQ options quickly",
        "Explain React useEffect dependency array rules"
      ];
    }
    return [
      "What is my recommended next practice step today?",
      "Give me a 7-day technical interview study sprint",
      "How is my overall interview readiness calculated?"
    ];
  };

  const handleSendMessage = async (textOverride = null) => {
    const textToSend = textOverride || inputMessage;
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
          pageContext: `User is currently on ${location.pathname} page`
        })
      });

      if (!res.ok) throw new Error('Coach AI is offline');
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'coach', message: data.message }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        sender: 'coach', 
        message: 'I am temporarily having trouble reaching the model. Please ensure the backend is running.' 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="floating-coach-wrapper">
      {/* Floating Trigger Bubble */}
      {!isOpen ? (
        <button 
          className="coach-floating-trigger glass-panel-premium flex-center"
          onClick={() => setIsOpen(true)}
          title="Open Coach AI Assistant"
        >
          <div className="coach-trigger-glow"></div>
          <Bot size={26} className="text-white" />
          <span className="coach-trigger-label">Coach AI</span>
          <span className="online-indicator-dot"></span>
        </button>
      ) : (
        /* Floating Chat Window */
        <div className="coach-floating-window glass-panel-premium animate-scale-up">
          {/* Header */}
          <div className="floating-chat-header space-between">
            <div className="flex-center" style={{gap: '0.6rem'}}>
              <div className="floating-coach-avatar flex-center">
                <Bot size={20} className="text-gradient" />
              </div>
              <div>
                <h4 className="floating-coach-title">Coach AI</h4>
                <span className="floating-coach-sub">Your Real-Time Mentor</span>
              </div>
            </div>

            <div className="flex-center" style={{gap: '0.4rem'}}>
              <button className="floating-icon-btn" onClick={() => setIsOpen(false)} title="Minimize">
                <Minimize2 size={16} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="floating-messages-box">
            {messages.map((m, idx) => (
              <div key={idx} className={`floating-msg-row ${m.sender === 'user' ? 'user-msg' : 'coach-msg'}`}>
                {m.sender === 'coach' && (
                  <div className="msg-mini-avatar flex-center">
                    <Bot size={14} className="text-gradient" />
                  </div>
                )}
                <div className="msg-mini-bubble" style={{whiteSpace: 'pre-line'}}>
                  {m.message}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="floating-msg-row coach-msg animate-fade-in">
                <div className="msg-mini-avatar flex-center">
                  <Bot size={14} className="text-gradient" />
                </div>
                <div className="msg-mini-bubble text-secondary flex-center" style={{fontStyle: 'italic', gap: '0.4rem'}}>
                  <RefreshCw size={12} className="spin" /> Coach AI is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Contextual Quick Prompts */}
          <div className="floating-quick-prompts">
            {getContextualPrompts().map((qp, i) => (
              <button key={i} className="mini-prompt-chip" onClick={() => handleSendMessage(qp)}>
                <Zap size={11} className="text-accent" /> {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="floating-chat-input-bar">
            <input 
              type="text"
              className="mini-chat-input"
              placeholder="Ask Coach AI anything..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              className="btn btn-primary premium-btn mini-send-btn flex-center"
              onClick={() => handleSendMessage()}
              disabled={isSending || !inputMessage.trim()}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
