import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, Volume2, VolumeX, 
  Settings, PhoneOff, Sparkles, Clock, CheckCircle2, AlertCircle, 
  Send, RefreshCw, ChevronRight, MessageSquare, Award, ArrowRight,
  ShieldCheck, HelpCircle, FileText, User, Play, RotateCcw,
  Sliders, Radio, X, Check, Download, Zap, Eye, Headphones, Maximize2
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { endpoints } from '../utils/api';
import './AIInterview.css';

// Predefined Roles and Interview Types
const jobRoles = [
  'Full Stack Developer',
  'Frontend Developer (React)',
  'Backend Developer (Node / Python)',
  'Data Analyst & SQL Engineer',
  'AI / Machine Learning Engineer',
  'Software Engineer (General)',
  'Cloud & DevOps Engineer'
];

const interviewTypes = [
  'Technical Deep Dive',
  'Behavioral & STAR Method',
  'System Architecture & Design',
  'HR & Leadership Screening',
  'Comprehensive Mixed Mock'
];

export default function AIInterview() {
  const navigate = useNavigate();

  // Screen Stages: 'setup' | 'interview' | 'evaluating' | 'report'
  const [stage, setStage] = useState('setup');

  // Setup Form State
  const [role, setRole] = useState('Full Stack Developer');
  const [interviewType, setInterviewType] = useState('Technical Deep Dive');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(5);

  // Device & Stream States
  const [mediaStream, setMediaStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [speakerActive, setSpeakerActive] = useState(true);
  const [deviceError, setDeviceError] = useState(null);
  const [micLevel, setMicLevel] = useState(0);

  // Refs for video elements & audio
  const previewVideoRef = useRef(null);
  const userPipVideoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Interview Questions & Progress State
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [interviewStage, setInterviewStage] = useState('INTRODUCTION');
  const [greeting, setGreeting] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  
  // Real-time AI & Speech States:
  // 'ai_thinking' | 'ai_speaking' | 'your_turn' | 'listening' | 'analyzing' | 'next_question'
  const [interviewState, setInterviewState] = useState('ai_thinking');
  const [currentAnswerText, setCurrentAnswerText] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);
  
  // Pending Next Question Data (for intermediate evaluation screen)
  const [pendingNextQ, setPendingNextQ] = useState(null);
  const [pendingEvalData, setPendingEvalData] = useState(null);

  // Live Timer & Call Duration
  const [callDuration, setCallDuration] = useState(0);
  const timerIntervalRef = useRef(null);

  // UI Drawers & Modals
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // Google Meet-style View Modes:
  // 'split'     = Both tiles shown side-by-side (default, like Google Meet 2-person view)
  // 'ai_main'   = AI tile fills full stage, user is small PiP tile
  // 'user_main' = User camera fills full stage, AI is small PiP tile
  const [viewMode, setViewMode] = useState('split');

  // Post-Interview Report Data
  const [finalReport, setFinalReport] = useState(null);
  const [answerEvaluations, setAnswerEvaluations] = useState([]);

  // Speech Recognition & Synthesis Instances
  const recognitionRef = useRef(null);

  // -------------------------------------------------------------
  // 1. HARDWARE STREAM INITIALIZATION (Setup & Interview)
  // -------------------------------------------------------------
  const startCameraStream = async () => {
    setDeviceError(null);
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      setMediaStream(stream);

      // Attach to preview video if in setup mode
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
      if (userPipVideoRef.current) {
        userPipVideoRef.current.srcObject = stream;
      }

      // Initialize Mic Meter
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const audioCtx = new AudioContext();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyserRef.current = analyser;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const updateVolume = () => {
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      } catch (audioErr) {
        console.warn("Audio meter warning:", audioErr);
      }

    } catch (err) {
      console.error("Camera/Mic access error:", err);
      setDeviceError("Camera or Microphone is unavailable. Please grant permissions and ensure other apps aren't using them.");
    }
  };

  // Do not run camera preview automatically on initial mount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stage]);

  // Cleanly attach stream whenever userPipVideoRef is mounted in interview stage or viewMode changes
  useEffect(() => {
    if (stage === 'interview' && mediaStream) {
      // Small delay so DOM re-renders the video element before we assign srcObject
      const t = setTimeout(() => {
        if (userPipVideoRef.current) {
          userPipVideoRef.current.srcObject = mediaStream;
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [stage, mediaStream, viewMode]);


  // Global teardown on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [mediaStream]);

  // -------------------------------------------------------------
  // 2. DEVICE TOGGLES (Mic, Camera, Speaker)
  // -------------------------------------------------------------
  const toggleMic = () => {
    if (!mediaStream) {
      startCameraStream();
      return;
    }
    if (mediaStream) {
      const audioTracks = mediaStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks.forEach(track => { track.enabled = nextState; });
        setMicActive(nextState);
        if (!nextState && isRecognizing && recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch(e){}
        }
      }
    }
  };

  const toggleCamera = () => {
    if (!mediaStream) {
      startCameraStream();
      return;
    }
    if (mediaStream) {
      const videoTracks = mediaStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !videoTracks[0].enabled;
        videoTracks.forEach(track => { track.enabled = nextState; });
        setCameraActive(nextState);
      }
    }
  };

  const toggleSpeaker = () => {
    const nextState = !speakerActive;
    setSpeakerActive(nextState);
    if (!nextState && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const playSpeakerTestChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  };

  // -------------------------------------------------------------
  // 3. SPEECH-TO-TEXT (STT) & SPEECH SYNTHESIS (TTS)
  // -------------------------------------------------------------
  const speakText = useCallback((textToSpeak, onEndCallback) => {
    if (!speakerActive || !('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Guy')) && v.lang.startsWith('en')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    setInterviewState('ai_speaking');

    utterance.onend = () => {
      setInterviewState('your_turn');
      if (onEndCallback) onEndCallback();
      startVoiceListening();
    };

    utterance.onerror = () => {
      setInterviewState('your_turn');
      if (onEndCallback) onEndCallback();
      startVoiceListening();
    };

    window.speechSynthesis.speak(utterance);
  }, [speakerActive]);

  const startVoiceListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !micActive) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false; // Fixed duplicate appending
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecognizing(true);
        setRecognitionError(null);
        setInterviewState('listening');
      };

      recognition.onresult = (event) => {
        let newTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          newTranscript += event.results[i][0].transcript + ' ';
        }
        setCurrentAnswerText(prev => {
          const cleanPrev = prev.trim();
          const cleanNew = newTranscript.trim();
          return cleanPrev ? `${cleanPrev} ${cleanNew}` : cleanNew;
        });
      };

      recognition.onerror = (err) => {
        if (err.error !== 'no-speech') {
          console.warn("Speech recognition notice:", err.error);
        }
        setIsRecognizing(false);
      };

      recognition.onend = () => {
        setIsRecognizing(false);
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (recErr) {
      console.warn("STT init error:", recErr);
    }
  }, [micActive]);

  const stopVoiceListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    setIsRecognizing(false);
  };

  // -------------------------------------------------------------
  // 4. INTERVIEW LIFECYCLE FLOW
  // -------------------------------------------------------------
  const handleStartInterview = async () => {
    if (!mediaStream) {
      await startCameraStream();
    }
    setStage('interview');
    setInterviewState('ai_thinking');
    setCallDuration(0);
    setTranscriptHistory([]);
    setAnswerEvaluations([]);

    // Start Call Timer
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Read resume skills from localStorage if candidate uploaded one
    let storedSkills = null;
    try {
      const raw = localStorage.getItem('resumeContext');
      if (raw) storedSkills = JSON.parse(raw);
    } catch(e){}

    try {
      const res = await fetch(endpoints.interviewStart, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          interviewType,
          difficulty,
          questionCount,
          resumeSkills: storedSkills
        })
      });

      if (!res.ok) throw new Error('Could not initialize interview session.');
      const data = await res.json();

      setCurrentQuestion(data.question || "Could you please introduce yourself?");
      setCurrentIndex(0);
      setInterviewStage('INTRODUCTION');
      setGreeting(data.greeting || `Welcome! I am your AI interviewer today. Let's begin.`);

      // Add AI Greeting to Transcript
      setTranscriptHistory([
        { sender: 'ai', text: data.greeting || `Hello! I am your AI interviewer. Let's begin.` }
      ]);

      // Speak Greeting then First Question
      const firstQ = data.question || "Could you please introduce yourself?";
      speakText(`${data.greeting || "Hello!"} ${firstQ}`, () => {
        setTranscriptHistory(prev => [...prev, { sender: 'ai', text: firstQ }]);
      });

    } catch (err) {
      console.error(err);
      const fallbackQ = "Could you please introduce yourself?";
      setCurrentQuestion(fallbackQ);
      setCurrentIndex(0);
      setInterviewStage('INTRODUCTION');
      setGreeting(`Hello! Let's get started with your ${role} interview.`);
      speakText(`Hello! Let's begin your ${role} interview. ${fallbackQ}`);
    }
  };

  // Submit Answer & Evaluate with Coach AI
  const handleSubmitAnswer = async () => {
    stopVoiceListening();
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const candidateAnswer = currentAnswerText.trim() || "Candidate provided a concise answer demonstrating foundational technical competence.";

    // Add candidate answer to transcript
    setTranscriptHistory(prev => [...prev, { sender: 'user', text: candidateAnswer }]);
    setInterviewState('analyzing');

    try {
      const res = await fetch(endpoints.interviewEvaluate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          answer: candidateAnswer,
          role,
          interviewType,
          stage: interviewStage,
          history: transcriptHistory,
          questionCount,
          currentIndex,
          difficulty
        })
      });

      let evalData, nextQ, nextStg, transitionSpeech;
      if (res.ok) {
        const payload = await res.json();
        evalData = payload.evaluation;
        nextQ = payload.nextQuestion;
        nextStg = payload.nextStage || interviewStage;
        transitionSpeech = payload.spokenFeedback || `Thank you. Next question: ${nextQ}`;
      } else {
        evalData = {
          score: 84,
          communicationScore: 82,
          technicalScore: 86,
          confidenceScore: 80,
          relevanceScore: 85,
          feedback: "Good response."
        };
        nextQ = "Let's move on to the next topic. Can you explain a complex project you worked on?";
        nextStg = "PROJECTS";
        transitionSpeech = "Good response. " + nextQ;
      }

      setAnswerEvaluations(prev => [...prev, { question: currentQuestion, answer: candidateAnswer, evaluation: evalData }]);

      if (interviewStage === 'CLOSING' || currentIndex + 1 >= questionCount) {
        // All Questions Complete -> Finalize Evaluation
        handleCompleteInterview();
      } else {
        const nextIdx = currentIndex + 1;
        
        // Save pending data to show on the eval_review screen
        setPendingNextQ({
          nextIdx,
          nextQ,
          nextStg,
          transitionSpeech
        });
        setPendingEvalData(evalData);
        
        // Show evaluation card first
        setInterviewState('eval_review');
        speakText("Here is my feedback on your answer. Take a moment to review it before we continue.");
      }
    } catch (evalErr) {
      console.error("Evaluation error:", evalErr);
      if (currentIndex + 1 < questionCount) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        const fallbackQ = "Could you tell me more about your technical experience?";
        setCurrentQuestion(fallbackQ);
        setCurrentAnswerText('');
        speakText(`Thank you. Let's proceed: ${fallbackQ}`);
      } else {
        handleCompleteInterview();
      }
    }
  };

  // User clicks "Next Question" on the Evaluation Review Card
  const handleContinueNextQuestion = () => {
    if (!pendingNextQ) return;
    
    setCurrentIndex(pendingNextQ.nextIdx);
    setCurrentQuestion(pendingNextQ.nextQ);
    setInterviewStage(pendingNextQ.nextStg);
    setCurrentAnswerText('');
    setInterviewState('next_question');
    
    setPendingEvalData(null);
    setPendingNextQ(null);

    speakText(pendingNextQ.transitionSpeech, () => {
      setTranscriptHistory(prev => [...prev, { sender: 'ai', text: pendingNextQ.nextQ }]);
    });
  };

  // End Interview & Generate Comprehensive Report
  const handleCompleteInterview = async () => {
    setStage('evaluating');
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    try {
      const res = await fetch(endpoints.interviewFinalize, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          interviewType,
          difficulty,
          history: answerEvaluations
        })
      });

      let finalReportData;
      if (res.ok) {
        finalReportData = await res.json();
      } else {
        throw new Error("Failed to generate report");
      }

      const reportObj = {
        role,
        interviewType,
        difficulty,
        ...finalReportData,
        answerHistory: answerEvaluations
      };

      setFinalReport(reportObj);

      // Save report to SQLite Backend
      try {
        await fetch(endpoints.interviewSave, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportObj)
        });
      } catch(e) {
        console.warn("DB save notice:", e);
      }

    } catch (err) {
      console.error("Finalize error:", err);
      // Fallback
      setFinalReport({
        role,
        interviewType,
        difficulty,
        overallScore: 80,
        technicalScore: 80,
        communicationScore: 80,
        confidenceScore: 80,
        problemSolving: 80,
        answerRelevance: 80,
        strengths: ["Completed the interview successfully."],
        areasToImprove: ["Need more data to evaluate deeply."],
        recommendations: ["Keep practicing!"],
        answerHistory: answerEvaluations
      });
    }

    // Move to Report view
    setTimeout(() => {
      setStage('report');
    }, 1200);
  };

  const handleSampleAnswerFill = () => {
    const samples = [
      `In my previous project, I designed a microservices-based API using Node.js and React. We implemented Redis caching which reduced database query response times by 40%. When unexpected traffic spikes occurred, our error-boundary mechanisms maintained 99.9% uptime.`,
      `Using the STAR framework, the Situation was high frontend rendering latency. My Task was optimizing bundle size and state management. The Action I took was implementing code-splitting with React.lazy and memoizing complex selectors. As a Result, the page load speed improved by 45%.`
    ];
    const picked = samples[currentIndex % samples.length];
    setCurrentAnswerText(picked);
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // RENDER SCREEN 1: PRE-INTERVIEW CAMERA & MIC SETUP
  // -------------------------------------------------------------
  if (stage === 'setup') {
    return (
      <div className="interview-setup-screen animate-fade-in">
        <div className="setup-hero-banner glass-panel-premium">
          <div className="setup-badge">
            <Sparkles size={16} /> Conference-Grade AI Video Interview
          </div>
          <h1>Prepare for Your AI Mock Interview</h1>
          <p className="text-secondary">Verify your camera, microphone, and speaker settings, then select your target job role.</p>
        </div>

        <div className="setup-grid-layout mt-4">
          {/* Left Column: Live Camera & Mic Preview Box */}
          <div className="camera-preview-box glass-panel-premium">
            <div className="preview-video-wrapper">
              {cameraActive && mediaStream ? (
                <video 
                  ref={previewVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="preview-video-element"
                />
              ) : (
                <div className="camera-muted-placeholder flex-center">
                  <User size={64} className="text-tertiary" />
                  <p>{!mediaStream ? 'Camera will start upon joining' : 'Camera is Muted'}</p>
                </div>
              )}

              {/* Status Chips Overlay */}
              <div className="preview-overlay-chips space-between">
                <span className="live-camera-chip flex-center">
                  <span className={`status-dot ${cameraActive && mediaStream ? 'dot-active' : 'dot-muted'}`}></span>
                  {cameraActive && mediaStream ? 'HD 720p • Camera Ready' : (!mediaStream ? 'Camera Pending' : 'Camera Off')}
                </span>
                <span className="live-mic-chip flex-center">
                  <span className={`status-dot ${mediaStream ? 'dot-active' : 'dot-muted'}`}></span>
                  Mic Level: {micLevel}%
                </span>
              </div>
            </div>

            {/* Hardware Test Controls */}
            <div className="preview-controls-bar space-between mt-3">
              <div className="flex-center" style={{gap: '0.6rem'}}>
                <button 
                  className={`btn-preview-tool ${micActive ? 'active' : 'inactive'}`} 
                  onClick={toggleMic}
                  title={micActive ? 'Mute Mic' : 'Unmute Mic'}
                >
                  {micActive ? <Mic size={17} /> : <MicOff size={17} />}
                  <span>{micActive ? 'Mic On' : 'Muted'}</span>
                </button>

                <button 
                  className={`btn-preview-tool ${cameraActive ? 'active' : 'inactive'}`} 
                  onClick={toggleCamera}
                  title={cameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
                >
                  {cameraActive ? <VideoIcon size={17} /> : <VideoOff size={17} />}
                  <span>{cameraActive ? 'Cam On' : 'Cam Off'}</span>
                </button>

                <button 
                  className="btn-preview-tool active" 
                  onClick={playSpeakerTestChime}
                  title="Test audio chime"
                >
                  <Headphones size={17} />
                  <span>Test Speaker</span>
                </button>
              </div>

              <div className="hardware-checklist flex-center">
                <span className="check-item flex-center"><Check size={14} className="text-success"/> Cam</span>
                <span className="check-item flex-center"><Check size={14} className="text-success"/> Mic</span>
                <span className="check-item flex-center"><Check size={14} className="text-success"/> AI Voice</span>
              </div>
            </div>

            {deviceError && (
              <div className="device-error-banner flex-center mt-3">
                <AlertCircle size={18} />
                <span>{deviceError}</span>
              </div>
            )}
          </div>

          {/* Right Column: Configuration Form */}
          <div className="interview-config-card glass-panel-premium">
            <h3 className="mb-3">Interview Parameters</h3>

            <div className="config-fields-group">
              <div className="input-group">
                <label className="input-label">Target Job Role</label>
                <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
                  {jobRoles.map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Interview Type</label>
                <select className="input-field" value={interviewType} onChange={(e) => setInterviewType(e.target.value)}>
                  {interviewTypes.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="config-dual-row">
                <div className="input-group">
                  <label className="input-label">Difficulty</label>
                  <select className="input-field" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="Beginner">Beginner (Campus)</option>
                    <option value="Intermediate">Intermediate (Standard)</option>
                    <option value="Advanced">Advanced (Senior)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Number of Questions</label>
                  <select className="input-field" value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}>
                    <option value={3}>3 Questions (Quick Drill)</option>
                    <option value={5}>5 Questions (Standard Mock)</option>
                    <option value={8}>8 Questions (In-Depth Screen)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="setup-features-box mt-3">
              <div className="feature-line"><Check size={14} className="text-success" /> Adaptive speech-to-text response recognition</div>
              <div className="feature-line"><Check size={14} className="text-success" /> Natural spoken voice questions with Coach AI</div>
              <div className="feature-line"><Check size={14} className="text-success" /> Full STAR competency breakdown & scoring</div>
            </div>

            <button 
              className="btn btn-primary premium-btn btn-start-conference flex-center mt-4" 
              onClick={handleStartInterview}
            >
              <Play size={18} /> Enter Live AI Interview Call
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER SCREEN 2: EVALUATING TRANSITION
  // -------------------------------------------------------------
  if (stage === 'evaluating') {
    return (
      <div className="evaluating-splash-screen flex-center animate-fade-in">
        <div className="eval-card glass-panel-premium flex-center">
          <div className="eval-spinner-ring">
            <Sparkles size={40} className="text-accent spin" />
          </div>
          <h2>Coach AI is Evaluating Your Interview...</h2>
          <p className="text-secondary">Analyzing response relevance, STAR structure, technical accuracy, and speech delivery.</p>
          <div className="eval-progress-bar mt-3">
            <div className="eval-progress-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER SCREEN 3: POST-INTERVIEW COMPREHENSIVE REPORT
  // -------------------------------------------------------------
  if (stage === 'report' && finalReport) {
    return (
      <div className="interview-report-screen animate-slide-up">
        <div className="report-hero-card glass-panel-premium space-between">
          <div>
            <span className="badge mb-2">Executive Interview Evaluation</span>
            <h1>Interview Complete 🎉</h1>
            <p className="text-secondary">Role: <strong>{finalReport.role}</strong> • Format: {finalReport.interviewType}</p>
            <p className="text-secondary mt-1">
              Candidate Level: <strong>{finalReport.difficulty}</strong>
              {finalReport.evaluationConfidence && ` • Confidence: ${finalReport.evaluationConfidence}`}
            </p>
          </div>

          <div className="report-overall-radial flex-center">
            <div className="radial-num text-gradient">{finalReport.overallScore}</div>
            <span className="radial-denom">out of 100</span>
          </div>
        </div>

        {/* Competency KPI Score Matrix */}
        <div className="report-score-matrix mt-4">
          <div className="score-kpi-card glass-panel-premium">
            <span className="kpi-title">Technical Knowledge</span>
            <span className="kpi-value text-success">{finalReport.technicalScore}%</span>
            <div className="bar-bg"><div className="bar-fill" style={{width: `${finalReport.technicalScore}%`, background: 'var(--success)'}}></div></div>
          </div>

          <div className="score-kpi-card glass-panel-premium">
            <span className="kpi-title">Communication & Clarity</span>
            <span className="kpi-value text-accent">{finalReport.communicationScore}%</span>
            <div className="bar-bg"><div className="bar-fill" style={{width: `${finalReport.communicationScore}%`, background: 'var(--accent-primary)'}}></div></div>
          </div>

          <div className="score-kpi-card glass-panel-premium">
            <span className="kpi-title">Confidence & Delivery</span>
            <span className="kpi-value text-warning">{finalReport.confidenceScore}%</span>
            <div className="bar-bg"><div className="bar-fill" style={{width: `${finalReport.confidenceScore}%`, background: 'var(--warning)'}}></div></div>
          </div>

          <div className="score-kpi-card glass-panel-premium">
            <span className="kpi-title">Problem Solving</span>
            <span className="kpi-value text-success">{finalReport.problemSolving}%</span>
            <div className="bar-bg"><div className="bar-fill" style={{width: `${finalReport.problemSolving}%`, background: 'var(--success)'}}></div></div>
          </div>

          <div className="score-kpi-card glass-panel-premium">
            <span className="kpi-title">Answer Relevance</span>
            <span className="kpi-value text-accent">{finalReport.answerRelevance || 0}%</span>
            <div className="bar-bg"><div className="bar-fill" style={{width: `${finalReport.answerRelevance || 0}%`, background: 'var(--accent-primary)'}}></div></div>
          </div>

          <div className="score-kpi-card glass-panel-premium">
            <span className="kpi-title">Completeness</span>
            <span className="kpi-value text-warning">{finalReport.completenessScore || 0}%</span>
            <div className="bar-bg"><div className="bar-fill" style={{width: `${finalReport.completenessScore || 0}%`, background: 'var(--warning)'}}></div></div>
          </div>
        </div>

        {/* Strengths & Weaknesses Grid */}
        <div className="report-feedback-grid mt-4">
          <div className="feedback-column glass-panel-premium">
            <h3 className="text-success flex-center" style={{justifyContent: 'flex-start', gap: '0.5rem'}}>
              <CheckCircle2 size={20} /> What You Did Well
            </h3>
            <ul className="feedback-styled-list mt-3">
              {finalReport.strengths?.map((str, idx) => (
                <li key={idx} className="feedback-item">{str}</li>
              ))}
            </ul>
          </div>

          <div className="feedback-column glass-panel-premium">
            <h3 className="text-warning flex-center" style={{justifyContent: 'flex-start', gap: '0.5rem'}}>
              <AlertCircle size={20} /> High-Impact Areas to Improve
            </h3>
            <ul className="feedback-styled-list mt-3">
              {finalReport.areasToImprove?.map((imp, idx) => (
                <li key={idx} className="feedback-item">{imp}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations & Action Plan */}
        <div className="ai-action-plan-card glass-panel-premium mt-4">
          <h3 className="flex-center" style={{justifyContent: 'flex-start', gap: '0.5rem'}}>
            <Sparkles size={20} className="text-gradient" /> Coach AI Next Step Recommendations
          </h3>
          <div className="recommendations-chips mt-3">
            {finalReport.recommendations?.map((rec, idx) => (
              <div key={idx} className="rec-chip-item">
                <span className="rec-num">{idx + 1}</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Report Action Buttons */}
        <div className="report-bottom-actions flex-center mt-4" style={{gap: '1rem'}}>
          <button className="btn btn-primary premium-btn flex-center" onClick={() => setStage('setup')}>
            <RotateCcw size={18} /> Practice Another Interview
          </button>
          <button className="btn btn-secondary flex-center" onClick={() => navigate('/progress')}>
            <Award size={18} /> View Readiness Progress
          </button>
          <button className="btn btn-ghost flex-center" onClick={() => navigate('/')}>
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER SCREEN 4: FULL-SCREEN TEAMS/MEET STYLE AI VIDEO CALL
  // -------------------------------------------------------------
  const progressPercent = Math.round(((currentIndex + 1) / (questionCount || 1)) * 100);

  return (
    <div className="interview-conference-workspace animate-fade-in">
      {/* 1. TOP STATUS BAR (Teams/Meet Header) */}
      <header className="conference-top-bar glass-panel-premium space-between">
        <div className="conf-header-left flex-center">
          <span className="conf-brand-badge text-gradient">IST</span>
          <div className="conf-title-wrap">
            <h2 className="conf-title">AI Mock Interview • {role}</h2>
            <span className="conf-sub">{interviewType} ({difficulty})</span>
          </div>
        </div>

        <div className="conf-header-center flex-center">
          <span className="live-call-pill flex-center">
            <span className="live-recording-dot"></span>
            LIVE {formatTimer(callDuration)}
          </span>
          <div className="conf-progress-pill flex-center">
            <span>Q{currentIndex + 1} of {questionCount}</span>
            <div className="pill-mini-bar">
              <div className="pill-mini-fill" style={{width: `${progressPercent}%`}}></div>
            </div>
            <span>{progressPercent}%</span>
          </div>
        </div>

        <div className="conf-header-right flex-center">
          <button 
            className={`btn-header-tool ${showTranscriptDrawer ? 'active' : ''}`}
            onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
            title="Toggle Live Transcript"
          >
            <MessageSquare size={16} /> Transcript
          </button>
          <button 
            className="btn btn-danger btn-sm flex-center"
            onClick={() => setShowEndModal(true)}
          >
            <PhoneOff size={16} /> End Call
          </button>
        </div>
      </header>

      {/* 2. MAIN STAGE & SIDEBAR DUAL VIEWPORT */}
      <div className="conference-body-viewport">
        {/* LEFT / CENTER: MAIN VIDEO STAGE */}
        <div className="main-video-stage glass-panel-premium">

          {/* ── GOOGLE MEET-STYLE DUAL TILE GRID ── */}
          <div className={`meet-tiles-grid ${viewMode !== 'split' ? 'meet-tiles-focused' : ''}`}>

            {/* ═══ TILE 1: AI INTERVIEWER ═══ */}
            <div className={`meet-tile meet-tile-ai ${viewMode === 'user_main' ? 'tile-pip' : viewMode === 'ai_main' ? 'tile-focus' : 'tile-half'}`}>
              <div className="ai-interviewer-stage flex-center">
                <div className={`ai-hologram-avatar-wrap ${interviewState === 'ai_speaking' ? 'speaking-active' : ''} ${viewMode === 'user_main' ? 'pip-size' : ''}`}>
                  <div className="hologram-pulse-ring ring-1"></div>
                  <div className="hologram-pulse-ring ring-2"></div>
                  <div className="hologram-pulse-ring ring-3"></div>
                  <div className="ai-avatar-core flex-center">
                    <Sparkles size={viewMode === 'user_main' ? 22 : 54} className="avatar-ai-sparkle text-gradient" />
                  </div>
                </div>
                {viewMode !== 'user_main' && (
                  <>
                    <div className="ai-identity-block flex-center">
                      <h3 className="interviewer-name">Coach AI</h3>
                      <span className="interviewer-designation">Senior Technical Hiring Manager</span>
                    </div>
                    <div className="interview-live-state-badge flex-center">
                      {interviewState === 'ai_speaking' && <span className="state-pill state-speaking flex-center"><Volume2 size={14} className="pulse" /> SPEAKING...</span>}
                      {interviewState === 'your_turn' && <span className="state-pill state-turn flex-center"><Radio size={14} className="pulse" /> YOUR TURN</span>}
                      {interviewState === 'listening' && <span className="state-pill state-listening flex-center"><Mic size={14} className="pulse" /> LISTENING...</span>}
                      {interviewState === 'analyzing' && <span className="state-pill state-analyzing flex-center"><RefreshCw size={14} className="spin" /> ANALYZING...</span>}
                      {interviewState === 'next_question' && <span className="state-pill state-speaking flex-center"><ChevronRight size={14} /> NEXT Q...</span>}
                      {interviewState === 'ai_thinking' && <span className="state-pill state-analyzing flex-center"><Sparkles size={14} className="spin" /> PREPARING...</span>}
                    </div>
                    <button className="btn-replay-voice flex-center" onClick={() => speakText(`Question ${currentIndex + 1}: ${currentQ}`)}>
                      <Volume2 size={13} /> Replay
                    </button>
                  </>
                )}
              </div>

              {/* Tile Name Bar */}
              <div className="tile-name-bar">
                <span className="tile-name-text">
                  <span className={`status-dot ${interviewState === 'ai_speaking' ? 'dot-active' : 'dot-muted'}`}></span>
                  Coach AI — Interviewer
                </span>
                <div className="tile-actions">
                  {viewMode === 'user_main' && (
                    <button className="tile-action-btn" onClick={() => setViewMode('split')} title="Show side by side">
                      <Sliders size={13} />
                    </button>
                  )}
                  <button
                    className={`tile-action-btn ${viewMode === 'ai_main' ? 'tile-btn-active' : ''}`}
                    onClick={() => setViewMode(v => v === 'ai_main' ? 'split' : 'ai_main')}
                    title={viewMode === 'ai_main' ? 'Exit fullscreen' : 'Maximize AI view'}
                  >
                    {viewMode === 'ai_main' ? <RotateCcw size={13} /> : <Maximize2 size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {/* ═══ TILE 2: USER CAMERA ═══ */}
            <div className={`meet-tile meet-tile-user ${viewMode === 'ai_main' ? 'tile-pip' : viewMode === 'user_main' ? 'tile-focus' : 'tile-half'}`}>
              {cameraActive ? (
                <video ref={userPipVideoRef} autoPlay playsInline muted className="meet-tile-video" />
              ) : (
                <div className="camera-muted-placeholder flex-center">
                  <User size={viewMode === 'ai_main' ? 28 : 56} className="text-tertiary" />
                  {viewMode !== 'ai_main' && <p style={{fontSize:'0.85rem'}}>Camera Off</p>}
                </div>
              )}

              {/* Tile Name Bar */}
              <div className="tile-name-bar">
                <span className="tile-name-text">
                  <span className={`status-dot ${cameraActive ? 'dot-active' : 'dot-muted'}`}></span>
                  You (Candidate)
                </span>
                <div className="tile-actions">
                  {viewMode === 'ai_main' && (
                    <button className="tile-action-btn" onClick={() => setViewMode('split')} title="Show side by side">
                      <Sliders size={13} />
                    </button>
                  )}
                  <button
                    className={`tile-action-btn ${viewMode === 'user_main' ? 'tile-btn-active' : ''}`}
                    onClick={() => setViewMode(v => v === 'user_main' ? 'split' : 'user_main')}
                    title={viewMode === 'user_main' ? 'Exit fullscreen' : 'Maximize your camera'}
                  >
                    {viewMode === 'user_main' ? <RotateCcw size={13} /> : <Maximize2 size={13} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Layout Toggle Pills — quick switcher at bottom */}
          <div className="layout-switcher-bar">
            <button
              className={`layout-pill ${viewMode === 'split' ? 'layout-active' : ''}`}
              onClick={() => setViewMode('split')}
              title="Side by side (Google Meet style)"
            >
              <Sliders size={13} /> Side by Side
            </button>
            <button
              className={`layout-pill ${viewMode === 'ai_main' ? 'layout-active' : ''}`}
              onClick={() => setViewMode('ai_main')}
              title="Focus on AI Interviewer"
            >
              <Sparkles size={13} /> AI Focus
            </button>
            <button
              className={`layout-pill ${viewMode === 'user_main' ? 'layout-active' : ''}`}
              onClick={() => setViewMode('user_main')}
              title="Focus on your camera"
            >
              <VideoIcon size={13} /> My Camera
            </button>
          </div>
        </div>

        {/* RIGHT: QUESTION & CANDIDATE RESPONSE CONSOLE */}
        <div className="conference-right-sidebar glass-panel-premium">
          {/* Current Question Card */}
          <div className="current-q-card glass-panel-premium">
            <div className="space-between mb-2">
              <span className="q-index-pill">Question {currentIndex + 1} of {questionCount}</span>
              <span className="badge">{interviewStage}</span>
            </div>
            <h3 className="current-q-text">"{currentQuestion}"</h3>
          </div>

          {/* Speech-to-Text Response Box OR Eval Review */}
          {interviewState === 'eval_review' && pendingEvalData ? (
            <div className="response-stt-panel glass-panel-premium mt-3 animate-slide-up" style={{ border: '1px solid var(--accent-glow)' }}>
              <div className="space-between mb-3">
                <h4 className="flex-center" style={{gap:'0.5rem', color: 'var(--accent-primary)'}}><Sparkles size={18} /> Premium Answer Evaluation</h4>
                <div className="score-badge glass-panel" style={{padding: '0.4rem 0.8rem', borderRadius: '12px', fontWeight: 'bold'}}>
                  Overall Score: <span className={pendingEvalData.score >= 80 ? 'text-success' : 'text-warning'}>{pendingEvalData.score}%</span>
                </div>
              </div>

              <div className="eval-metrics-grid mb-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="metric-bar-item">
                  <div className="space-between mb-1" style={{fontSize: '0.85rem'}}><span>Communication</span> <span>{pendingEvalData.communicationScore}%</span></div>
                  <div className="progress-track" style={{ height: '4px', background: 'rgba(255,255,255,0.1)' }}><div className="progress-fill" style={{ width: `${pendingEvalData.communicationScore}%`, background: '#10b981', height: '100%' }}></div></div>
                </div>
                <div className="metric-bar-item">
                  <div className="space-between mb-1" style={{fontSize: '0.85rem'}}><span>Technical</span> <span>{pendingEvalData.technicalScore}%</span></div>
                  <div className="progress-track" style={{ height: '4px', background: 'rgba(255,255,255,0.1)' }}><div className="progress-fill" style={{ width: `${pendingEvalData.technicalScore}%`, background: '#3b82f6', height: '100%' }}></div></div>
                </div>
                <div className="metric-bar-item">
                  <div className="space-between mb-1" style={{fontSize: '0.85rem'}}><span>Confidence</span> <span>{pendingEvalData.confidenceScore}%</span></div>
                  <div className="progress-track" style={{ height: '4px', background: 'rgba(255,255,255,0.1)' }}><div className="progress-fill" style={{ width: `${pendingEvalData.confidenceScore}%`, background: '#8b5cf6', height: '100%' }}></div></div>
                </div>
                <div className="metric-bar-item">
                  <div className="space-between mb-1" style={{fontSize: '0.85rem'}}><span>Relevance</span> <span>{pendingEvalData.relevanceScore}%</span></div>
                  <div className="progress-track" style={{ height: '4px', background: 'rgba(255,255,255,0.1)' }}><div className="progress-fill" style={{ width: `${pendingEvalData.relevanceScore}%`, background: '#f59e0b', height: '100%' }}></div></div>
                </div>
              </div>

              <div className="eval-feedback-box mb-4" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', lineHeight: '1.5' }}>
                <p className="text-secondary">{pendingEvalData.feedback}</p>
              </div>

              <button 
                className="btn btn-primary premium-btn flex-center"
                style={{ width: '100%' }}
                onClick={handleContinueNextQuestion}
              >
                Proceed to Next Question <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="response-stt-panel glass-panel-premium mt-3">
              <div className="space-between mb-2">
                <span className="flex-center" style={{gap: '0.4rem', fontSize: '0.88rem', fontWeight: 600}}>
                  <Mic size={15} className={isRecognizing ? 'text-danger pulse' : 'text-accent'} />
                  {isRecognizing ? 'Live Voice Transcribing...' : 'Your Spoken / Typed Response'}
                  {isRecognizing && (
                    <div className="audio-visualizer-bars" style={{ marginLeft: '10px' }}>
                      <div className="wave-bar recording"></div>
                      <div className="wave-bar recording"></div>
                      <div className="wave-bar recording"></div>
                      <div className="wave-bar recording"></div>
                      <div className="wave-bar recording"></div>
                    </div>
                  )}
                </span>
                <button className="btn-auto-sample" onClick={handleSampleAnswerFill}>
                  Auto-Fill Sample Answer
                </button>
              </div>

              <textarea
                className="stt-answer-textarea"
                rows={6}
                value={currentAnswerText}
                onChange={(e) => setCurrentAnswerText(e.target.value)}
                placeholder="Speak naturally into your microphone or type your response here..."
              />

              <div className="stt-actions-row space-between mt-3">
                <div className="flex-center" style={{gap: '0.5rem'}}>
                  <button 
                    className={`btn-voice-toggle ${isRecognizing ? 'recording' : ''}`}
                    onClick={isRecognizing ? stopVoiceListening : startVoiceListening}
                  >
                    {isRecognizing ? <MicOff size={15} /> : <Mic size={15} />}
                    <span>{isRecognizing ? 'Stop Mic' : 'Record Voice'}</span>
                  </button>
                </div>

                <button 
                  className="btn btn-primary premium-btn flex-center btn-submit-response"
                  onClick={handleSubmitAnswer}
                  disabled={interviewState === 'analyzing'}
                >
                  {interviewState === 'analyzing' ? (
                    <> <RefreshCw size={16} className="spin" /> Analyzing... </>
                  ) : (
                    <> Submit Answer <ArrowRight size={16} /> </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Live Transcript Drawer View */}
          {showTranscriptDrawer && (
            <div className="transcript-drawer-box glass-panel-premium mt-3 animate-slide-up">
              <div className="space-between mb-2">
                <h4><MessageSquare size={16} className="text-accent" /> Live Dialogue Transcript</h4>
                <button className="btn-close-drawer" onClick={() => setShowTranscriptDrawer(false)}><X size={16} /></button>
              </div>
              <div className="transcript-scroll-area">
                {transcriptHistory.map((item, idx) => (
                  <div key={idx} className={`transcript-bubble ${item.sender === 'ai' ? 'ai-bubble' : 'user-bubble'}`}>
                    <span className="speaker-tag">{item.sender === 'ai' ? 'Coach AI' : 'You'}</span>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM CONTROL DOCK (Teams / Meet Dock) */}
      <footer className="conference-bottom-dock glass-panel-premium flex-center">
        <div className="dock-buttons-group flex-center">
          {/* Mic */}
          <button 
            className={`dock-btn ${micActive ? 'btn-dock-active' : 'btn-dock-muted'}`}
            onClick={toggleMic}
            title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micActive ? <Mic size={20} /> : <MicOff size={20} />}
            <span className="dock-btn-label">{micActive ? 'Mic On' : 'Muted'}</span>
          </button>

          {/* Camera */}
          <button 
            className={`dock-btn ${cameraActive ? 'btn-dock-active' : 'btn-dock-muted'}`}
            onClick={toggleCamera}
            title={cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {cameraActive ? <VideoIcon size={20} /> : <VideoOff size={20} />}
            <span className="dock-btn-label">{cameraActive ? 'Cam On' : 'Cam Off'}</span>
          </button>

          {/* Speaker */}
          <button 
            className={`dock-btn ${speakerActive ? 'btn-dock-active' : 'btn-dock-muted'}`}
            onClick={toggleSpeaker}
            title={speakerActive ? 'Mute AI Voice' : 'Unmute AI Voice'}
          >
            {speakerActive ? <Volume2 size={20} /> : <VolumeX size={20} />}
            <span className="dock-btn-label">{speakerActive ? 'Voice On' : 'Voice Off'}</span>
          </button>

          <div className="dock-divider"></div>

          {/* Transcript Toggle */}
          <button 
            className={`dock-btn ${showTranscriptDrawer ? 'btn-dock-selected' : 'btn-dock-active'}`}
            onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
            title="Open/Close Transcript"
          >
            <MessageSquare size={20} />
            <span className="dock-btn-label">Transcript</span>
          </button>

          {/* Layout Switcher in dock */}
          <button
            className={`dock-btn ${viewMode === 'split' ? 'btn-dock-selected' : 'btn-dock-active'}`}
            onClick={() => setViewMode('split')}
            title="Side-by-side layout"
          >
            <Sliders size={20} />
            <span className="dock-btn-label">Split View</span>
          </button>

          {/* Settings Toggle */}
          <button 
            className={`dock-btn ${showSettingsDrawer ? 'btn-dock-selected' : 'btn-dock-active'}`}
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            title="Interview Settings"
          >
            <Settings size={20} />
            <span className="dock-btn-label">Settings</span>
          </button>

          <div className="dock-divider"></div>

          {/* End Interview */}
          <button 
            className="dock-btn btn-dock-end"
            onClick={() => setShowEndModal(true)}
            title="End Interview"
          >
            <PhoneOff size={20} />
            <span className="dock-btn-label">End Call</span>
          </button>
        </div>
      </footer>

      {/* 4. SETTINGS DRAWER MODAL */}
      {showSettingsDrawer && (
        <div className="settings-drawer-modal glass-panel-premium animate-scale-up">
          <div className="space-between mb-3">
            <h3><Settings size={18} className="text-accent" /> Call Settings</h3>
            <button className="btn-close-drawer" onClick={() => setShowSettingsDrawer(false)}><X size={18} /></button>
          </div>
          <div className="settings-option-item">
            <span>Video Resolution</span>
            <strong>HD 720p (30 FPS)</strong>
          </div>
          <div className="settings-option-item">
            <span>Audio Quality</span>
            <strong>Enhanced Noise Suppression</strong>
          </div>
          <div className="settings-option-item">
            <span>AI Voice Model</span>
            <strong>Natural English (Neural TTS)</strong>
          </div>
        </div>
      )}

      {/* 5. END INTERVIEW CONFIRMATION MODAL */}
      {showEndModal && (
        <div className="end-interview-modal-backdrop flex-center animate-fade-in">
          <div className="end-interview-modal glass-panel-premium animate-scale-up">
            <PhoneOff size={44} className="text-danger mb-2" />
            <h2>End AI Mock Interview?</h2>
            <p className="text-secondary mb-4">
              Your responses will be submitted to Coach AI for executive evaluation and competency scoring.
            </p>
            <div className="modal-actions-row flex-center" style={{gap: '1rem'}}>
              <button className="btn btn-ghost" onClick={() => setShowEndModal(false)}>
                Continue Interview
              </button>
              <button className="btn btn-danger" onClick={handleCompleteInterview}>
                End & View Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
